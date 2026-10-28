# P0 validation stage 2 — October 28, 2026

Commit 90045ea was pushed and verified on origin/codex/p0-local-pilot; main was untouched. All 139 Windows regression tests passed again. Linux tests are NOT RUN: firmware virtualization is disabled and WSL is absent. No installation, administrator/WSL change or restart occurred. User approved preparing setup steps only. See [stage-2 report](docs/P0_VALIDATION_STAGE2.md), [setup plan](docs/DOCKER_SETUP_PLAN.md) and [independent MLA 9 package](docs/mla9-review/README.md). No independent reviewer approval is claimed.

---

# P0 local pilot preparation — October 28, 2026

See [P0_LOCAL_READINESS.md](docs/P0_LOCAL_READINESS.md) for access verification, unassigned legacy-data safeguards, upload bounds, genuine browser quota/recovery steps, citation review, container configuration, privacy limitations and approval gates. Branch: codex/p0-local-pilot. No cloud services, spending, deployment, invitations or data migration. PR #1 was already merged externally; this branch does not merge anything.

Final verification: 139/139 automated tests passed; production build passed without warnings; TypeScript and git diff whitespace checks passed; production dependency audit found zero known vulnerabilities. Production HTTP deny-by-default smoke passed. Valid PDF/DOCX integration and three live Crossref searches passed. Real Chromium quota, failed-save export/retry, queued-write interruption, failed-import retry, conflict copies and source restoration passed on disposable origin 127.0.0.1:3017. Docker/Linux, real Cloudflare login/origin enforcement, browser crash/disk-flush behavior and external MLA 9 review remain unverified. Historical sections below are retained as history and do not override the current report.

---

# Private beta preparation from d692764

