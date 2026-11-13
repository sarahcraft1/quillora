# Quillora development instructions

## Start with the existing project

Quillora is an academic research application intended to serve independent students from different institutions. Inspect the relevant implementation, Git status, and [ROADMAP.md](ROADMAP.md) before changing code. Read [docs/VS_CODE_HANDOFF.md](docs/VS_CODE_HANDOFF.md) when resuming the unfinished Canvas work. Instructions here apply throughout this repository; task-specific user instructions take precedence.

Reuse current components, data structures, assets, and styling. Prefer small, reviewable changes over rewrites. Avoid unnecessary dependencies, unrelated cleanup, blanket spacing changes, and repeating successful checks for untouched behavior. Do not start a new major feature before the Canvas integration is completed or explicitly reprioritized by the user.

## Actual architecture

This is a single Next.js App Router project using TypeScript and React. There is no separate deployed backend or complete public account system.

| Path | Responsibility |
| --- | --- |
| `app/page.tsx`, `middleware.ts` | Dynamic entry point and access gate; pass the verified storage namespace into the client workspace. |
| `app/home.tsx` | Main client workspace, navigation, assignment editing, research requests, citations, saves, recovery, and session checks. |
| `app/research-desk.tsx`, `app/desk-homebase.tsx`, `lib/desk*.ts` | My Desk and Classes, resume/deadline/progress projections, classes and assignment organization. |
| `app/research-navigation.tsx`, `app/evidence-board.tsx`, `lib/evidence.ts` | Assignment research areas, focus mode, source notebooks, reading status and evidence groups. |
| `app/personalize.tsx`, `app/desk-buddy.tsx`, `app/desk-ornament.tsx`, `lib/workspace.ts`, `lib/buddy-dialogue.ts` | Appearance preferences, staged previews, buddy behavior and desk decorations. |
| `app/quick-notes.tsx`, `lib/quick-notes.ts` | Separate persistent scratchpad. |
| `lib/work.ts`, `lib/storage.ts`, `app/backup.tsx` | Research document validation, merging, local persistence, backup and recovery. |
| `lib/scholarly.ts`, `lib/extraction.ts`, `lib/citations.ts`, `lib/citation-copy.ts`, `lib/source-quality.ts` | Crossref metadata, rubric extraction, citation formatting/copying and source-quality disclosure. |
| `app/api/{search,rubric,session,health}/route.ts` | Existing server routes. There are currently no Canvas API routes. |
| `lib/access.ts`, `lib/access-gate.ts` | Cloudflare Access pilot identity verification and origin checks. |
| `lib/canvas/`, `db/migrations/001_canvas.sql` | Unfinished local V2.7 code; see the status distinction below. These paths are not in the synchronized baseline until separately reviewed and committed. |
| `public/buddies/` | Original Quill, Inky, Sprig and Folio animation/still assets. |
| `tests/`, `tests/fixtures/`, `scripts/` | Node/tsx tests, JSDOM UI checks, frozen research fixtures and opt-in integration/recovery tooling. |
| `docs/`, `.github/workflows/ci.yml` | Historical acceptance reports/screenshots and existing GitHub CI. Check report dates and commit scope before citing them as current evidence. |

Styles are imported in `app/layout.tsx`: `globals.css`, `desk-design.css`, `desk-home.css`, `workspace-spacing.css`, then `quick-notes.css`. Respect selector specificity and import order. Shared spacing tokens belong in `workspace-spacing.css`; diagnose layout structure before adding padding.

## Environment and commands

Use Node.js 24 and npm. On Windows, prefer `npm.cmd` and `npx.cmd` when PowerShell script execution policy blocks the corresponding `.ps1` wrappers. Do not change execution policy.

Run commands from the folder containing this `AGENTS.md`, `package.json`, `app/`, and `lib/`. An outer folder may contain another copy of Quillora; verify `git rev-parse --show-toplevel` rather than assuming it is the project.

```powershell
# Only when dependencies need restoration; stop this checkout's dev server first.
npm.cmd ci

# Routine local preview; the dev script already binds to 127.0.0.1.
$env:QUILLORA_ACCESS_MODE = 'local'
npm.cmd run dev -- --port 3035
```

