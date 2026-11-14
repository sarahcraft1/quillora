# Canvas Reader MVP

V2.7 adds an optional, manually refreshed Canvas reader behind verified Cloudflare Access identity. The personal-token path is for controlled testing; Canvas requires OAuth for multi-user applications. This is not a public account system or a submission integration. Research, preferences and Quick Notes remain in their existing browser namespaces.

## Student flow

Open **Workspace settings → Connect Canvas**. Enter an enabled institution's HTTPS Canvas address and a personal access token only if that institution permits personal tokens. Quillora checks the current Canvas user, reads active student courses, and reads upcoming and undated assignments. Review class matches and optional links to existing research workspaces before saving the import.

**Refresh Canvas** retrieves a complete new snapshot; **Review courses & workspaces** applies it through the existing conflict-aware research save. A failed refresh leaves the previous snapshot and last successful sync time intact. Repeated imports reuse institution/course/assignment IDs. Locally edited assignment titles, due dates, class choices, questions, notes, sources and checked requirements are preserved. New Canvas instructions remain available alongside saved research.

**Disconnect** removes Quillora's encrypted token and snapshot from its primary database. Imported classes, assignments and research stay in the browser. Reconnect with a new token when needed. Disconnect does not revoke a personal token at Canvas because the same token may serve other applications; revoke it in Canvas yourself if desired. Database backup retention is an operator responsibility.

Quillora's reader makes GET requests only. A personal token can itself grant broader Canvas permissions: the reader cannot reduce those permissions. Use a short expiration and your institution's approved process. Canvas's [official manual-token guidance](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth#manual-token-generation) reserves this mechanism for testing and requires OAuth for applications used by multiple users. Institutional availability of tokens alone is not authorization to collect students' tokens. An approved OAuth flow for student rollout is not implemented by this MVP.

## Server setup required

Do not enable credential persistence with `QUILLORA_ACCESS_MODE=local`. That mode deliberately shares an identity and the reader refuses token operations. The pilot must have working signed Cloudflare Access verification, an allowlisted pilot membership and a canonical HTTPS application origin before Canvas can connect. Owners are derived from verified issuer/subject claims, never from submitted IDs or email strings alone.

Configure these server-only variables through an authorized operator workflow. Commit placeholders only:

| Variable | Required value |
| --- | --- |
| `CF_ACCESS_ISSUER`, `CF_ACCESS_AUD`, `QUILLORA_ALLOWED_EMAILS` | Existing verified pilot gate configuration. |
| `QUILLORA_PUBLIC_ORIGIN` | Exact canonical HTTPS Quillora origin. |
| `QUILLORA_CANVAS_INSTITUTIONS` | JSON array of approved `{ "origin": "https://canvas.example.edu", "name": "Example institution", "personalTokens": true }` entries. Register only public HTTPS Canvas origins whose institutions permit this flow. User input cannot add destinations. |
| `QUILLORA_CANVAS_TOKEN_KEY` | Canonical base64 encoding of 32 cryptographically random bytes, stored outside Git and browser bundles. Losing/changing it makes existing encrypted credentials unreadable; plan reconnection and key rotation. |
| `QUILLORA_DATABASE_URL` | PostgreSQL runtime connection string for the identified Canvas database. TLS certificate verification is required except development loopback. |

An authorized operator must review and apply [001_canvas.sql](../db/migrations/001_canvas.sql) to an identified database using a migration role. No migration runs automatically. Grant the runtime role only the necessary SELECT/INSERT/UPDATE/DELETE access to the three Canvas tables and schema usage. The runtime role must have neither SUPERUSER nor BYPASSRLS. Each repository operation checks those properties and requires enabled, forced owner RLS before proceeding. Runtime transactions set a local owner context and also include explicit owner predicates.

No durable in-memory fallback is supplied. A missing configuration, database, migration or safe runtime role must be fixed by the operator rather than bypassed. Do not expose an unauthenticated Next origin as a substitute for the pilot gate.

