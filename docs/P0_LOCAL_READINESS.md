> UPDATE: the local Docker/Linux validation pass is now complete; see [LINUX_VALIDATION.md](LINUX_VALIDATION.md). Earlier Docker-unavailable statements below are historical. No cloud/staging authorization or independent MLA sign-off is implied.

# Local P0 preparation — 28 October 2026

## Scope and repository state

User approved Render + Cloudflare Access architecture, browser-local saving and manual backups **for local preparation only**. No provisioning, spending, deployment, invitations, data migration, automatic merge, or new scholarly integration is authorized. Branch: `codex/p0-local-pilot`, based on `258092a`. GitHub PR #1 was already merged externally at `23145cb`; this work does not merge or revert it. Starting worktree was clean. No AGENTS.md was found in project/checked ancestors. Existing QA_REPORT, IMPLEMENTATION_PLAN, STABILIZATION and README were consulted. Historical claims below those documents are superseded by this report.

## Access foundation

- Middleware covers pages and APIs, including session and rubric endpoints. Public `/api/health` returns only `{status:"ok"}`; it is liveness, not a declaration that Access is configured. Static framework assets have no student work.
- Production fails closed with 503 if configuration is absent, 401 if a token fails verification. Incoming `x-quillora-storage-key` is removed and replaced only after verification. Direct host requests with no valid token fail as well.
- `jose` verifies RS256 signatures from the fixed configured Cloudflare issuer's JWKS URL, audience, expiration, issued-at presence, subject, app-token type, and invited email. Tokens/identity headers alone are never accepted as proof. Hash of issuer + subject identifies local storage; email is not sent to the client as storage identity. Key fetching has a four-second timeout. No credentials were created.
- State-changing requests require the exact configured public Origin. Private responses are no-store; referrers are suppressed, embedding prohibited, and MIME sniffing disabled. These are defense layers, not a complete penetration test.
- Before showing saved work and before each save, the client checks its current server-verified namespace. Visibility/30-second checks hide the UI if the session changes or cannot be verified. An offline session failure hides work but does not erase it. Initial identity is also checked to avoid exposing stale cached user UI.
- A local bypass exists **only** for `NODE_ENV=development` plus explicit `QUILLORA_ACCESS_MODE=local`. It cannot enable a production bypass. Default dev listener is now loopback-only. Do not bind an unauthenticated development server to a public or LAN address.

Production environment required later:

```
CF_ACCESS_ISSUER=https://YOUR-TEAM.cloudflareaccess.com
CF_ACCESS_AUD=YOUR-APPLICATION-AUDIENCE
QUILLORA_ALLOWED_EMAILS=approved-addresses-comma-separated
QUILLORA_PUBLIC_ORIGIN=https://YOUR-PRIVATE-DOMAIN
```

These are placeholders, not provisioned settings. Set the email allowlist in both Access and the app. Use exact origin with no trailing slash. The identity foundation follows [Cloudflare JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/). Actual Access keys, token lifecycle, logout/revocation, issuer rotation, DNS/TLS, and alternate-domain protection require approved staging checks. Existing signed tokens may remain valid until expiry; removing an email from the app allowlist requires a process/configuration update.

## Browser-local separation and recovery contract

- Verified users use separate `quillora-work:user:<hash>` keys and lock names. No verified user automatically reads, claims, overwrites, or deletes the legacy `quillora-work` key. Development uses a separate `quillora-work:local` key.
- Only explicit local development offers an export of earlier unassigned browser work. Hosted users must bring their own exported backup and review the normal merge preview. Conflicts become copies; no automatic reassociation or migration is implemented.
- This is application-level separation, **not encryption against another person with browser-profile/device access**. Students must use their own browser profiles/devices. Local copies remain after sign-out, and all namespaces share the origin's quota. No remote erasure or operator recovery is promised.
- Single `setItem` persistence still preserves earlier bytes on quota/write failures; Web Locks and snapshot checks reject stale writes. Pending drafts are memory-only unless exported. A before-unload warning is requested during a queued/failed save, but browsers can suppress it; process/device crashes cannot be made recoverable without a successful save or export.
- Backups remain unencrypted JSON containing questions, rubric text and checklist progress. Keep exports private. Failed imports do not announce success; retry retains conflict copies.

## Upload hardening

