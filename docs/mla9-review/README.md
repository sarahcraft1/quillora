# Quillora independent MLA 9 review package

Prepared 28 October 2026 against application commit `90045ea`. **Not yet reviewed or approved by an independent reviewer.** No package has been sent to anyone. Contains public bibliographic metadata only; no student questions, rubrics, backups, credentials or full articles.

## Files and independent workflow

1. Give a qualified librarian/style reviewer this folder and access to the MLA Handbook, 9th edition (through their existing library access; no purchase is authorized).
2. Start with `cases.json`, `original-metadata.json` and `REVIEW_WORKSHEET.md`. There are **13 real difficult examples and 3 explicitly synthetic missing-field variants**, selected from the frozen 49-source dataset. Original deposits retain retrieval URLs/timestamps and checksums. Check the publisher record via each DOI; Crossref deposits may be incomplete or differ from the version consulted.
3. Write an independent expected citation, including italic spans, for each case BEFORE opening `application-outputs.json` or `provisional-expectations.json`. Record the MLA 9 section/page and source metadata evidence. Missing fields must not be invented. Synthetic omissions test behavior; they are not additional real articles or authentic publisher variants.
4. Compare with `application-outputs.json`, which records the application's exact plain-text output, separate italic span and warnings. These are observed outputs, **not independently correct expected outputs**. Capitalization has not been silently corrected. Mark pass / correction required / insufficient metadata / unresolved.
5. `provisional-expectations.json` contains expected rule behavior, a hand-prepared Su/Yang candidate with a disclosed title-case edit, and blank reviewer-expected fields. Null means unresolved, never passing. Even the hand-prepared candidate needs independent approval for article-number handling. Populate reviewerExpected, reviewerRuleSection, verdict and correction notes. Do not approve a case merely because app and provisional candidate agree.
6. Return the worksheet and reviewed expectations. Only approved, independently justified outputs should become future regression gold standards. Preserve the original package and record reviewer/date/version in a new reviewed copy.

## Difficult cases and decisions requested

- One, two, three-plus and 21-plus authors; Unicode/non-English names and preferred capitalization; group/individual-name ambiguity must be flagged rather than guessed.
- Quoted titles, acronyms, scientific markup and title case; title-edit warnings versus exact publisher wording.
- Article numbers, e-locators stored only as pages, issue-less journals and DOI location.
- Missing author/date/title and optional journal fields; disclose descriptions and omit unknown facts appropriately.
- Three-digit page-range abbreviation. The application retains full publisher page ranges and warns, rather than claiming MLA 9 completion.
- Nested quotation punctuation, terminal punctuation, italic journal spans and suffixes where encountered; do not infer suffixes not in metadata.

Primary references consulted: [MLA ninth-edition core examples](https://style.mla.org/works-cited/citations-by-format/) and [MLA core template](https://style.mla.org/works-cited/works-cited-a-quick-guide/). The publicly available [article-number answer](https://style.mla.org/journals-with-article-numbers/) explicitly refers to edition 8; it cannot independently settle MLA 9. Handbook access/reviewer completion remains a staging gate.

The application preserves unknown access and peer-review status and makes no credibility certification. Metadata provenance is not source endorsement. Plain-text copy needs italics applied at the destination; review `parts.italic` separately.

## Reproduction and integrity

From repository root: `node --import tsx scripts/prepare-mla-review.ts`. This is offline and reproducible from frozen metadata. `manifest.json` hashes the five data/worksheet files and records baseline/counts. The generator does not update source fixtures or contact scholarly services. Do not run it after a reviewer has filled in the worksheet without first preserving the reviewed copy; generation recreates the blank package.
