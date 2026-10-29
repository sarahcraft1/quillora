# Historical privacy risk assessment

## Decision and scope

Current documentation and future commit identity can be hardened without altering history. The earlier local public-release audit found personal commit identities and unnecessary workstation/path information in reachable historical content. No exposed API credentials or actual student records were identified. This assessment intentionally does not repeat the personal address, username, device inventory or exact historical snippets.

The repository was reported public during the audit. Its visibility was not changed as part of this cleanup. Public copies may already exist. A clean current tree must not be described as clean historical publication.

## Is a rewrite warranted?

**A history rewrite is not currently warranted as an emergency credential-containment action:** no live secret was found. Personal identity disclosure remains a privacy issue; configuring a noreply identity and sanitizing current files do not remove earlier copies.

**A narrowly scoped rewrite may be warranted if the owner requires removal of the historical personal identity/path/device details.** That is a separate privacy decision, not an automatically authorized fix. The owner can instead explicitly accept the remaining historical disclosure, or separately consider publishing a sanitized history in another repository. A new repository would not erase the original public repository or its copies.

A rewrite changes commit IDs and may affect open pull requests, merge refs, signatures, collaborator clones, bookmarks and validation references. Old pull-request refs, caches, forks and clones can retain information. Cleanup may require GitHub Support, and support assistance/removal is not guaranteed. Changing a public repository back to private does not recall existing public copies.

## Options requiring a separate owner decision

1. **Accept the historical disclosure:** retain current history, use the repository-only noreply identity going forward, merge reviewed documentation/ignore hardening when approved, and keep automated privacy checks. This avoids rewrite disruption but preserves earlier personal information.
2. **Plan targeted historical minimization:** before executing anything, create a protected recovery copy outside public Git, inventory refs and open PR dependencies, define the exact data categories/identities to replace without reproducing them publicly, coordinate collaborators, and agree on verification and GitHub support/ref cleanup. History rewriting and force-pushing require explicit new authorization. Re-scan all intended public refs afterward; do not promise that external copies disappear.
3. **Consider a fresh sanitized publication:** separately approve the destination, attribution/license decisions and source verification. Keep recovery material private and preserve student backups independently. This option does not retract already published history.

## What this cleanup does not do

No historical commit is edited, no force push occurs, and no old refs/branches/clones are deleted. No student data/backups are moved, assigned, erased or uploaded. No global Git settings are changed. A repository-local GitHub noreply author/committer identity protects future commits made with that configuration; browser-based GitHub edits, other clones and explicit author overrides need their own privacy settings.

## Follow-up safeguards

Review the full staged diff before each push. Targeted ignore rules protect common export/key/config filenames but cannot recognize arbitrary sensitive text or an export renamed to an unrelated filename. Keep real credentials, exports and raw security reports outside the checkout. Scan current files and history without publishing detected values. If a credential is ever found, revoke/rotate it first and reassess whether historical removal is necessary.

Primary references: [GitHub repository-local commit email](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address), [sensitive-data removal and rewrite effects](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository), and [visibility consequences](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility).