## Data and request boundaries

- Token input is sent in a same-origin JSON request body, cleared from the form, and never placed in local storage, URLs, research backups or returned DTOs. Tokens and server snapshots use AES-256-GCM authenticated by owner, institution origin and purpose.
- Canvas routes re-verify signed identity. Mutations also validate the canonical origin and the tab's expected namespace, reject stale sessions, bound request bodies and rate-limit per owner.
- Connection epochs prevent a slow connection attempt from resurrecting a disconnected/replaced connection. Sync leases and generation checks prevent stale refreshes from overwriting a reconnect. The whole refresh has a deadline and is committed atomically.
- Requests use bearer headers, reject redirects and off-origin or off-endpoint pagination, cap pages/data/requests, and return fixed errors rather than provider bodies. HTML descriptions are reduced to text and React renders them as text.
- Canvas submission status is informational when supplied. It does not check Quillora requirements, mark local work complete or submit anything.
- Existing research remains local and is not automatically assigned to a different account. Academic JSON backups include imported Canvas metadata but never the credential; they still exclude Quick Notes.

## Verification and remaining acceptance

Validation on November 13, 2026:

| Check | Observed result |
| --- | --- |
| Canvas client/import tests | 12 passed, including 64-bit string IDs, API boundaries, time zones, repeat import, edited fields and backup metadata. |
| Mocked server/vault/HTTP/SQL contract tests | 10 passed, including owner isolation, tampering, stale sessions, sync/reconnect/disconnect races and unsafe runtime role rejection. |
| JSDOM reader/Home integration | 10 passed, including connection errors, empty states, token clearing, review/linking, save conflicts, session switching and disconnect preservation. Two affected identity cases were rechecked after hiding stale status. |
| Existing affected backup/import/merge regressions | 16 passed. |
| Selected existing navigation/session checks | 3 passed. An additional search-race check failed before issuing search: its old storage-UI harness looks for literal `Search`, while the baseline sidebar already says `Research`. Both mismatched strings are present at pre-V2.7 HEAD `7a8ecb7`; this unrelated harness was not changed. |
| TypeScript | Passed project-wide. |
| Browser bundle boundary | Passed: no Canvas credential, database, server-service or API-client modules in the Home browser bundle. |
| Running local Next API | GET status 200 with account-required/unavailable; credential POST rejected with HTTP 401. |
| Whitespace | `git diff --check` passed. |

The V2.7 regression checks use synthetic HTTP responses, repository doubles and JSDOM. These can verify API boundaries, owner binding, races, import preservation and UI behavior; they do not establish institutional permission, PostgreSQL/RLS correctness or actual browser layout.

This workstation has no verified running PostgreSQL target. Docker's daemon could not be reached. No migration was applied, database provisioned, real token requested or real Canvas account connected. Computer use also stopped because it could not determine the current browser URL confidently enough to enforce policy; rendered screenshots could not be inspected. Desktop, 320/375/430/768/1024px, all themes, keyboard and physical-device visual acceptance remain required.

Before a student rollout: implement approved OAuth authorization and validate SQL/RLS with two verified owners and a non-bypass runtime role; check reconnect/disconnect/lease contention against that database; connect a permitted institutional test account; verify pagination, overrides, empty courses, missing deadlines and expired tokens; inspect the actual layouts and recovery messages. Public sign-up/account deletion, operational retention, rotation, backups and hosting remain separate launch work. No merge or deployment is authorized by this change.

## Official API references

The reader uses [Canvas courses](https://developerdocs.instructure.com/services/canvas/resources/courses), [assignments and requester submissions](https://developerdocs.instructure.com/services/canvas/resources/assignments), [current-user lookup](https://developerdocs.instructure.com/services/canvas/resources/users), and [Link pagination](https://developerdocs.instructure.com/services/canvas/basics/file.pagination). Personal-token availability and expiration depend on the institution; see [Canvas authentication](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth).