Open `http://127.0.0.1:3035/`. Reuse an existing healthy server rather than launching a duplicate. If the port is occupied, identify its owner before choosing another port; do not kill unrelated processes. Changing hostname or port changes the browser storage origin and can make research appear missing. `localhost` and `127.0.0.1` do not share saved research.

`next.config.mjs` separates development output (`.next-dev`) from production output (`.next`). Do not run simultaneous dev servers in the same checkout/output directory. `npm run build` and `npm start` exist, but a routine documentation/UI task does not require a production build. No deployment is authorized by these instructions.

## Preserve academic functionality and data

- Preserve Crossref discovery, PDF/DOCX rubric extraction, saved original source metadata, assignment details, manually checked requirements, source-attributed notes/evidence, reading status, citation dialogs, and rich/plain/manual copy recovery.
- Citation support has documented limits. Do not claim all citation styles/source types, peer review, full-text availability, or WCAG compliance have been certified.
- My Desk, Classes and Research are the three main destinations. Assignment areas reuse Overview, Discover, Sources & citations, Notes & evidence and Reading shelf. Preserve resume behavior and unsaved-edit/save-conflict guards.
- Research is a browser-local `Work` document. Use the existing validation, compare-before-write, Web Locks coordination, version-1 backup and non-destructive merge paths. Never clear site data, replace research, silently assign legacy work to an account, or discard uncommitted changes to make a task easier.
- Preferences are separate at `storageKey + ':preferences'`. Preserve Scholarly, Bookish and After Hours, motto/bulletin/identity, presets, staged Apply/Discard and Return to default. New optional preferences must remain compatible with saved values.
- Quick Notes uses `storageKey + ':quick-notes'`, a separate versioned scratchpad with a 20,000-character limit. Keep autosave, conflict/error recovery, copy, clear confirmation, minimize and Escape behavior. Academic backups do not include this scratchpad; preserve that disclosure.
- Buddy animation is optional, has still-image/reduced-motion support, and must not obscure research or invent academic accomplishments.

## Multi-user and Canvas boundaries

The current pilot gate verifies signed Cloudflare Access claims and derives a namespace from issuer and subject. Local mode deliberately uses a shared `quillora-work:local` namespace and is permitted only in development. Browser namespaces are not a server account database, encryption boundary, public sign-up system, or cross-device synchronization service.

All new account/integration work must isolate independent users. Derive ownership from a verified server identity. Never authorize through a submitted owner ID, an email string alone, an unverified header, or a browser storage key. Reject stale-session operations. Keep browser research, preferences, and scratchpads separate per identity and preserve explicit migration/recovery choices.

Unfinished V2.7 includes Canvas DTOs/import helpers, a bounded read client, configuration/error handling, AES-256-GCM vault helpers, a repository interface, a PostgreSQL adapter and a draft RLS migration. Its existence is not evidence of a working OAuth connection. No service orchestration, callback/routes, connection UI, or Canvas-specific test suite currently connects these pieces.

When Canvas development is resumed:

- Use institution-approved OAuth2 developer keys for each supported HTTPS Canvas origin. Do not hardcode a university, student account, course, assignment, or credential. Never ask students to paste personal access tokens as the multi-user connection flow.
- Handle secrets/tokens only on the server. Never send them to browser storage, client bundles, URLs, logs, screenshots, backups or Git. Keep crypto/database modules out of client imports.
- Implement short-lived, one-use OAuth state bound to the verified user and an HttpOnly secure cookie; verify the callback and prevent replay, CSRF, account switching and arbitrary redirects.
- Use the registered institution allowlist, least-privilege read scopes, request limits and safe pagination. Do not submit assignments, write grades or modify Canvas course content. Disconnect may revoke this application's OAuth authorization.
- Preserve stable institution/course/assignment IDs and original links. Test matching, repeat imports, edited local fields, due-date time zones, malformed responses, interrupted refreshes and research preservation. Review `mergeWork` metadata comparisons before enabling imports.
- Validate encrypted owner/origin/purpose binding and PostgreSQL RLS with a non-superuser, non-BYPASSRLS runtime role. Never apply a migration to an existing database as part of ordinary setup without an identified, authorized target.
- Verify refresh-token persistence, sync leases, disconnect/reconnect races, session handling and deletion/retention boundaries. Do not provide a production in-memory fallback or silently use the shared local identity for credentials.
- Document missing identity/database services, institutional approvals, account deletion and public-launch requirements honestly. No real Canvas authorization or database integration has been verified yet.

