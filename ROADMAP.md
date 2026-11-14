# Quillora roadmap

Status audited November 13, 2026. This is a development-continuity record, not a public-release certification. Read [AGENTS.md](AGENTS.md) before edits and [the VS Code handoff](docs/VS_CODE_HANDOFF.md) for local startup and the preserved working tree.

## Completed and verified features

The established application provides:

- Crossref scholarly-source discovery, original DOI links, saved sources, PDF/DOCX rubric extraction, assignment editing and manually checked requirements.
- Source-attributed notes, evidence groups, reading status and citation display/copy with recovery paths. Existing citation acceptance reports describe supported cases and unresolved formats; broad citation correctness is not certified.
- My Desk, Classes and Research, contextual assignment areas, resume/current-work links, deadlines and encouraging manual progress.
- Scholarly, Bookish and After Hours; names, desk identity, motto, bulletin, curated ornaments, staged Apply/Discard, presets and original desk buddies.
- Persistent Quick Notes separate from academic research, autosave/recovery/copy/clear confirmation, a desktop dock, smaller-screen sheet and keyboard focus restoration.
- Validated browser-local research, conflict-aware saves, explicit recovery and version-1 backup/merge behavior. Browser-local data is not a complete account system.

### Evidence and scope

V2.6 is preserved in **`43f0a67`**, following V2.5 **`85f4a0e`**. Its [layout review](docs/design-review/v26-collisions/review.md) and [screenshot gallery](docs/design-review/v26-collisions/index.html) document eight before/after comparisons, all three themes, phone widths 320/375/430, tablet and desktop views, source/evidence panels, personalization and Quick Notes. Fifteen affected cases passed in that review; eleven Quick Notes/navigation cases were rechecked after the focus correction. TypeScript and whitespace checks passed then. These are prior results, not new full-suite runs for this migration.

The migration audit confirmed the current local preview returns HTTP 200 and opens in a browser. The installed dependency check, locked-install dry run and current TypeScript readiness check passed. Six extraneous native/WASM support packages remain installed; no cleanup was attempted. The audit did not repeat full feature tests, a production build, or the complete responsive/theme matrix. Type-checking the working tree does not verify the unfinished Canvas integration.

## V2.7 Canvas Reader ? implemented, live acceptance blocked

The optional reader now connects the preserved client, encrypted repository and import logic through Workspace settings, authenticated APIs and My Desk. See [Canvas Reader setup and acceptance](docs/CANVAS_READER.md). This is a read-only, manually refreshed reader; it does not submit assignments, write grades or modify Canvas content.

Delivered code:

- Verified-owner `GET/POST/DELETE /api/canvas` and `POST /api/canvas/refresh`; canonical-origin and stale-session checks, request limits and no-store DTOs.
- Operator-registered HTTPS institutions and personal-token validation against the current-user API. Tokens and server snapshots are encrypted per verified owner/origin/purpose in PostgreSQL. Shared local-development identity refuses credentials; there is no production memory fallback.
- Active student courses, upcoming and undated published assignments, plain descriptions, course-zone deadlines, requester submission state when available and original Canvas assignment links. Pagination, response limits and whole-refresh failure handling are bounded.
- Workspace settings connect/reconnect/disconnect; My Desk cards, Refresh Canvas and last successful sync. Review course matches and create/link research workspaces before one conflict-aware local save.
- Stable external-ID matching, repeat-import reuse, preservation of local edits/research, and Canvas metadata in version-1 backups/non-destructive merges. Refresh never deletes older imported research when an assignment becomes past or disappears. Disconnect deletes the server copy and snapshot while keeping imported research.
- Synthetic client, vault, service, HTTP, import and JSDOM checks, plus affected existing backup/merge regressions. See the reader guide for exact evidence and limitations.

