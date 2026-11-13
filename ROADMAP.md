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

## Current V2.7 Canvas development

**Unfinished, local, uncommitted and not included in the migration documentation commit.** A fresh GitHub clone will not contain these changes until they are separately reviewed and committed. Reopen the existing local checkout to retain them. The migration task created an additional recovery copy outside Git; see the completion report for its location.

| Current local path | Code present; not an integration acceptance claim |
| --- | --- |
| `lib/canvas/types.ts` | Browser-safe DTOs, institution-origin/reference validation and course-time-zone date conversion. |
| `lib/canvas/client.ts` | Token exchange/refresh/revoke helpers; bounded, same-origin read requests; pagination and course/assignment normalization, plain descriptions and available rubrics. |
| `lib/canvas/config.ts`, `errors.ts` | Operator-supplied institution registry, read scopes, server configuration parsing and fixed user-facing errors. |
| `lib/canvas/vault.ts` | AES-256-GCM helpers with owner/origin/purpose authenticated data. |
| `lib/canvas/repository.ts`, `postgres.ts` | Storage contract and PostgreSQL adapter: owner-scoped transactions, authorization epochs, sync leases and generation checks. |
| `lib/canvas/import.ts` | Proposed course matching/import helpers, external-ID matching and preservation of student-edited research fields. |
| `db/migrations/001_canvas.sql` | Draft Canvas owner/connection/OAuth-state schema, indexes and forced owner RLS policies. Not applied or tested against a live database. |
| `lib/work.ts` | Uncommitted optional Canvas references and validation in existing research records. |
| `package.json`, `package-lock.json` | Uncommitted `pg` and `@types/pg` additions, installed locally. |

There is **no Canvas service orchestration, authenticated Canvas route/callback, connection screen, or Canvas-specific test suite**. The PostgreSQL schema does not store the complete Quillora research/account system. No Canvas institution has been authorized or tested, and no working student connection is claimed.

## Remaining integration requirements

1. Review and test the existing modules before exposing them. Cover vault isolation/tampering, import idempotency, class matching, user edits, time zones, malformed data, pagination/redirect boundaries and size limits. Verify Canvas metadata survives backup/merge/conflict handling; `mergeWork` comparisons still need review.
2. Add a narrow server-side Canvas service using verified user ownership. Implement one-use OAuth state/cookie binding, expiry, callback validation, safe failures and replay/account-switch prevention. Do not permit token persistence for the shared local-development identity.
3. Wire authenticated, same-origin routes for institution resolution/connection, callback, status, manual refresh and disconnection. Serialize safe DTOs only, use no-store responses, and reject stale-session mutations. Do not trust a browser-provided owner ID/header as identity.
4. Exercise the PostgreSQL migration and adapter using a disposable, identified test database and a non-superuser/non-BYPASSRLS role. Verify cross-user reads/writes, transaction rollback, lease contention, stale callbacks, interrupted token refresh and disconnect/reconnect races. Mocked repository tests alone do not establish SQL/RLS correctness.
5. Add a theme-aware connection/status panel within the existing workspace, reviewable course matching and atomic import through the existing save path. Retain Canvas URLs/metadata and let imported assignments open in the existing research tools. Explain refresh errors/last success and preserve student-created assignments, notes and checklists on refresh/disconnect.
6. Obtain institution-specific, approved confidential OAuth developer keys and registered HTTPS callback addresses through authorized administrators. Use only the read scopes needed for courses/assignments. Never collect student personal access tokens or add grades/submission/content writes.
7. Verify a real institutional account separately from simulations. Inspect new screens and error states at 320, 375, 430, 768, 1024px and desktop in all themes, with keyboard and reduced-motion behavior.

## Release blockers

- Public identity/account lifecycle, secure session ownership, per-user durable research/preferences storage and explicit legacy-data migration are not complete. Cloudflare Access pilot verification plus browser namespaces does not satisfy public multi-user accounts.
- Canvas orchestration, API/UI wiring, isolated authorization, integration tests and live institution approval are incomplete.
- No verified running PostgreSQL service or applied migration is available for this integration. Docker CLI exists on the audited workstation, but the prior check could not reach its daemon; no database was provisioned during migration.
- Account deletion, provider revocation failures, retention/backup recovery, credential/key rotation and operational ownership need implementation/validation appropriate to a public service.
- Physical-phone keyboard behavior, spoken screen-reader coverage, wider browser/accessibility acceptance and unsupported citation cases remain open. Do not claim unrestricted release readiness.
- Review current dependency/security findings before release. The earlier V2.7 install reported six moderate findings; this documentation task did not perform a fresh vulnerability audit or upgrade dependencies.
- Hosting, production identity/database setup, monitoring, backup/restore and deployment authorization remain outstanding. No purchase, deployment, production setting change or merge is authorized by this roadmap.

## Deferred enhancements

Finish the bounded Canvas connection before considering another major feature. Defer multiple scratchpad notes/dragging, shared or collaborative research, additional LMS providers, broader citation/source formats, offline installation and other unrelated personalization/feature expansion unless explicitly reprioritized. Future cloud research storage is a launch requirement to plan deliberately, not an automatic dual-write migration in a Canvas UI task.

## Known limitations and repository state

- Research is origin/profile/device local and can be lost through storage eviction, clearing or device loss. GitHub backs up code, not browser research. Academic JSON backups are plaintext and exclude Quick Notes.
- Local mode is a shared namespace within an origin. Per-identity preferences and scratchpads are local; no independent public account or cross-device recovery is implied.
- Imported Canvas metadata currently exists only in unfinished source code. The UI cannot connect, refresh or disconnect Canvas yet.
- Existing historical documentation can describe earlier readiness decisions; consult its date and source commit. [Historical privacy risks](docs/HISTORY_PRIVACY_RISK.md) are not erased by this migration or a new commit.
- At audit start, local `codex/v2-my-research-desk` was at `43f0a67`; GitHub was at `85f4a0e`. Fetch corrected a stale tracking ref that had pointed at `fdc934d`. The migration push is intended to synchronize V2.6 and these documentation changes only. Verify actual SHAs with Git rather than treating this dated snapshot as a live status.
- Keep [PR #7](https://github.com/sarahcraft1/quillora/pull/7) on `codex/v2-my-research-desk` in draft. Keep citation [PR #6](https://github.com/sarahcraft1/quillora/pull/6), head `c758ba0`, in draft and separate. Do not merge either PR or rewrite history.

## Next recommended development task

**After this organization task, add a focused regression suite for the preserved Canvas vault, API boundary and import/backup behavior before wiring OAuth or changing UI.** Start by reproducing cross-owner vault rejection, repeat-import duplicate prevention and Canvas-reference round trips/merge conflicts with synthetic fixtures. Inspect existing code and make the smallest corrections warranted by those tests. No live credentials, hosting or major redesign is needed for that bounded next step. Commit verified changes separately; do not bundle the entire unfinished integration merely because it type-checks.
