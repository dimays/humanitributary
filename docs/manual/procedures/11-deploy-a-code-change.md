# 11. Deploy a code change

Purpose: This procedure tells how a code change goes from a branch to the live app, through a pull request and CI.

## Before you start

- You have a checkout of the repository, Docker Desktop, `uv`, Node and the GitHub CLI `gh`.
- The local database runs: `make db`. The gate needs it for the tests.

## Procedure

1. Make a branch in a new worktree:

   ```bash
   git fetch origin && git worktree add ../humanitributary-<name> -b <name> origin/main
   ```

   Make sure that the new folder has the branch `<name>`.
2. Change the code and add tests.
   Make sure that `make test` passes.
3. Find the guide chapters that the change touches:

   ```bash
   make check-guide
   ```

   Make sure that you read the diff that it names against each chapter.
4. Update each chapter that it names, and then stamp it:

   ```bash
   make guide-stamp CHAPTER=<chapter>
   ```

   Make sure that `make check-guide` passes.
5. If the change is a decision, write an ADR in `docs/adr/` from the template in `docs/adr/README.md`.
   Make sure that `make check-adr` passes.
6. If the change makes this manual incorrect, update the manual.
   Make sure that `make check-manual` passes.
7. Run the gate:

   ```bash
   make check-pr
   ```

   Make sure that the last line says `The gate passes`.
8. Commit the change, and push the branch:

   ```bash
   git push -u origin <name>
   ```

   Make sure that the push gives no error.
9. Open a pull request with the template `.github/pull_request_template.md`:

   ```bash
   gh pr create --fill
   ```

   Make sure that the description has each section of the template.
10. Wait for CI:

    ```bash
    gh pr checks <number> --watch
    ```

    Make sure that the check `check-pr` passes.
11. Merge the pull request on GitHub.
    Make sure that the merge goes into `main`.
12. Wait for CI on `main`. Heroku deploys `main` after CI passes on it.
    Make sure that `heroku releases -a humanitributary-staging` shows a new release.
13. Read the log of the release phase:

    ```bash
    heroku releases:output -a humanitributary-staging
    ```

    Make sure that the migrations completed without an error.
14. Get the health of the system:

    ```bash
    curl -s https://data.manyages.com/healthz
    ```

    Make sure that `"ok"` is `true`.
15. If the change touches an input of the page (`site/template.html`, `site/build.mjs`, `site/canonical.mjs`,
    `site/restructure.mjs` or `site/globe-assets.json`), publish with procedure [03](03-publish-a-release.md).
    Make sure that the check says `page changed`.

> **NOTE:** A deploy does not change the page at `/`. The page comes from the latest release. Only the images and
> `outlines.js` come from the deployed code.

> **NOTE:** Claude Code has hooks in `.claude/settings.json`. A `git commit` stops while the guide is stale. A
> `gh pr create` waits until the gate passed on the committed code.

> **CAUTION:** `heroku rollback -a humanitributary-staging` returns the app to the code and the config of the previous Heroku
> release. It does not undo a migration. If the change has a migration, correct the code with a new pull request.
