# Persistence decision for the local-first milestone

October 29, 2026. Hosting and paid provisioning are paused. Recommendation: **retain and strengthen browser-local persistence now; do not add a database or account system solely for architectural completeness.**

## What the current approach provides

Assignments, questions, rubrics, source metadata, optional research notes and manually confirmed checklists persist as one browser-local Work document. Web Locks serialize cooperating tabs; compare-before-write rejects stale snapshots; failed writes preserve previous bytes and expose export/retry. Backups are explicit JSON, validated and merged without silently overwriting conflicting projects. Original PDFs/DOCX files are not stored; extracted rubric text is.

It fits one independent student using a dedicated browser profile and exporting after sessions. There are no server accounts or remote copies to manage, no monthly database charge, and no migration of existing work. A local Next/Node server is still required for the application and upload/search endpoints; Crossref requires internet. Browser-local is not a fully offline installed application.

Limits are real: site eviction/clearing, private-mode lifetime, origin changes and device loss can lose work; quotas vary; unsaved forms are memory-only; namespace isolation is not local encryption. Exported JSON is plaintext. The local development identity is shared within that origin/profile. Access checks intended for a future private server are not a current local user-account system. Retaining a Git repository backs up application code, not browser research.

## When a backend would earn its complexity

Reconsider if students require cross-device continuation, reliable operator-assisted restoration, automatic durable backups, substantially larger libraries, shared projects or account-level deletion/audit. Those benefits cannot be delivered honestly by another browser-storage wrapper. A local SQLite server could survive browser clearing on the same computer, but it does not by itself solve device loss, accounts, remote availability or synchronization. It would introduce two authoritative stores and additional backup/privacy obligations today.

No account/database implementation is necessary to finish current local rubric/search/citation/workflow validation. A server storage implementation can be developed and tested locally later when one of those product requirements is approved; it does not need to wait for paid hosting.

## Future architecture, if approved for a concrete need

Use the existing Next server as a narrow authenticated API. Store assignments, notes/checklist entries, canonical source records and assignment-source links transactionally, with explicit revisions and idempotent writes. Authenticate through a supported identity provider rather than home-built passwords. Derive ownership from the verified server identity; never trust a submitted user ID or an email string as authorization. Every read/write/export/delete must enforce ownership, with database-level controls as additional protection where supported.

For a genuinely multi-device version, prefer PostgreSQL so row-level policies, migrations and real concurrent transaction tests match the eventual service. A local PostgreSQL container and an identity test double can exercise authorization/transactions without buying a service. SQLite is an alternative only for an intentionally single-machine edition; do not mistake a SQLite-only test for a complete PostgreSQL/cloud-auth test. Choose the actual provider and library after the requirements are agreed, not now. Live provider callbacks, email delivery, revocation and network recovery would still require later provider verification.

Expected local tooling can use existing open-source runtimes/database images with no service subscription; there are development, patching, backup and support costs. A future hosted database/auth provider can add recurring storage, egress, user/email and backup charges. No specific future quote, free-tier capacity or purchase is approved here. The existing hosting proposal is paused, not permission to provision.

## Migration and recovery safeguards

1. Export and retain the original browser snapshot. Display a reviewable import summary and choose the destination account explicitly; never auto-assign legacy work to whoever signs in first.
2. Treat import as a transaction with a unique import ID and manifest/counts. Preserve stable assignment IDs, canonical DOI identity, original metadata, notes and confirmed checklist states; preserve conflicts as copies or require explicit resolution.
3. Confirm server reads and re-export a backup before offering any switch of the active data source. Leave the browser snapshot untouched and offer an explicit fallback. Do not silently dual-write or claim synchronization while stores can diverge.
4. Test interrupted transfers, duplicate/retried imports, quota/disk failures, offline edits, revision conflicts, two users/two devices, unauthorized direct object requests, export/deletion authorization and restore from backup. Avoid last-write-wins data loss.
5. Account deletion must explain separate local copies and downloaded exports. Server deletion cannot remotely erase a student's browser or exported file. Agree retention and recovery windows before retaining student data server-side.

Until these benefits are needed, spend development effort on the bounded functional gaps in [LOCAL_FUNCTIONAL_AUDIT.md](LOCAL_FUNCTIONAL_AUDIT.md), not a speculative backend migration.