- Request stream capped at 10,100,000 bytes **before** multipart parsing, regardless of Content-Length; file cap 10,000,000 bytes; 15-second body deadline. Missing/malformed multipart and mismatched file signatures fail plainly.
- One upload slot per Node process, including body reading. Overlap returns 429; six uploads/minute per namespace. Search retains Crossref behavior with 30 requests/minute per namespace. These are single-instance in-memory limits, not distributed rate limiting.
- Extraction runs in a separate credential-stripped child process; 15-second deadline and 256 MB V8 heap ceiling; child is killed on completion/failure/timeout. A V8 heap ceiling is **not a hard native-memory/RSS limit**. Container memory/PID limits remain essential.
- PDF signature checked; maximum 60 pages before text extraction. DOCX ZIP preflight limits 512 entries, 5 MB actual inflated bytes per entry, 20 MB total; bounds and actual inflated sizes are checked, including dishonest central sizes, duplicate/overlapping entries, unsupported encryption/methods and required Word parts. ZIP64 is not supported. Full-text output is limited to 200,000 characters; complex valid rubrics may need pasted instructions.
- Compressed/output limits and timeout reduce risk; they are not antivirus, a sandbox, or proof that hostile PDFs cannot exhaust native memory. Linux OOM/restart behavior and concurrent-user load remain launch gates.

## Citation review

Independent comparison means checking expected rules against primary style guidance separately from the formatter; it does **not** mean an external human librarian certified the output.

