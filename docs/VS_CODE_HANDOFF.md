# VS Code and Codex handoff

Audited November 13, 2026. This handoff organizes existing work; it does not enable Canvas or authorize deployment. [AGENTS.md](../AGENTS.md) contains persistent working instructions; [ROADMAP.md](../ROADMAP.md) separates existing features from planned work.

## Open the existing checkout

Use the project folder whose root contains `AGENTS.md`, `ROADMAP.md`, `package.json`, `app/`, `lib/`, and `.git`. On the audited Windows workstation this is the inner **`quillora\citation-release`** folder, not the outer Quillora copy and not the Codex chat-artifact folder. The completion report supplies its exact absolute path without putting a personal workstation path into repository instructions.

```powershell
Set-Location '<absolute path to the existing quillora\citation-release checkout>'
code.cmd .
git rev-parse --show-toplevel
git status --short
git branch --show-current
git remote -v
```

Expected branch: `codex/v2-my-research-desk`. Expected origin: `https://github.com/sarahcraft1/quillora.git`. Do not clone over this folder, switch branches, reset, clean or pull/merge over the unfinished changes merely to get a clean status. Keep the staged/index state under review.

A fresh clone receives only committed work. It will not recover the unfinished Canvas files described below. Preserve the current checkout or its recovery copy when moving machines. Do not apply a recovery snapshot to an unrelated branch or newer file version without reviewing the patch and base commit.

## Runtime and dependencies

Verified locally: Node **24.14.1**, npm **11.11.0**, VS Code CLI **1.146.0**, installed Next **15.5.28**, React **19.3.1**, and the unfinished Canvas dependency `pg` **8.23.1**. Versions above describe this workstation, not a promise that every future install resolves identical unlocked ranges; `package-lock.json` is the installation authority.

```powershell
node.exe --version
npm.cmd --version
code.cmd --version

# Run only if installing/restoring dependencies. Stop this checkout's dev server first.
npm.cmd ci
```

Both the working package manifest and lockfile include unfinished `pg`/`@types/pg` changes. Keep them together. Do not delete the lockfile, run an uncontrolled update/audit fix, or commit those dependency changes as verified integration work. `npm ci --dry-run --ignore-scripts --no-audit --no-fund` passed during the audit; a full reinstall was unnecessary. The installed tree has six extraneous native/WASM support packages; this is not an absent Next installation and no cleanup was attempted during migration.

## Run the local preview

The server was already running on loopback port **3035** during the audit. The page and `/api/health` returned HTTP 200, and My Desk opened in the browser. Use the running preview now; these commands are for its next start:

```powershell
Set-Location '<absolute path to the existing checkout>'
$env:QUILLORA_ACCESS_MODE = 'local'
npm.cmd run dev -- --port 3035
```

Open **http://127.0.0.1:3035/**. Keep the terminal running; stop that server with Ctrl+C when finished. The `dev` script is `next dev --hostname 127.0.0.1`; no public bind or production configuration change is needed. Port 3035 is a command-line choice, not hardcoded production configuration. Without `--port`, Next uses its default port.

If 3035 is occupied, first check whether it is this existing preview:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3035 |
  Select-Object LocalAddress, LocalPort, OwningProcess
Invoke-WebRequest -Uri 'http://127.0.0.1:3035/api/health' -UseBasicParsing
```

Do not launch another dev server in the same checkout or stop an unrelated process. After stopping this checkout's own server, another free port can be selected with `--port 3036`. A new origin has separate browser data. Preserve the usual hostname/port when continuing existing research; `http://localhost:3035/` was used for synthetic QA and is not the same saved workspace.

## Environment boundaries

Ordinary local research preview needs the process-scoped `QUILLORA_ACCESS_MODE=local` above; it does not need Canvas credentials, a database, an OpenAI key or institutional login. The local bypass is development-only and cannot enable production access.

| Names | Status and use |
| --- | --- |
| `CF_ACCESS_ISSUER`, `CF_ACCESS_AUD`, `QUILLORA_ALLOWED_EMAILS`, `QUILLORA_PUBLIC_ORIGIN` | Existing private-pilot server access configuration; placeholder names are documented in `.env.example`. Real values require authorized operator setup. |
| `QUILLORA_CANVAS_INSTITUTIONS` | Declared by unfinished Canvas code: JSON registry of approved institution `origin`, display `name`, `clientId` and server-only `clientSecret`. Not configured or wired to routes/UI. |
| `QUILLORA_CANVAS_TOKEN_KEY` | Declared by unfinished code: base64 representation of 32 random bytes for the AES-GCM vault. Server-only; key lifecycle remains unverified. |
| `QUILLORA_DATABASE_URL` | Declared by unfinished code: PostgreSQL connection configuration. No running integration database or applied migration is established. |
| `QUILLORA_PUBLIC_ORIGIN` | Also required by the proposed Canvas config as the canonical HTTPS application origin. A localhost preview is not an institutional callback deployment. |

No real environment values were read, added or published for this handoff. Only `.env.example` was present at repository root in the audit. Do not copy its placeholder staging values into a production environment or enable Canvas by weakening its origin/authentication checks. Never use `NEXT_PUBLIC_` variables for credentials. A future Canvas configuration needs institutional developer-key approval and a registered HTTPS callback after the callback itself exists.

## Preserved unfinished Canvas work

Three tracked files remain modified: `lib/work.ts`, `package.json`, `package-lock.json`.

Nine new files remain untracked: `lib/canvas/client.ts`, `config.ts`, `errors.ts`, `import.ts`, `postgres.ts`, `repository.ts`, `types.ts`, `vault.ts`, and `db/migrations/001_canvas.sql`. The shortened Canvas filenames in this list are all under `lib/canvas/`.

These files were copied with a SHA-256 manifest and a binary-capable tracked diff against V2.6 `43f0a67` into a separate local recovery folder. Its absolute location is in the completion report. It is not a GitHub-synchronized feature or a backup of browser research. Do not publish raw recovery bundles indiscriminately, especially if future local changes contain credentials or student data.

The prior Canvas session ran an initial TypeScript check. This migration also ran `tsc --noEmit --incremental false` successfully against the preserved working tree. Neither check is OAuth, import, security, RLS or integration acceptance. No Canvas-specific tests currently exist and no real account has connected. Review backup/merge metadata behavior and missing route/service/UI wiring before continuing.

## Git continuity

At audit start GitHub's development head was `85f4a0e`; local HEAD was V2.6 `43f0a67`. `git fetch origin` corrected the stale local tracking ref. Citation branch `codex/citation-release-polish`/PR #6 remained at `c758ba0`. PRs #6 and #7 were both open drafts.

The migration commit should contain only `AGENTS.md`, `ROADMAP.md`, this handoff and the README pointer; the already verified V2.6 parent is pushed with it. Review the staged diff explicitly, use normal push to the existing development branch, then compare local and remote SHAs. Leave all unfinished Canvas files unstaged and preserve their original contents. Keep both PRs in draft; no merge, force push, duplicate PR or deployment.

The existing GitHub workflow can run tests/build automatically after a push. This migration does not request manual full-suite reruns or change the workflow. Distinguish observed CI results from local readiness checks.
