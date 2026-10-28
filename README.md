# Quillora

Academic source discovery using Next.js App Router, TypeScript, Tailwind, and Crossref.

- `npm ci`
- `npm run dev` for development
- `npm test` for regression tests
- `npm run build` then `npm start` for production
- With a server running: `node tests/integration.mjs` (optional `TEST_URL` environment variable selects a different origin).

Use Node.js 24. PDF/DOCX fixtures are committed under `tests/fixtures`; their optional regeneration script uses python-docx and reportlab.

Read [STABILIZATION.md](STABILIZATION.md) for verification evidence, backup behavior, known limits, recovery checkpoint, and private hosting requirements.
