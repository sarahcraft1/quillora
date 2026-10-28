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
