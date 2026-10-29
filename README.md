# Quillora

Academic source discovery using Next.js App Router, TypeScript, Tailwind, and Crossref.

- `npm ci`
- `QUILLORA_ACCESS_MODE=local npm run dev` for loopback-only local development (PowerShell: set `$env:QUILLORA_ACCESS_MODE='local'`, then `npm run dev`)
- `npm test` for regression tests
- `npm run build` then `npm start` for production
- With a server running: `node tests/integration.mjs` (optional `TEST_URL` environment variable selects a different origin).

Use Node.js 24. PDF/DOCX fixtures are committed under `tests/fixtures`; their optional regeneration script uses python-docx and reportlab.

Read [STABILIZATION.md](STABILIZATION.md) for verification evidence, backup behavior, known limits, recovery checkpoint, and private hosting requirements.

Checklist completion is manual and saved per assignment. Storage failures retain previously saved work; export attempted changes or retry before refreshing. Tests include controlled quota failures and JSDOM component checks, not real browser quota exhaustion. Integration checks update recorded fixtures only with UPDATE_FIXTURES=1.

Private beta preparation: [QA report](docs/QA_REPORT.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md), and [49-source corpus](tests/fixtures/scholarly/README.md). The default test suite uses frozen metadata offline. Acquisition is opt-in with `node scripts/refresh-scholarly-dataset.mjs`; it makes public Crossref requests and must not run as an ordinary test.

## Private pilot preparation

Production is fail-closed without Access configuration; `QUILLORA_ACCESS_MODE=local` never bypasses production verification. Read [local P0 readiness](docs/P0_LOCAL_READINESS.md) before running or reviewing the container. `GET /api/health` is only a public liveness check. No hosting or invitations are authorized. Existing unassigned browser work remains untouched; bring a reviewed backup explicitly rather than automatically linking it.

Disposable browser recovery harness: `node scripts/browser-recovery-harness.mjs` on loopback port 3017; use synthetic data only. Production deny-by-default smoke: `node tests/production-access.mjs` against local production port 3019.

Local Linux checks: `node scripts/prepare-linux-qa.mjs`, build `quillora:p0-local`, then `node scripts/validate-linux-container.mjs`. This intentionally exhausts memory only in a separate disposable capped container and uses synthetic fixtures. See [Linux validation evidence and limitations](docs/LINUX_VALIDATION.md).

## Security and repository privacy

Report vulnerabilities through [SECURITY.md](SECURITY.md); never attach real student exports or credentials to public issues. Keep environment values and browser backups outside Git. Reviewed `.env.example`/`.npmrc.example` templates may contain placeholders only. See [historical privacy assessment](docs/HISTORY_PRIVACY_RISK.md): current cleanup does not remove older personal information or authorize a history rewrite.
