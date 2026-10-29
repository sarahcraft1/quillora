# Private staging acceptance checklist

This is a preparation artifact, not authorization to provision, spend, deploy or invite students. Approved architecture: one Render Node service behind Cloudflare Access, with browser-local work and manual export/import. Use synthetic assignments and only explicitly approved testers initially. No cloud database or new scholarly integration is included.

## Before any provisioning/deployment

- Obtain owner approval for the exact host tier/monthly ceiling, region, private hostname/domain and synthetic-data staging deployment. Do not assume approval to merge PR #2 or invite students. Staging may use an explicitly approved branch without merging main.
- Confirm access to the owner-controlled Render/Cloudflare accounts and domain. Enter configuration through approved secure provider settings; do not paste real allowlist addresses or credentials into Git, CI or reports.
- Choose a Node/container tier compatible with 10 MB uploads. Validate actual proxy body limits and timeouts, native PDF assets and a single Node process. Local Docker evidence does not configure Render resource limits automatically.
- Review the five-person local-only recovery contract: dedicated browser profiles, exports after sessions, no operator restore without an export, no grade/credibility/peer-review guarantee. No original upload retention is intended.

## Configuration (placeholders in .env.example)

Set CF_ACCESS_ISSUER, CF_ACCESS_AUD, QUILLORA_ALLOWED_EMAILS and QUILLORA_PUBLIC_ORIGIN. Public origin must be an exact HTTPS origin with no path, query, credentials or trailing slash. Missing/invalid configuration now fails closed for pages/APIs. Never set a production bypass.

Configure exact-email Access allowlists; no wildcard or Everyone policy. Require approved sign-in/email OTP, bounded sessions and an explicit revocation procedure. Protect custom domain and every preview/alternate host. App JWT verification is required even at the provider's original URL. Approved-host matching is defense in depth, **not cryptographic proof that traffic crossed Cloudflare**; a client can spoof Host. Valid-token access to an alternate hostname must still be rejected by the app; unauthorized users must fail regardless of hostname. Stronger origin network restrictions, if needed, require separate hosting configuration review.

## Required hosted checks before calling staging ready

- [ ] Anonymous, expired, wrong-signature, wrong-audience, wrong-issuer, non-allowlisted and forged-identity requests fail on pages, search, session and upload APIs.
- [ ] Valid real Access login succeeds; JWKS retrieval/key rotation, session expiry/logout, removed-user access and network failure are tested. Existing issued tokens may survive provider logout until expiry; verify actual revocation guarantees rather than promising immediate invalidation.
- [ ] Custom hostname works; direct provider/preview/alternate hostname requests fail even when carrying a valid test token; spoofed Host is considered. /api/health exposes only liveness, not configuration or private work.
- [ ] Same-origin uploads succeed; missing/foreign Origin writes fail. Confirm canonical host forwarding through Cloudflare/Render; if forwarding differs, investigate rather than weakening validation.
- [ ] Two approved test identities have separate local namespaces. An old unassigned browser store remains untouched; export/import is deliberate. Signing out does not erase local copies; browser-profile sharing is outside namespace security.
- [ ] Valid PDF/DOCX, malformed/encrypted/scanned files, oversized streaming bodies, expanded DOCX limits, long PDFs, slow requests and overlapping uploads return practical outcomes.
- [ ] Confirm actual hard host memory/CPU/process limits, restart policy after OOM, and health recovery. V8 heap limits do not bound native RSS. Admission/rate limits are per process, not distributed.
- [ ] Exercise five concurrent synthetic sessions without claiming larger capacity from a single fixture test. Check search-service outages, retries and stale asynchronous completions.
- [ ] Perform the complete workflow below in real browsers; include at least one mobile/browser beyond the local Chromium checks before inviting students.
- [ ] Verify host/CDN logs redact research-query URLs and never retain rubric bodies, extracted text, filenames, tokens or user emails. Set and document provider-specific retention/access and spending alerts; do not assume application logging controls provider access logs.
- [ ] Record findings, exact deployed commit/image/configuration names (no values), tester identities privately, and rollback outcome. Owner explicitly approves any student invitations separately.

## Student workflow and academic checks

1. Create a synthetic assignment with a research question. Upload a generic rubric, inspect/edit extracted requirements and explicitly confirm them. Check negation/date/source-count handling; requirements are not promises of compliance.
2. Search Crossref and open original DOI/publisher records. Verify a representative sample against publisher facts. Crossref indexing alone is not peer-review, credibility, retraction or claim-support verification.
3. Keep access and peer-review labels **unknown** without reliable evidence. The peer-review filter cannot certify unknown records; students must verify requirements through publisher/library evidence. Do not manufacture qualifying results to complete a test.
4. Save/link a source; copy APA and MLA drafts. Verify the actual clipboard and italic spans in the destination; independently review title case, author order, article numbers and missing fields.
5. Manually check a requirement. Edit the assignment, refresh, switch identities and verify isolation/persistence. Remove a source and verify intended whole-library versus assignment-link behavior.
6. Export a backup, inspect that it includes only synthetic work, remove a source and restore. Repeated/conflicting imports must preserve originals as copies. Check real quota recovery only on a disposable origin/profile; preserve baseline and attempted-change exports.

## Academic limitations before student use

The 49-source corpus provides provenance/invariants, not 49 independently certified APA/MLA references. A separate 16-case MLA review package is prepared but has no independent reviewer sign-off. Public MLA article-number guidance consulted refers to edition 8; MLA 9 identifiers and page-range abbreviation remain review items. APA missing fields/author counts/e-locators have focused regressions, but group-name ambiguity and metadata/title capitalization still need source checks. User capitalization edits are transient; plain-text copying does not preserve italics. No full-article analysis, automated writing, OA verification, peer-review certification or credibility scoring has been added.

## Rollback

For hosted staging, stop test access/revert to the last approved image/configuration only through an approved provider action. Do not clear browser data or rewrite history. Browser-local work is tied to origin/profile; retain exports before changing hostname/port. A server rollback cannot recover an unsaved browser draft or remotely erase local copies. Keep deployment, budget and invite approvals separate.
