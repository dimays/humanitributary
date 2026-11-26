"""`make check-pr`: the gate before a pull request, and what CI runs (ADR 0015).

    uv run python scripts/check_pr.py             run the gate; on a pass, write the receipt
    python3 scripts/check_pr.py --receipt         did the code committed now pass? (the hook
                                                  before `gh pr create` asks this)

The guide's check runs first, since it's quick and names the chapters to
review; then the quick checks one after another (the ADRs, Django's checks,
missing migrations, the site's data, ruff when it's configured), and beside
them the test suite and the round trip, each in its own lane. The gate takes
as long as its slowest lane. Each lane's output is printed when it finishes,
a failing one's in full; the gate fails if any lane does.

A pass is written down against the exact code it passed on: the receipt,
`var/gate-receipt.json`, holds the commit and the tree of the files as they
were on disk when the gate began (committed or not, new files too). The
receipt says yes only when the commit you're about to open a pull request
from has that same tree. `var/` is per worktree, so each worktree has its own.

Standard library only (`--receipt` runs on the system's python3).
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RECEIPT = ROOT / "var" / "gate-receipt.json"
UV = ["uv", "run", "python"]
MANAGE = [*UV, "manage.py"]

FIRST = ("check-guide", [*MANAGE, "guide", "check"])


def ruff_configured() -> bool:
    text = (ROOT / "pyproject.toml").read_text(encoding="utf-8") if (ROOT / "pyproject.toml").exists() else ""
    return "[tool.ruff" in text or (ROOT / "ruff.toml").exists() or (ROOT / ".ruff.toml").exists()


def lanes() -> list[tuple[str, list[tuple[str, list[str]]]]]:
    """(lane, [(step, command)]): the steps of a lane run one after another, stopping at a failure."""
    quick = [
        ("check-adr", [sys.executable, "scripts/check_adr.py"]),
        ("django check", [*MANAGE, "check"]),
        ("makemigrations --check", [*MANAGE, "makemigrations", "--check", "--dry-run"]),
        ("site data", ["node", "site/build.mjs", "--check"]),
    ]
    if ruff_configured():
        quick.append(("ruff", ["uv", "run", "ruff", "check", "."]))
    return [
        ("quick checks", quick),
        ("tests", [("tests", [*MANAGE, "test", "--noinput"])]),
        ("roundtrip", [("roundtrip", ["make", "-s", "roundtrip"])]),
    ]


def git(*args: str, env: dict | None = None) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, env=env, capture_output=True, text=True, check=True).stdout.strip()


def tree_on_disk() -> str:
    """The tree of the code as it is on disk (committed or not, new files too, ignored ones not)."""
    with tempfile.TemporaryDirectory(prefix="gate-") as d:
        env = {**os.environ, "GIT_INDEX_FILE": str(Path(d) / "index")}
        git("read-tree", "HEAD", env=env)
        git("add", "-A", env=env)
        return git("write-tree", env=env)


def check_receipt() -> int:
    """--receipt: whether the code committed now (what a pull request would hold) passed the gate."""
    committed = git("rev-parse", "HEAD^{tree}")
    try:
        receipt = json.loads(RECEIPT.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        receipt = None
    if receipt and receipt.get("tree") == committed:
        print(f"✔ The gate passed on this code ({receipt['at']}, commit {receipt['head'][:10]}).")
        return 0
    if receipt:
        print(f"✖ The gate last passed on other code ({receipt['at']}). Run make check-pr on what you're committing.", file=sys.stderr)
    else:
        print("✖ The gate hasn't passed in this worktree yet. Run make check-pr.", file=sys.stderr)
    return 1


def run(cmd: list[str]) -> tuple[bool, str, float]:
    started = time.monotonic()
    try:
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    except OSError as e:
        return False, f"{e}\n", time.monotonic() - started
    return r.returncode == 0, r.stdout + r.stderr, time.monotonic() - started


def lane(steps: list[tuple[str, list[str]]]) -> tuple[bool, str, float]:
    out, total = "", 0.0
    for name, cmd in steps:
        ok, text, secs = run(cmd)
        out += text
        total += secs
        if not ok:
            return False, f"{out}({name} failed)\n", total
    return True, out, total


def main(argv: list[str]) -> int:
    if "--receipt" in argv:
        return check_receipt()
    started = time.monotonic()
    tree, head = tree_on_disk(), git("rev-parse", "HEAD")

    ok, out, secs = run(FIRST[1])
    if not ok:
        sys.stdout.write(out)
        print("\n✖ The guide needs review first (AGENTS.md rule 14).", file=sys.stderr)
        return 1
    print(f"✔ check-guide ({secs:.0f}s)")

    todo = lanes()
    with ThreadPoolExecutor(max_workers=len(todo)) as pool:
        futures = {name: pool.submit(lane, steps) for name, steps in todo}
        failed = []
        for name, steps in todo:
            ok, out, secs = futures[name].result()
            if ok:
                print(f"✔ {name}: {', '.join(s for s, _ in steps)} ({secs:.0f}s)")
            else:
                failed.append(name)
                print(f"\n✖ {name} ({secs:.0f}s)\n{'─' * 60}")
                sys.stdout.write(out)
                print("─" * 60)

    if not failed:
        # (the code as it was when the gate began: an edit made while it ran isn't what passed)
        RECEIPT.parent.mkdir(parents=True, exist_ok=True)
        at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        RECEIPT.write_text(json.dumps({"head": head, "tree": tree, "at": at}, indent=1) + "\n", encoding="utf-8")
    total = time.monotonic() - started
    print(f"\n{'✖ ' + ', '.join(failed) + ' failed' if failed else '✔ The gate passes'} in {total:.0f}s.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
