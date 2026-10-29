# Local QA and review handoff — October 29, 2026

Scope: finish the interrupted QA pass on `codex/p0-local-pilot`. No new features, redesign, accounts, database, hosting or deployment. Existing browser work and exported files were not modified.

## Recovery and Git comparison

Recovered the cleanly based five pilot commits (`6012d24`, `b6b4a28`, `d741d44`, `2d4ae5d`, `b62cac1`) and the uncommitted citation/contrast fixes without reset, discard, rebase or history rewrite. PR #2 is confirmed merged; current main is `5d07704379a6c31d20d5dc1d39184f7f101b6c73`. Main's tree already includes the earlier pilot through `c025726`, so the new review PR contains only subsequent work. A read-only merge-tree calculation passed without conflicts; it did not merge any branch. Main remains untouched.

The five preserved commits include the previously completed local assignment/notes/draft/recovery fixes and their documentation. This QA pass adds only the recovered MLA punctuation correction, secondary-text contrast correction, four focused regressions and this handoff record.

## Confirmed corrections and citation scope

- MLA titles containing paired straight double quotation marks now use nested single quotation marks, matching the already-supported curly-quote case. Final periods/questions remain correctly placed; unpaired inch symbols are preserved. Source metadata and APA output are unchanged. The focused tests first reproduced the defects and pass with the correction.
- Small secondary text now uses a darker shade of the existing sage palette. Analytical tests calculate contrast against existing paper, card, sidebar and selected backgrounds (minimum 4.5:1 for the tested foreground/background pairs); primary white text/focus colors are checked separately. No font, layout or navigation redesign. This is a bounded CSS-token check, not complete WCAG certification or a rendered-browser audit.
- The existing official APA journal examples passed again: ordinary/multiple-author entries, e-locators, missing issue and online-first/final-year distinctions. No newly confirmed APA defect was found in those cases. Proper nouns, acronyms, author order, missing-field disclosures and unknown verification labels remain preserved.

References consulted independently of application output: [official APA 7 journal examples](https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references), [MLA core-element examples](https://style.mla.org/works-cited/citations-by-format/), [MLA punctuation/nested quotation guidance, citing Handbook 9](https://style.mla.org/punctuation-and-quotation-marks/), [W3C minimum contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). This is a source-based code review, not librarian sign-off or complete handbook validation. MLA article identifiers, page-range abbreviation, unusual/group/partial names, transient capitalization edits and plain-text italics remain documented limitations.

## Fresh verification results

| Check | Result and evidence boundary |
| --- | --- |
| Focused citation/accessibility tests | **18/18 pass**, zero skipped. |
| Full existing regression suite | **164/164 pass**, zero failed/skipped/cancelled. Includes all existing tests plus the four recovered QA regressions. |
| TypeScript | `npx tsc --noEmit --incremental false` passed. |
| Production build | `npm run build` passed compilation, lint, type validation and route generation. Development server stopped before building into the same checkout. |
| Dependency audit | `npm audit --json` reports zero known vulnerabilities, including development dependencies; not a blanket vulnerability guarantee. |
| Live local endpoints | `TEST_URL=http://127.0.0.1:3047 node tests/integration.mjs` passed real PDF/DOCX extraction, invalid PDF, unsupported/missing upload and invalid query checks. Three live Crossref topics returned 24 records each, with individual DOI-record title comparisons. No fixtures were refreshed. |
| Production HTTP access | `tests/production-access.mjs` passed twice on loopback: unconfigured production returned 503; synthetic configured production rejected absent/forged tokens with 401 even when development-local mode was requested. Health returned only status. No real provider credential used or changed. |
| Assignment/citation/backup workflow | Existing JSDOM integration test passed actual parser/search adapters with frozen real Crossref response, simulated clipboard/download, source saving/removal, notes/name updates, manual checklist, backup merge and remount persistence. This is not a fresh real-browser workflow. |
| Storage failures/cross-tab | Existing controlled quota/write/read-denial, queued-lock race, stale-tab and stale-request regressions passed. These are simulations and module/component tests. Earlier actual-browser quota/retry/export and cross-tab evidence remains historical in LOCAL_FUNCTIONAL_AUDIT.md; not rerun this pass. |
| Chrome and Edge | Browser inventory and Chrome selection succeeded, but opening the separate QA tab was blocked by the tool's inability to verify the active browser address. Browser interaction stopped immediately. **No fresh Quillora Chrome or Edge workflow/layout/keyboard pass is claimed.** No alternate UI automation was used to bypass this restriction. |
| Linux/container resource checks | Docker's Linux engine pipe was unavailable. No service, WSL or system setting changed. Fresh Linux/container OOM/restart checks were not run; previous Linux evidence remains historical. Windows parser/worker/resource regressions did run and pass. |
| Whitespace/privacy | `git diff --check` passed. Existing repository privacy/ignore and privacy-logging regressions passed within the full suite. No student exports, real credentials or personal browser captures added to Git. |

## Reproduction and release decision

Run Node 24, then the focused command `node --import tsx --test tests/citations.test.ts tests/accessibility.test.ts`, `npm test`, standalone TypeScript, audit and production build. For live integration use an unused loopback development origin with explicit `QUILLORA_ACCESS_MODE=local`; never use a student's populated origin. See [the functional audit](LOCAL_FUNCTIONAL_AUDIT.md) for the existing disposable quota harness and backup reproduction. Production HTTP checks require a built app and a loopback production server, not a production auth bypass.

**Ready for code review.** No blocking regression was observed in the completed checks. This does not certify cross-browser accessibility, all citation cases, or hosted security/resource behavior. Fresh browser acceptance remains unverified because of the tooling restriction; it is not a failed product test. Browser-local data still requires deliberate saves/private exports and provides no cloud recovery or cross-device sync. Peer review/access/credibility remain unknown without evidence. A future deployment would require separate authorization and real provider/access/log/resource acceptance; this PR does not authorize or perform it.

Reviewer decision: review the remaining local changes and QA fixes against current main. Do not merge automatically. No additional hosting or spending decision is needed to review this PR.
