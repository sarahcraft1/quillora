# Citation release QA — 11 November 2026

**Status: local changes prepared; release validation and GitHub delivery blocked.** Do not treat this as pilot approval.

Base: GitHub main `21f4a497007f432eba3c83e7394cf839ed9bf49d`.
Working branch: `codex/citation-release-polish`.

Direct clone failed because network/DNS access was unavailable. A separate local checkout was reconstructed from the connected GitHub reader. Every main blob, tree and the signed main commit was checked against its Git object SHA before edits. The original local application source was preserved. No deployment, merge, visibility, credentials, accounts, database or hosting changes were made.

## Changes

- APA rendered/HTML references now use separate journal and volume italics with an upright comma, as required by official APA punctuation guidance.
- Whitespace-only volume/issue metadata no longer creates empty parentheses or bare MLA volume/issue labels.
- Citation copying writes HTML and plain-text alternatives when supported. Rejected HTML falls back to plain text with an explicit reapply-italics message; total failure offers manual selection. All HTML metadata is escaped.
- Shared formatted spans keep display and clipboard text consistent, including the user's title edit. Existing plain-text and compatibility parts APIs remain available; formatted consumers should use `citationRuns`.
- Warnings disclose suspected damaged title encoding and possible consortium versus individual-byline ambiguity. No names, missing fields, article identifiers or capitalization are silently invented or replaced.
- Five additional regression tests cover the corrected spans, whitespace, export consistency, escaping/Unicode, metadata warnings, rich copy, plain fallback and failure. Clipboard tests use mocked browser APIs; they are not actual browser interoperability tests.
- [All 16 MLA review cases and primary evidence](mla9-review/ASSESSMENT-2026-11-11.md) are assessed separately from application output. The original review packet remains untouched.

## Validation

| Check | Actual result |
| --- | --- |
| Focused citation tests | **21 passed, 0 failed**: 16 existing plus 5 new tests, using Node 24's native TypeScript stripping and a temporary relative-import resolver because tsx dependencies were incomplete |
| Targeted strict TypeScript | **Passed** for citations, clipboard helper and new tests, with ES2022 + DOM, bundler module resolution, skipLibCheck |
| Full `npm test` | **Blocked**: incomplete dependencies; initial pre-install attempt ran 69 tests successfully but failed other test files on missing jose/entities/jsdom and initially absent fixtures. Fixtures were subsequently restored and verified against main |
| Full suite via native TypeScript fallback | **Not passing**: 69 passed, 7 failed test-file loads; missing dependencies and an existing parameter-property construct unsupported by strip-only mode. This is not equivalent to the complete configured suite |
| Project `tsc --noEmit` | **Not passing**: missing Next, jose, entities, lucide-react and jsdom modules/types; targeted changed-code check passed |
| Production `npm run build` | **Blocked**: Next executable unavailable after failed dependency restoration |
| UI syntax transpilation | Blocked after dependency restoration failed: compiler package could not be loaded; no standalone UI syntax success claimed |
| Browser keyboard navigation, responsive desktop/mobile, actual clipboard paste, search/storage error states | **Not performed** on the changed app: dependencies prevented starting a verified build. Existing keyboard code/CSS preserved; no claim of regression-free browser behavior |
| `git diff --check` | Passed |
| GitHub branch / PR | **Blocked**: branch creation returned HTTP 403, Resource not accessible by integration. No remote branch or PR was created |

Dependency note: an offline `npm ci` attempt also left the older parent folder's installed `node_modules` incomplete. A normal restore attempt failed with npm's “Exit handler never called” error. Parent source and lockfiles were not changed. Restore dependencies with `npm ci` in each application folder when network access is available, then run the standard suite, project TypeScript and production build before review approval.

## Remaining limitations and handoff

MLA 9 article-number omission and detailed range abbreviation remain unresolved; the available MLA identifier answer is explicitly edition 8. MLA-06 has a publisher consortium-byline discrepancy. MLA-07's original publisher metadata was inaccessible. MLA-13 has a damaged deposited title. Other publisher checks based on indexed extracts have limited field/byline coverage. None of these is marked independently approved.

Capitalization stays editable per citation to protect proper nouns, acronyms and non-English titles. Journal-title casing, month/season date precision, scientific title italics and destination-app rich-paste behavior still need human review. Clipboard permission/HTML support varies by browser and destination.

With repository write permission restored, push this branch and open a review PR against main; do not merge or deploy. Run `npm ci`, `npm test`, `npx tsc --noEmit` and `npm run build`, then manually verify modal Tab/Shift-Tab/Escape/focus restoration, narrow-screen layout, rich/plain/manual copy and failed search/storage states using synthetic data. No architectural change is proposed.