The user requested personal-token support where permitted, superseding the earlier OAuth-only implementation plan. **Canvas's official guidance limits manually generated tokens to testing and requires OAuth for applications used by multiple users.** A token-enabled institution alone does not establish permission to collect student tokens. This flow is a controlled testing path; institutional/public rollout remains blocked on an approved OAuth connection. [Official guidance](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth#manual-token-generation).

### Verification boundaries

- Mocked checks establish behavior against synthetic API responses and repository doubles, not live institutional authorization or SQL/RLS correctness.
- TypeScript and a browser bundling check pass. The browser bundle contains no Canvas vault, database, server service or API-client modules. The running local Next route returns unavailable/account-required status and rejects token connection with HTTP 401.
- No running PostgreSQL target was verified; Docker's daemon is unavailable. No migration was applied, database provisioned, real token requested or real account connected. The SQL adapter checks non-superuser/non-BYPASSRLS roles and enabled forced RLS, but those checks still require execution against a real disposable database.
- Computer use stopped because it could not confidently identify the current browser URL. Actual rendered desktop/mobile screenshots were not inspected. New Canvas UI in Scholarly, Bookish and After Hours, widths 320/375/430/768/1024px and desktop, keyboard and physical-phone acceptance remain open. JSDOM behavior is not visual acceptance.
- Three selected existing navigation/session checks passed. One older storage-UI search-race check fails before search because its harness still expects a `Search` sidebar button; the pre-V2.7 app already labels it `Research`. This unrelated baseline mismatch is documented in the reader guide and was not changed. Existing GitHub CI may run the full checks after the push; its result must be observed separately.

## Remaining release requirements

1. Provision an identified, authorized PostgreSQL test target and non-bypass runtime role. Review/apply the migration with a separate role; validate owner RLS, rollback, lease contention, reconnect/disconnect races and retention against that database.
2. Obtain institution-approved OAuth developer keys and HTTPS callback registrations for a multi-user rollout. Add one-use state/cookie binding, callback/session/replay protection and durable refresh-token handling before exposing OAuth. Preserved OAuth helper functions are not a completed OAuth flow.
3. Verify a real permitted test account separately from mocks; confirm course enrollment, pagination, assignment overrides, undated/empty states, expired authorization and refresh preservation.
4. Complete the rendered responsive/theme and keyboard matrix, then physical-device/assistive-technology acceptance. Do not claim WCAG or broad citation certification.
5. Public account lifecycle, account deletion, credential/key rotation, database backup retention/recovery, hosting/monitoring and explicit local-data migration remain launch work. Cloudflare Access pilot identities do not provide public sign-up or cross-device research storage.
6. Review dependency/security findings before release. Earlier work reported six moderate development-tooling findings; V2.7 did not run a fresh audit or force dependency upgrades.

## Deferred enhancements

Complete reader acceptance and an approved student authorization flow before another major feature. Defer additional LMS providers, submission/grade writes, shared research, expanded scratchpads, citation formats and unrelated personalization unless explicitly reprioritized. Cloud research storage requires deliberate account/data migration design.

## Data and Git continuity

Research remains origin/profile/device local; academic JSON backups are plaintext and exclude Quick Notes. Preferences and scratchpads remain separate per browser namespace. No existing research or credentials were accessed for the new synthetic tests. Historical privacy risks remain documented in [the privacy assessment](docs/HISTORY_PRIVACY_RISK.md).

V2.6 remains at `43f0a67`, documentation handoff at `7a8ecb7`. V2.7 is synchronized to the existing `codex/v2-my-research-desk` branch with a normal fast-forward push; verify actual SHA with Git. Keep [PR #7](https://github.com/sarahcraft1/quillora/pull/7) in draft, separate from citation [PR #6](https://github.com/sarahcraft1/quillora/pull/6), also draft. No merge, history rewrite, production setting change or deployment is authorized.

## Next development task

Unblock the identified PostgreSQL test target and approved OAuth institution setup, then complete live connection and actual browser visual acceptance. Do not weaken identity/storage checks to make the shared local preview accept real credentials.
