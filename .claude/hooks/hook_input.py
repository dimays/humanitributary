"""What a Claude Code hook was asked about, from the JSON on its stdin.

`python3 hook_input.py git commit` prints three lines: the folder to check,
the `git commit` the command really runs (its words, or a blank line if it
runs none), and the whole command on one line.

The folder is the one the command runs in: the hook's `cwd`, or the folder a
leading `cd <dir> &&` (or `git -C <dir>`) moves to. Not $CLAUDE_PROJECT_DIR:
a session working in a worktree has its project folder elsewhere (often the
main checkout), and the gate's receipt and the guide's stamps belong to the
worktree.

"Really runs" means a program at the start of a command, after `&&`, `||`,
`;`, `|` or a newline, or inside `$( )`: never words inside quotes, a
heredoc's body or a comment. A heredoc that writes a file mentioning
`git commit` isn't a commit.

Standard library only, run with the system's python3: no uv, no Django.
"""

from __future__ import annotations

import json
import os
import re
import sys


def commands(src: str) -> list[list[str]]:
    """The simple commands a shell command runs, each as its words, quotes taken off."""
    out: list[list[str]] = []
    # A frame per level of `$( )` or backticks: its words so far, its quote.
    f = {"words": [], "word": None, "quote": None, "close": None, "depth": 0}
    stack: list[dict] = []
    heredocs: list[str] = []

    def add(s: str) -> None:
        f["word"] = (f["word"] or "") + s

    def end_word() -> None:
        if f["word"] is not None:
            f["words"].append(f["word"])
            f["word"] = None

    def end_cmd() -> None:
        end_word()
        if f["words"]:
            out.append(f["words"])
        f["words"] = []

    def open_(close: str) -> None:
        nonlocal f
        stack.append(f)
        f = {"words": [], "word": None, "quote": None, "close": close, "depth": 0}

    def shut() -> None:
        nonlocal f
        end_cmd()
        f = stack.pop()
        add("$()")

    i, n = 0, len(src)
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if f["quote"] == "'":
            if c == "'":
                f["quote"] = None
            else:
                add(c)
            i += 1
            continue
        if f["quote"] == '"':
            if c == '"':
                f["quote"] = None
                i += 1
            elif c == "\\":
                add(nxt)
                i += 2
            elif c == "$" and nxt == "(":
                open_(")")
                i += 2
            elif c == "`":
                open_("`")
                i += 1
            else:
                add(c)
                i += 1
            continue
        if c == "\\":
            if nxt != "\n":
                add(nxt)
            i += 2
            continue
        if c in "'\"":
            f["quote"] = c
            add("")
            i += 1
            continue
        if c == "#" and f["word"] is None:
            while i < n and src[i] != "\n":
                i += 1
            continue
        if c == "`":
            if f["close"] == "`":
                shut()
            else:
                open_("`")
            i += 1
            continue
        if c == "$" and nxt == "(":
            open_(")")
            i += 2
            continue
        if c == "(":
            end_cmd()
            f["depth"] += 1
            i += 1
            continue
        if c == ")":
            if f["close"] == ")" and f["depth"] == 0:
                shut()
            else:
                end_cmd()
                f["depth"] = max(0, f["depth"] - 1)
            i += 1
            continue
        if c == "<" and nxt == "<" and src[i + 2: i + 3] != "<":
            # A heredoc: its delimiter now, its body skipped from the next newline.
            end_word()
            m = re.match(r"<<-?[ \t]*(?:'([^']*)'|\"([^\"]*)\"|\\?([^\s;&|<>()]+))", src[i:])
            if m:
                heredocs.append(m.group(1) or m.group(2) or m.group(3))
                i += len(m.group(0))
            else:
                i += 2
            continue
        if c == "\n":
            end_cmd()
            i += 1
            while heredocs:
                delim = heredocs.pop(0)
                while i < n:
                    end = src.find("\n", i)
                    line = src[i:] if end < 0 else src[i:end]
                    i = n if end < 0 else end + 1
                    if line.strip() == delim:
                        break
            continue
        if c in ";&|":
            end_cmd()
            i += 1
            continue
        if c in " \t\r":
            end_word()
            i += 1
            continue
        add(c)
        i += 1
    while stack:
        shut()
    end_cmd()
    return out


# Words before the program that don't change which program it is.
LEAD = {"{", "}", "!", "if", "then", "else", "elif", "do", "while", "until", "time", "command", "env", "nohup", "exec"}
# Each program's options that take the next word as their value.
VALUED = {"git": ["-C", "-c", "--git-dir", "--work-tree", "--namespace"], "gh": ["-R", "--repo"]}


def invocation(src: str, program: str, *subs: str) -> list[str] | None:
    """The words of the first command in `src` that runs `program sub…` (`git commit`), or None."""
    for words in commands(src):
        k = 0
        while k < len(words) and (words[k] in LEAD or re.match(r"^[A-Za-z_]\w*=", words[k])):
            k += 1
        if k >= len(words) or words[k].split("/")[-1] != program:
            continue
        valued = VALUED.get(program, [])
        positional: list[str] = []
        j = k + 1
        while j < len(words) and len(positional) < len(subs):
            if words[j].startswith("-"):
                if words[j] in valued:
                    j += 1
            else:
                positional.append(words[j])
            j += 1
        if positional == list(subs):
            return words[k:]
    return None


def folder(command: str, cwd: str, run: list[str] | None) -> str:
    """Where the command runs: a leading `cd <dir> &&`, else `git -C <dir>`, else the hook's cwd."""
    d = cwd
    m = re.match(r"^\s*cd\s+(?:\"([^\"]+)\"|'([^']+)'|([^\s;&|]+))\s*&&", command)
    if m:
        to = os.path.expanduser(m.group(1) or m.group(2) or m.group(3))
        full = to if os.path.isabs(to) else os.path.normpath(os.path.join(d, to))
        if os.path.isdir(full):
            d = full
    if run and run[0].split("/")[-1] == "git" and "-C" in run:
        at = run.index("-C")
        if at + 1 < len(run):
            to = os.path.expanduser(run[at + 1])
            full = to if os.path.isabs(to) else os.path.normpath(os.path.join(d, to))
            if os.path.isdir(full):
                d = full
    return d


def main(argv: list[str]) -> None:
    program, subs = (argv[0], argv[1:]) if argv else (None, [])
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        data = {}
    command = str((data.get("tool_input") or {}).get("command") or "")
    cwd = data.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or "."
    run = invocation(command, program, *subs) if program else None
    line = lambda s: s.replace("\n", " ")  # noqa: E731
    sys.stdout.write(f"{folder(command, cwd, run)}\n{line(' '.join(run or []))}\n{line(command)}\n")


if __name__ == "__main__":
    main(sys.argv[1:])