| Case checked | Result |
| --- | --- |
| APA journal, missing issue, PLOS e-locator | Existing exact real-source cases still pass against [official journal examples](https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references). Publisher journal spelling is retained. |
| APA 20/21+ authors, hyphenated/compact initials, name capitalization, group names | Regression checks reviewed against [reference elements](https://apastyle.apa.org/style-grammar-guidelines/references/elements-list-entry). No inference of missing group expansions or preferred names. |
| APA absent author/date/title | Missing fields follow the [official missing-information templates](https://apastyle.apa.org/style-grammar-guidelines/references/missing-information); bracketed unavailable-title description is explicit, no invented Anonymous/date. |
| APA absent author plus quoted title ending | **Fixed defect:** punctuation now goes inside closing quotation marks when title occupies the author position, as it already did for other article-title positions. Focused regression added. |
| MLA two authors, suffix, missing fields, nested quotes, DOI location | Existing checks reviewed against public [ninth-edition core examples](https://style.mla.org/works-cited/citations-by-format/) and [core template](https://style.mla.org/works-cited/works-cited-a-quick-guide/). Two-author real-source exact case retained. |
| MLA article number/e-locator and abbreviated page ranges | **Not fully verified against licensed MLA 9.** Public article-number answer explicitly concerns edition 8. Retain conservative behavior and flag review; full publisher page ranges remain, with a new warning for three-digit ranges. E-locators deposited only as pages now get the same warning as explicit identifiers. |

The frozen 49-record corpus still checks provenance, identity and invariants, not 49 certified bibliography entries. Title capitalization remains manually reviewed per style, preserving proper nouns/acronyms; corrections remain session-only. Plain-text copies still require italics in the destination. Access and peer review remain unknown; credibility unassessed. A librarian/MLA 9 handbook review is still required before an accuracy assurance to students.

## Container and privacy preparation

- Multi-stage Node 24 Debian-slim Dockerfile builds Next.js, prunes dev dependencies and runs as non-root. Runtime includes PDF native dependencies and only the extraction worker script, not the browser test harness. Runtime PORT defaults to Render's 10000. No volume/database is required; uploads are not intentionally retained.
- Docker context excludes `.env*`, Git, local builds, dependencies, tests and documentation. No image was built here: Docker is unavailable. Verify Linux/native PDF assets before provisioning/deployment. Pin image digest during the approved reproducibility pass.
- `/api/health` is safe for liveness probes. Production startup with missing access config remains unavailable to students even when liveness is healthy.
- Operational logging accepts only two fixed event names; no exception messages, tokens, email, filenames, research queries, bodies or extracted text. Runtime worker stdout/stderr are discarded. Crossref still receives research queries as part of its service request. Development framework logs can include URLs; use synthetic topics only.
- Hosting/CDN access logs are outside application control. Query-string redaction, retention, dashboard access, cost alerts and provider settings must be verified before invitations. No assertion that provider logs are already privacy-safe is made.

## Checks and exact reproduction

- `npm test`: **139 passing**, including all earlier regressions, token signatures/claim failures, unauthorized middleware, spoofed headers, same-origin writes, user keys/locks, changed-session hiding, body cap and deadline, concurrent slot cleanup, valid PDF/DOCX, malformed files, worker kill/exit, 61-page PDF, DOCX inflate bomb/entry count, and fixed-only logging.
- Final production build passed without warnings; TypeScript and whitespace checks passed; production dependency audit reported zero known vulnerabilities. The final production HTTP deny-by-default smoke also passed, including a forged middleware-subrequest header. These checks do not replace Linux or real Access testing.
- `QUILLORA_ACCESS_MODE=local npm run dev -- --port 3018` (PowerShell: assign `$env:QUILLORA_ACCESS_MODE='local'` first). `TEST_URL=http://127.0.0.1:3018 node tests/integration.mjs`: valid PDF/DOCX pass; malformed/unsupported/missing uploads rejected; blank/long search rejected; three live searches return 24 records each, checked against Crossref DOI metadata. Same-origin Origin headers are supplied by this test. No student origin is used.
- Production: start with no Access settings on port 3019, then `node tests/production-access.mjs`. Pages/APIs/forged headers fail 503, health contains status only. Unit checks with configured issuer but absent/bad token fail 401. Valid cryptographic tests use locally generated keys, **not real Cloudflare credentials**.

### Actual browser quota and interruption — separate from simulations

Use only `node scripts/browser-recovery-harness.mjs`, bound to `http://127.0.0.1:3017`. This separate script bundles the real Home/storage/import components; it is not a production route or bypass. It provides only synthetic fixtures and does not call scholarly APIs. Each rerun should use a fresh disposable profile/origin; the seed button refuses to overwrite existing test work.

1. Seed disposable fixture (two assignments/one source), export baseline through the real UI.
2. Fill actual browser quota. This writes only named filler keys until genuine `QuotaExceededError`; no injected StoragePort/JSDOM failure. A shrinking save may still succeed, so refill quota and grow an assignment question by 10,000 characters before saving.
3. Confirm actual save failure, unchanged saved fixture, actionable message and downloadable attempted changes. Remove only disposable filler; Retry save; reopen and confirm the 10,024-character question survived.
4. Hold disposable write lock; attempt assignment creation. Five-second lock timeout returns recovery message without persisting the new assignment. Discard only this synthetic attempt and close/reopen the test tab.
5. Queue disposable save and reload: the harness holds the same Web Lock, queues the real persistence helper and navigates away before writing. Three saved assignments remain; `INTERRUPTED MUST NOT PERSIST` does not appear. This tests queued-write interruption, **not an OS crash during synchronous setItem or disk flush**.
6. Fill actual quota again. Import `tests/fixtures/quota-import.json`; review and Merge. Confirm failed import leaves three assignments and the original question lengths intact. Remove filler, Retry. A fourth assignment appears as a conflicting imported copy; original questions remain.
7. Remove the saved source through Home; import the baseline export and Merge. Close/reopen: four assignments, one restored source, original edits and conflict copy remain. No silent overwrite.

These steps passed in the in-app Chromium browser on the disposable origin. Quota simulations remain automated separately. Not tested: Safari/Firefox/mobile, storage-denial policy matrix, browser/OS disk crash, private-mode durability or eviction. Do not describe these as universally verified.

## Next authorization and remaining launch gates

No spending/provisioning/deployment/invitations are authorized by the architectural approval. Next request: approve a **local Docker/Linux validation pass**, including installing Docker Desktop if desired, and arrange an independent MLA 9/librarian review. Changes are committed locally; pushing a review branch/PR can be authorized separately under the local-only scope.

Suggested Docker checks for that approved local pass (synthetic data only):

```
docker build -t quillora:local-p0 .
docker run --rm --name quillora-p0 --memory=1536m --cpus=1 --pids-limit=128 -p 127.0.0.1:3030:10000 quillora:local-p0
```

Expect `/api/health` 200 and private pages/APIs 503 with no Access configuration. Do not add a production bypass to make a container test easier. Exercise extraction directly in a disposable container with `node --input-type=module` importing `/app/scripts/rubric-worker.mjs` and synthetic fixtures mounted read-only. Verify valid PDF/DOCX, ZIP expansion, long PDF, timeout, memory exhaustion and process restart. Resource flags are proposed test limits, not measured capacity. An authenticated end-to-end hosted check still requires later staging authorization.

 Neither needs cloud provisioning. Do not merge automatically.

After those pass, separately approve Render/Cloudflare accounts and spending cap, allowlist/domain/region, secure configuration, then a synthetic-data staging deployment. Verify real Access login/expiry/logout and all origin/API bypasses, provider upload limits/log privacy, Linux native memory exhaustion/restart and five-user load. Only then request approval for five named students. Twenty-five-user expansion needs its own capacity/recovery review. There is no cloud migration in this phase.