This development pass supersedes earlier verification counts. See [QA_REPORT.md](docs/QA_REPORT.md) for 49 real-source provenance, confirmed fixes, 118-test coverage, browser checks, remaining risks and exact reproduction steps. See [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the staged Supabase/OpenAlex/Unpaywall/private-hosting assessment, costs and migration safeguards.

Stable main remains at d692764; changes belong to codex/private-beta-qa and must be reviewed before merge. No cloud integration, credentials, deployment, paid API, AI writing or student-data migration was introduced.

---

# Current stabilization pass — October 28, 2026

This section supersedes completion claims in the historical audit below. Work was verified in the standalone Desktop Quillora repository on main, initially clean and synced at afeae86. No AGENTS.md exists in the project, its app/lib/tests directories, or ancestor folders checked. README.md, REPOSITORY.md, the previous audit, current source, and available tests were read before edits. No pre-existing uncommitted work was present. No AI features, credentials, hosting, or visual redesign were added.

## Changes verified in current source

### Citations (APA and MLA only)

- Retained publisher capitalization rather than guessing which words are proper nouns, acronyms, mixed-case brands, or non-English titles. Style-specific warnings request APA sentence case or MLA title case review. Automatic capitalization remains a limitation, not a completed feature.
- Fixed APA compact dotted and hyphenated given-name initials, the lowercase second-part exception, and the 21-author ellipsis punctuation. Fixed MLA suffix loss and plural page labels for en-dash ranges.
- Empty/partial structured author data no longer produces blank author lists or silently drops legacy coauthors. Unstructured names are retained with a review warning; missing titles receive a disclosed bracketed description, without quotation marks in MLA. No missing facts are invented.
- APA prefers an explicit article number to article-local pages and formats it with Article. MLA omits explicit article identifiers and their local pagination; DOI, year, journal, volume/issue and genuine page ranges remain when supplied. The earlier audit's claim that article numbers were universally handled was incomplete.
- Consulted official [APA sentence case](https://apastyle.apa.org/style-grammar-guidelines/capitalization/sentence-case), [APA journal examples](https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references), and [MLA article-number guidance](https://style.mla.org/journals-with-article-numbers/). The MLA article-number post is marked as eighth-edition guidance; the citation dialog remains a draft requiring final style review, not a claim of complete ninth-edition conformance.

### Storage failure handling

- All persistent mutations now pass through lib/storage.ts: source save/removal, assignment creation/editing, source linking, checklist changes, and backup merges. One setItem write is attempted; the app never clears or removes saved work to make room.
- Visible work changes only after a successful write. Quota or denied writes preserve previously persisted bytes and the last saved interface state. The attempted replacement is held separately in memory, with Export attempted changes, Retry save, and an explicit discard action. A normal Export backup includes saved work; failed attempts use their separate export.
- Failed imports keep their preview and do not announce success. Retry success clears the failed-import preview/message. Failed assignment edits do not claim they were saved; creation failures are visible inside the naming dialog as well as the recovery message.
- Unreadable initial data blocks saves and provides stored-data recovery. A changed/cleared storage key in another tab blocks writes; a pre-write snapshot comparison also rejects stale writes. This is not a cross-tab transaction lock.

### Manual rubric checklist

- Each confirmed requirement line is a checkbox within the existing assignment interface. Checks are explicitly the student's confirmation; nothing infers completion from source counts or predicts a grade.
- Progress is stored per assignment and included in backup files. Legacy assignments begin unchecked. Editing a question alone preserves progress; exact unchanged requirement text retains its progress even if reordered. Changed/new wording begins unchecked; deleted items disappear on explicit save.
- Imports validate checklist shapes and their correspondence to the assignment's requirements. Conflicting checked/unchecked states are preserved as separate imported copies, not combined or overwritten. Repeat identical imports do not multiply copies.

## Verification and reproduction

- Production search verification initially reproduced a 503 for the social-connection query while direct Crossref and development requests succeeded. Explicit no-store fetching was added to avoid reusing a production fetch response, with non-sensitive server error diagnostics. After rebuilding, the existing production integration case passed for all three searches. The earlier cached response was not inspected, so caching is a suspected cause rather than a proven upstream diagnosis.
- npm test: 50 passing regression tests across citation, checklist, storage, controlled component, search-error, and existing workflow tests.
- npm run build: production compilation, lint, TypeScript validation, and route generation passed. npx tsc --noEmit also passed.
- npm audit --omit=dev: zero known production dependency vulnerabilities when checked.
- Controlled quota simulation: tests/storage.test.ts throws QuotaExceededError from an injected StoragePort for each mutation path and asserts byte-for-byte preservation, an actionable error, and a successful retry after removing the simulated failure. tests/checklist.test.ts covers checklist quota failure. tests/storage-ui.test.ts mounts the real Home component in JSDOM and verifies source-removal, checkbox, and import failure/retry behavior, including the displayed recovery messages and unchanged visible saved state. JSDOM is a component simulation, not a real browser quota test.
- Run simulated checks with: node --import tsx --test tests/storage.test.ts tests/storage-ui.test.ts tests/checklist.test.ts. No production simulation switch or test-only API route was added.
- Real in-app browser workflow used an isolated test origin: import tests/fixtures/checklist-workflow.json; merge; open Assignments; mark A's first requirement; confirm B remains unchecked; edit A's question and replace Use APA with Use MLA; confirm and save; refresh; verify A's unchanged first item is still checked and B is untouched. Copy APA and MLA citations and read the clipboard; export a backup; remove the source; restore the backup; refresh; verify the source and checklist are restored. Uncheck A and reimport its earlier checked backup: the original stays unchecked and a checked imported copy appears.
- Final production smoke check also imported the exported backup on 127.0.0.1:3002 and verified restored sources, edited question, and per-assignment checks after refresh. The normal localhost saved-work origin was not modified by these test imports.
- Production server integration checks: PDF/DOCX rubric extraction, invalid/unsupported/missing upload handling, query validation, and three live Crossref searches with individual-record title/DOI comparisons. Run npm start -- --port 3002, then set TEST_URL to http://127.0.0.1:3002 and run node tests/integration.mjs. The script now leaves tracked fixtures unchanged unless UPDATE_FIXTURES=1 is explicitly set.

## Remaining limitations and exact follow-up checks

1. Capitalization is preserved, not automatically converted. Reproduce: import tests/fixtures/checklist-workflow.json, open Assignments, Cite the article, select MLA, and copy. The source's sentence-case title is retained; apply MLA title capitalization in the destination while preserving proper nouns and acronyms. APA title-case metadata likewise needs manual sentence-case review. Legacy author strings still need manual inversion/initial checks. Plain-text copying does not preserve italics.
2. Actual browser quota exhaustion and browser policy denial were not exercised; only injected quota/denial failures and JSDOM UI recovery were tested. For a real-browser follow-up, use a disposable profile/origin, import the fixture, export a baseline, fill separate temporary test keys until storage reaches its actual quota, then attempt a source save, assignment edit, checklist change, and import. Compare quillora-work before/after; it must be unchanged on failure. Remove only the temporary test keys and choose Retry save; refresh and compare the exported work. Do not perform this on the user's normal saved-work origin.
3. Cross-tab checks reject observed stale writes but cannot guarantee atomicity for simultaneous writes. Unverified race reproduction: in a disposable profile open two tabs, pause both immediately before setItem after their snapshot reads, then resume both. The second completed write can win. Use a single editing tab and export backups until transaction locking is implemented; no multi-tab merge guarantee is made.
4. Pending failed changes are memory-only until retry or export. Reproduce using a controlled test write failure, make an edit, then reload without exporting/retrying: only the previously saved version returns. The recovery message instructs export/retry before refresh.
5. Rubric extraction remains pattern matching and its checklist is wholly manual. Search results do not certify rubric compliance or support for claims. Access and peer-review labels remain unknown; this pass did not add a verification service. Publisher destination bot checks, every mobile/browser combination, encrypted/scanned PDF variants, and extreme decompression/memory cases remain unverified. Use the existing invalid/scanned-file path and pasted text for unreadable rubrics.

---

# Historical audit before standalone extraction

# Quillora stabilization audit

Date: October 28, 2026

## Recovery

The original implementation was committed before stabilization: `2193b6a` (`Checkpoint Quillora before workflow stabilization`). The repository root is the parent `portfolio` directory; only the `quillora` project was staged. To inspect the old version without discarding current work, create a separate Git worktree at that commit. Do not use a hard reset to review it.

## Fixes

- Replaced failing legacy PDF parsing with the current parser and explicit cleanup. Valid PDF and DOCX rubrics extract successfully. Missing, empty, oversized, unsupported, malformed, and unreadable uploads receive practical errors. Scanned PDFs still need pasted text.
- Extraction recognizes written source counts and articles as well as sources, preserves peer-review wording including negation, and separates publication-date instructions from unrelated deadlines. Extracted instructions remain editable and require confirmation; they are not a promise of automatic rubric compliance.
- Assignment creation now uses an in-page name form. Stable assignment IDs survive refresh and backup restore. Existing assignment questions, rubric text, and confirmed details can be updated with **Save assignment details**.
- Source removal consistently removes the source from the library and every assignment. A saved source can be added to the active assignment without unsaving it first. Source search context is retained with the record.
- Prevented stale search responses from replacing a newer search. Crossref outages, rate limits, and malformed responses return an error, never fabricated articles. DOI links are canonicalized, including imported sources.
- APA uses structured family names and initials, an ampersand, and the 20/21-author boundary. MLA inverts only the first author, keeps a second author in natural order, and uses et al. for three or more. Missing authors move the title first; missing dates use APA n.d. and are omitted in MLA. Missing optional fields are omitted. Article numbers are distinguished from pages; missing-volume punctuation and question-title punctuation are handled. Journal/volume italics are visible in the dialog.
- Citation warnings flag legacy unstructured author names, missing author/date/journal metadata, capitalization review, and plain-text clipboard formatting. Copy failures now appear inside the citation dialog. Modals support Escape and contain keyboard focus.
- Browser storage is explicitly described as limited to this device, browser, and website address, without synchronization or server backup. Unreadable stored data is not overwritten automatically. Write failures remain visible and in-memory work can be exported. Changes in another tab block further writes until recovery/refresh.
- Added versioned JSON export/import. Import first validates the entire file, shows counts, and requires **Merge backup**. Existing source metadata wins on DOI duplicates. Assignment conflicts become separately named imported copies. Repeated conflict imports merge source links without overwriting the original. Invalid versions, malformed sources, duplicate assignment IDs, and oversized backups are rejected.
- Isolated development output from production output, added local lint configuration, and patched the transitive PostCSS dependency. No visual redesign or additional research service was introduced.

## Checks passed

- `npm test`: 19 regression tests, including citation boundaries and missing fields, backup round trips/conflicts/repeated imports, unsafe imported URLs, save/remove/link behavior, rubric wording, and simulated offline/rate-limited/malformed Crossref responses.
- `npm run build`: production compilation, lint, TypeScript checking, and route generation passed.
- `npm audit --omit=dev`: zero known vulnerabilities at the time checked; the complete dependency audit also returned zero after the dependency correction.
- `node tests/integration.mjs` against a running production server: valid PDF/DOCX extraction; invalid PDF and unsupported-file errors; missing-file, empty-query, and overlong-query rejection; three live Crossref searches returning 24 records each; sample DOI/title checks against individual Crossref records.
- Browser: PDF upload and editable extraction; DOCX extraction review; confirmed requirements; assignment creation; live search; save/remove; APA and MLA copying verified through clipboard reads; saved assignment question/rubric/source after refresh; edited question after refresh; export download; conflict-preserving import; malformed import rejection; free-access empty state and year filtering. Production browser smoke check restored an exported backup and verified it after refresh.
- Original-source action opened the DOI's resolved ScienceDirect publisher URL. Publisher bot protection then prevented viewing that page; no challenge was bypassed.

## Metadata spot checks

1. DOI `10.1093/geroni/igaf122.2051`: title, Selina Vogel/Susanne Zank, 2025, Innovation in Aging 9, Supplement_2, and article identifier agree with [Oxford Academic](https://academic.oup.com/innovateage/article/9/Supplement_2/igaf122.2051/8411370). This is a conference-session abstract in a journal supplement; a journal record alone does not establish a full research article or peer review.
2. DOI `10.1016/j.uclim.2025.102290`: title, Mohammad Fereshtehpour/Mohammad Reza Najafi, 2025, Urban Climate 59, and article 102290 agree with the [Elsevier publisher record](https://www.sciencedirect.com/science/article/pii/S2212095525000069). This check exposed the article-number/page ambiguity, now corrected.
3. DOI `10.1016/j.caeai.2022.100049`: title, Jiahong Su/Weipeng Yang, 2022, journal, volume 3, and article 100049 agree with the [authors' institutional research record](https://repository.eduhk.hk/en/publications/artificial-intelligence-in-early-childhood-education-a-scoping-re). Direct publisher viewing was blocked, so this is an institutional corroboration, not a completed direct publisher-page check.

Citation review used the official [APA journal examples](https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references), [APA missing-information guidance](https://apastyle.apa.org/style-grammar-guidelines/references/missing-information), and [MLA multiple-author guidance](https://style.mla.org/same-author-different-coauthors/).

## Limits and unverified cases

- Access and peer-review status remain **unknown** throughout the app because the current discovery integration does not verify them. Free-full-text and verified-peer-review filters therefore legitimately produce no results for these records. Publisher evidence found during this audit is not hardcoded into runtime badges.
- Rubric extraction is conservative pattern matching, not comprehensive semantic interpretation. Confirmed requirements are displayed for manual review; they do not automatically constrain Crossref queries or certify article compliance. Complex rubrics and ambiguous dates require student review.
- Citation title capitalization is preserved rather than guessed. Legacy author strings cannot reliably be split into given/family names. Plain-text copies need italics applied in the destination. These limitations are disclosed in the dialog; arbitrary records are not guaranteed submission-ready.
- Real browser quota exhaustion, browser-denied storage, simultaneous cross-tab writes, all mobile browsers, encrypted/scanned PDF variants, huge DOCX decompression, and every publisher destination were not exercised end to end. Storage failures have protective code paths; this is not a claim those environment cases were browser-tested.
- Export files contain source metadata and rubric text. Keep them privately. The backup imported during browser QA contains only synthetic assignment instructions and a real public article.

## Private hosted preview requirements

No deployment was requested or performed during stabilization. Use a host that runs Next.js App Router with Node.js 24, server routes, the PDF parser's packaged worker/native dependencies, HTTPS, outbound HTTPS access to api.crossref.org, and request-body limits compatible with 10 MB uploads. A static-only host cannot run these upload/search routes. Install from the lockfile with `npm ci`, then `npm run build` and `npm start`.

The preview needs host-level owner-only authentication or deployment protection: the application itself has no sign-in or access restriction. No Crossref API key is required. Confirm protected access and rerun the production upload/search checks in the hosting environment before sharing its URL. Local data will not transfer automatically to the new hostname; export locally and import on the preview. Hosting does not add cross-device synchronization or server backups.