Environment variable names are documented in [docs/VS_CODE_HANDOFF.md](docs/VS_CODE_HANDOFF.md). Only placeholder templates may be committed. Do not change production configuration, operating-system security, repository visibility, permissions or credentials to bypass a restriction.

## Responsive, accessibility and browser verification

Preserve the cozy academic direction without making decorations compete with work. Check affected layouts at 320, 375, 430, 768, 1024px and desktop. Retain readable wrapping, consistent accent clearance, shrinkable grid/flex children, accessible labels, keyboard focus, reduced motion and unobstructed navigation. Quick Notes is a reserved desktop dock or a focus-contained smaller-screen sheet; closing it restores focus after its launcher becomes visible.

The user explicitly authorizes routine use of available screen, browser and computer controls to inspect and test Quillora: opening the local preview, navigating, clicking controls, checking desktop/mobile layouts and error states, and capturing screenshots. Do this without repeated permission requests for ordinary inspection. Use synthetic data or an isolated origin for changes to test data; keep real research and credentials out of published screenshots. This authorization does not extend to deployment, purchases, credential/security changes or unrelated external actions.

For visual changes, inspect actual rendered screenshots, not only DOM measurements or tests. Capture before/after evidence for confirmed collisions. Report exactly which themes, widths, states and devices were checked. If screen access fails, report the limitation; do not claim visual verification from automated checks alone.

## Proportionate validation

Run checks for affected behavior. Existing examples:

```powershell
node.exe --import tsx --test tests/quick-notes.test.ts
node.exe --import tsx --test --test-name-pattern='opening an assignment|phone destinations' tests/research-desk.test.ts
npx.cmd tsc --noEmit --incremental false
git diff --check
```

Choose the relevant cases, not this whole list by default. `npm test` runs all `tests/*.test.ts`; use it only when the scope warrants it. Do not add tests that merely repeat implementation details. Label mocked Canvas checks separately from live institutional/SQL verification. Do not refresh scholarly fixtures or run network acquisition as routine testing. The existing CI may run its full checks automatically after a push; do not describe those as passed before observing their results.

## Git and pull request discipline

Repository: `https://github.com/sarahcraft1/quillora.git`. Current development branch: `codex/v2-my-research-desk`. V2.6 checkpoint: `43f0a67`.

At session start, inspect status, branches, remotes, recent commits and applicable instructions. Fetch before comparing with GitHub; tracking references may be stale. Preserve unrelated edits and untracked Canvas files. Stage explicit reviewed paths rather than `git add .` in a dirty checkout. Type-checking partial Canvas code does not make it ready to commit as a completed feature.

When the user authorizes synchronization, make descriptive logical commits and normal fast-forward pushes to the existing development branch. Confirm the remote SHA after pushing. Keep [PR #7](https://github.com/sarahcraft1/quillora/pull/7) in draft and separate from citation [PR #6](https://github.com/sarahcraft1/quillora/pull/6), also draft. Do not create duplicate branches/PRs, mark ready, merge into main, deploy, force-push, reset/rewrite history or overwrite remote work without explicit authorization. On divergence, inspect and report it rather than improvising a destructive recovery.

Review staged content for secrets and private student data. Do not commit `.env` values, tokens, private exports or local recovery bundles. Respect `.gitignore` and [the historical privacy assessment](docs/HISTORY_PRIVACY_RISK.md); a safe new commit does not sanitize existing history. If credentials/permissions block a push, retain local commits and report the exact failed action and recovery steps without changing security settings.

Repository-root instructions follow the [official Codex AGENTS.md guidance](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide#using-agentsmd). Keep this document aligned with inspected code, not planned architecture.
