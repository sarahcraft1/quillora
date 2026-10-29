# Repository privacy hardening — October 28, 2026

Scope: current documentation, ignore rules, security reporting and future local commit identity. The earlier raw PUBLIC_RELEASE_AUDIT.md remains outside Git. This report intentionally avoids repeating the personal information found there.

## Changes

- Replaced personal home/checkout paths with portable project-root wording. Replaced workstation inventory with generic Docker/WSL prerequisites, and removed unnecessary host/kernel details from current validation notes. Reproducible application image/runtime evidence remains.
- Strengthened Git and Docker exclusions for common local credentials, private keys/certificates, unencrypted Quillora exports (including numbered downloads), local databases, temporary files, editor state and private audit artifacts. Necessary application files, generic PDF/DOCX/JSON test fixtures, public certificate files and reviewed placeholder templates remain eligible. No actual credential template/value was created.
- Added SECURITY.md: private reporting, minimal synthetic reproductions, supported pre-release code, responsible testing, realistic response expectations and limits. With explicit owner approval, enabled GitHub private vulnerability reporting and verified it by read-only API request. No paid feature or workflow was enabled.
- Configured user.email and user.name **only in this checkout's local Git configuration**, using the authenticated account's GitHub noreply identity and public account handle. Verified effective author and committer identities before committing. No global Git settings or historical authors were changed. Other clones and web-based GitHub edits need their own privacy settings.
- Added a separate [history risk assessment](HISTORY_PRIVACY_RISK.md). No history rewrite, force push, merge, data deletion, visibility change, deployment or student-data migration is included.

## Verification

- `npm test`: **142 passing** (139 existing + three repository-privacy tests).
- Focused tests execute Git's actual ignore matcher for root/nested secrets and numbered browser exports, verify required source/fixtures/templates are not ignored, and guard current Markdown against personal home paths/contact details/workstation inventories.
- All staged tracked files were checked against the strengthened ignore rules: no necessary tracked file became ignored.
- Current staged snapshot: Gitleaks 8.30.1, fully redacted, no detected secrets. Current-document privacy checks pass. Raw scan reports are kept privately outside Git. Full-history secret scanning is repeated after committing; historical personal information is expected to remain and is not a clean-history claim.
- Local production build and production dependency audit pass; no known production vulnerability was reported at the check. Linux image rebuild passed with the strengthened Docker context (`quillora:privacy-hardening`, image ID `sha256:36f4a471f7a52262117291e66d70d1230eedec6e7a0ce0f52859d93d52e243a3`). No new application behavior or styles changed. Prior Linux runtime/OOM/resource evidence is not claimed as a newly repeated runtime test in this documentation/ignore cleanup.

## Remaining risks and decisions

The existing default branch and earlier refs/commits retain personal metadata until separately addressed; this PR alone does not remove historical publication. Public copies may already exist. Ignore rules do not identify all sensitive values or exports renamed to unrelated filenames. No scanner proves complete absence of secrets.

Owner review/merge approval is required. Separately decide whether to accept the historical disclosure or authorize planning targeted historical minimization; no rewrite is recommended as an automatic emergency response when no live secret was identified. See the history assessment for disruption, recovery and external-copy limitations. A license choice remains separate; none was selected by this cleanup.
