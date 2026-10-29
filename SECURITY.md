# Security policy

Quillora is an independently maintained, pre-release research application. Production access controls and browser-local recovery require validation before student use. Repository visibility is not deployment authorization.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/sarahcraft1/quillora/security/advisories/new), or open **Security → Advisories → Report a vulnerability** in this repository. GitHub sign-in may be required. Reports are shared privately with authorized repository security maintainers; do not include information you are not authorized to disclose.

If the private form is unavailable, do not post exploit details or private data in an issue, pull request, discussion or commit. Open a minimal issue asking the maintainer to restore a private reporting channel, without technical details, then wait for that channel before sending the report.

Include the affected commit/version, a concise impact description, steps to reproduce on your own local instance, and a minimal proof of concept using synthetic data. Redact tokens, passwords, personal information, student rubrics, source notes and local backups. Do not attach a real student's export or an unredacted environment file.

## Responsible testing and disclosure

Test only systems and data you own or are explicitly authorized to assess. Do not access other users' work, attempt credential collection, run denial-of-service tests on shared services, or contact students. Stop if you encounter private data; report the minimum needed to explain the issue without copying or distributing it.

Coordinate disclosure with the maintainer while a fix or mitigation is assessed. The maintainer aims to acknowledge reports within seven days when available; response and remediation times are not guaranteed. There is no funded bug-bounty program or promised reward.

## Supported code and fixes

There is no stable supported release yet. Report issues in the current default branch and active pilot pull requests, identifying the exact commit. Fixes are prioritized for the current development line; older commits and local copies are not maintained separately. Security findings may delay pilot access. A successful local test is not certification of hosted security.

## Handling suspected credentials or student-data exposure

Do not paste the sensitive value into a report title or public channel. If it is your credential, revoke or rotate it through its provider, and describe only its type and location privately. Do not rewrite history, delete someone else's backups, force-push, or change repository visibility without the owner's authorization. Current-file removal alone does not erase historical copies or existing clones.

Browser backups are unencrypted and local storage is not protection against someone with access to the same browser profile. Use separate profiles/devices and keep exports private. See [README](README.md) and [local readiness limitations](docs/P0_LOCAL_READINESS.md).
