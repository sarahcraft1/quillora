# MLA 9 accuracy review — 11 November 2026

Reviewed from `91f3e48` on `codex/citation-release-polish`, PR #6. AI-assisted evidence review, not independent librarian certification. The original 16-case packet, raw deposits, checksums and blank independent-review worksheet remain unchanged. No student data or backups were modified.

## Plain-English finding

The journal-reference structure was mostly sound, but not every generated reference was accurate enough to submit unchanged. Confirmed formatting/normalization defects were numeric page ranges that remained unshortened, nonconsecutive page lists, and lost separately deposited Crossref subtitles. These are corrected and regression-tested. Metadata mismatches and missing typography cannot safely be repaired by a formatter; warnings now cover more of those cases.

**Conditional yes for a supervised pilot using DOI-bearing journal articles:** a supervisor must verify every source byline, title capitalization/typography, date and locator against the version read. Exclude the blocked cases below until corrected from the original source. **No for unattended, submission-ready MLA generation or a claim of complete MLA 9 compliance.** Keep PR #6 draft; this review does not clear the separate accessibility/permission-testing gates.

## Rule evidence and confidence

Sources retrieved 11 November 2026. Rule identifiers below distinguish normative MLA material from university interpretation. Older-edition pages are explicitly labelled and are not treated as conclusive ninth-edition evidence.

| ID | Source | Supported conclusion / limit |
|---|---|---|
| R1 | [MLA current core examples](https://style.mla.org/works-cited/citations-by-format/) and [online works](https://style.mla.org/works-cited/citations-by-format/online-works/) | Source/container distinction, article quotes, italic journal/book containers, relevant core elements in order. These examples do not authorize treating a whole book as a journal article. |
| R2 | [UBC MLA 9 articles](https://guides.library.ubc.ca/c.php?g=725315&p=5195214), [CSU Channel Islands MLA 9](https://libguides.csuci.edu/citations/MLA) | University guides explicitly for edition 9: first author inverted, second natural order, three-plus first author plus et al.; names remain in byline order. |
| R3 | [CSU MLA 9, page numbers](https://libguides.csuci.edu/citations/MLA), [MLA pointer to section 2.139](https://style.mla.org/in-text-citations-overview/), R1's shortened-range example | University guide gives the complete decimal-range rule and MLA sections: retain at least two end digits, more when needed. Implementation is restricted to unambiguous full decimal ranges. Hyphen/en-dash typography is not treated as a substantive defect. |
| R4 | [MLA managing editor's ninth-edition notes](https://style.mla.org/closer-look-at-mla-style/) | Section 5.92: nonconsecutive periodical pagination uses first page followed by plus. Section 5.93: DOI URL prefix. Also confirms month/season and nested-title typography matter. |
| R5 | [MLA punctuation and quotation marks](https://style.mla.org/punctuation-and-quotation-marks/) | Cites edition 9: terminal periods within closing quotes; nested double quotation marks become single marks. Existing tested behavior retained. |
| R6 | [MLA pages and DOI](https://style.mla.org/page-range-and-doi/) | Current text cites edition 9, p. 188: DOI preferred to URL; online journal references may omit page ranges, or include them when useful. No duplicate DOI and URL needed. |
| R7 | [MLA article-number answer](https://style.mla.org/journals-with-article-numbers/) and [Marist library answer](https://marist.libanswers.com/faq/424779) | MLA's page explicitly says edition 8; Marist currently recommends omission of article numbers and restart-at-1 PDF pages. R6 supports DOI-only location. Retain conservative omission, without claiming a fully verified edition-9 identifier rule. Jackson College's edition-9 identifier example is [TBA](https://libguides.jccmi.edu/mla/article), not evidence for a new rule. |
| R8 | [SCSU MLA 9 title guide](https://libguides.southernct.edu/c.php?g=1232672&p=9299279), [MLA capitalization explanation](https://style.mla.org/capitalization-of-titles/) | English headline capitalization; preserve language-specific conventions and proper nouns. The MLA explanation is edition 8; SCSU is labelled edition 9. Capitalization stays an explicit user edit, not an automatic rewrite. |
| R9 | [Crossref title markup](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/titles) and [bibliographic guidance](https://www.crossref.org/documentation/principles-practices/best-practices/bibliographic/) | Subtitle can be a separate field; Unicode and meaning-bearing inline markup can occur. Normalization must not silently drop a supplied subtitle. Plain-text normalization does not preserve semantic italic spans. |
| R10 | [MLA core template](https://style.mla.org/works-cited/citations-by-format/), [Penn State MLA 9 core elements](https://guides.libraries.psu.edu/mlacitation/articles) | Omit unknown optional facts rather than inventing them. A missing-title description is disclosed as a placeholder, not a verified publication title. Missing-author/date/title examples are not approval to submit incomplete records. |
| R11 | [APA official journal examples](https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references) | Control examples: Grady full pagination and author initials; Jerrentrup article number; Sanchiz missing issue. These verify APA and bibliographic facts, not MLA rules. |
| R12 | [MLA suffix discussion](https://style.mla.org/names-with-suffixes/) | Edition-8 prose guidance explicitly redirects inverted Works Cited names elsewhere. Does not settle every natural-order suffix edge case in MLA 9. Existing suffix behavior is not newly certified. |

## Confirmed defects, exact examples and changes

| Defect | Before | Corrected behavior | Evidence / regression |
|---|---|---|---|
| Decimal range abbreviation | Grady `pp. 207–217`; Zhou `pp. 1054–1062`; Mortazavi `pp. 621–628` | `pp. 207–17`; `pp. 1054–62`; `pp. 621–28` | R3; boundary examples include 96–101, 103–04, 395–401, 923–1003, 1003–05, 1608–74. APA keeps full ranges. |
| Nonconsecutive pages | Synthetic `pp. 12–14, 18–19`; existing `12+` incorrectly used singular `p.` | `pp. 12+` for both supplied variants | R4; numeric comma-separated page segments only; single `49` remains `p. 49`. |
| Separate subtitle lost | Synthetic Crossref title `Main Title`, subtitle `A Subtitle` normalized to only `Main Title` | `Main Title: A Subtitle`; already included subtitles not repeated; `Why Research? A Study` preserves question punctuation | R9 plus title/subtitle templates in R2; no saved sources rewritten. Applies to new normalization in both citation styles. |
| Incomplete warning coverage | Journal/author U+FFFD damage had no encoding warning when title was clean; mixed consortium/individual lists only sometimes got a generic long-list warning | Specific encoding and mixed group/individual warnings; MLA year-only/inline-typography limitation disclosed | Publisher comparisons below and R9. No guessed Unicode repair, byline replacement, publication month or semantic italics. |

`tests/mla-accuracy.test.ts` adds five focused regression tests with multiple boundary cases; `tests/corpus.test.ts` updates only the MLA shortened-range expectation. APA's independent full-range expectation remains unchanged. Existing citation-copy, manual recovery, edited-title and stored-source tests remain in the full suite.

## All 16 cases: substantive verdicts

“Conditional” means the formatter follows the supported rules for supplied fields, but the draft needs the listed human/source checks. It is **not** a finished-reference pass. No case is marked fully certified. Common English capitalization and year-only date checks apply wherever relevant.

| Case | Result after corrections | Finding and required action |
|---|---|---|
| MLA-01 Su/Yang | Conditional — identifier review | Two-author order and missing-issue omission correct. DOI-only locator retained under R6/R7; title needs explicit headline-case edit. Prior Elsevier metadata check retained; full publisher access previously 403. |
| MLA-02 Jerrentrup | Conditional — format pass | Seven-author byline/order, title, DOI and 2018 freshly rechecked at [PLOS](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0193972). Existing et al. and nested single quotes correct. e0193972 is not a traditional page; omission retained with warning (R7). PLOS casing/version and publication date precision require source review. |
| MLA-03 Grady | Conditional — corrected range | R11 freshly confirms 8(3), 2019, 207–217 and five authors. MLA now 207–17; reviewed English title used in actual browser/Word/Docs checks. This is a derived MLA draft, not an official MLA citation supplied by APA. |
| MLA-04 Einstein | Conditional — format pass | A. remains A.; German title/casing retained. 891–921 must remain full because the hundreds differ. Prior Wiley metadata comparison retained; no fresh full-text byline certification. |
| MLA-05 Huang | Conditional — format pass | First of 29 followed by et al.; 497–506 remains full. Prior Elsevier title/volume/issue comparison retained; full byline still not independently certified. Long-list warning remains. |
| MLA-06 human genome | **Blocked — byline not trustworthy** | Current normalized list mixes consortium plus individuals and yields consortium + et al.; publisher credits consortium as the main byline. [Nature indexed publisher evidence](https://www.nature.com/articles/35057062?trk=public_post_comment-text) corroborates this; direct live fetch redirects to identity service. New specific warning; do not use draft unchanged or hardcode a DOI exception. |
| MLA-07 Bashkortostan article | **Blocked — insufficient metadata** | No author, only starting page 49; publisher verification still incomplete. Title-first and p. 49 accurately reflect supplied data but do not establish actual author or full pages. Do not infer 49–52 from a PDF filename. |
| MLA-08 Fereshtehpour/Najafi | Conditional — identifier review | Two structured names/order and DOI present. Prior Elsevier evidence retained for volume 59/year 2025/article 102290. Omit identifier under conservative R7 policy; no invented issue; check month/version. |
| MLA-09 Sanchiz | Conditional — format pass | Exactly three authors → first + et al.; M. not expanded. Question mark inside title remains. 67–78 and absent issue correct; R11 freshly confirms those facts. |
| MLA-10 Robinson | Conditional — source typography review | Seven-author list → first + et al.; 24–26 retained. Prior Nature metadata check retained; correspondence is a journal item, not proof of a research article. `James T` remains supplied; no unverified name punctuation expansion. |
| MLA-11 Zhou | Conditional — corrected range | 19 authors → first + et al.; 1054–62 corrected. Preserve COVID-19/Wuhan/China. Prior Elsevier evidence retained; English capitalization and source-version review required. |
| MLA-12 Mortazavi | Conditional — corrected range | Five authors → first + et al.; 621–28 corrected; RNA-Seq unchanged. Prior Nature evidence retained; any semantic typography and exact issue/date must be checked. |
| MLA-13 Heisenberg | **Blocked — damaged metadata** | Fresh [Springer record](https://link.springer.com/article/10.1007/BF01397280) confirms Über, für, W. Heisenberg, 43, 172–198, March 1927. Stored input has replacement characters. Range now 172–98; both title and journal warnings apply. No guessed character correction or invented expanded name. |
| MLA-14 synthetic missing date | Conditional — missing-field behavior pass | Date omitted in MLA, n.d. in APA. Range 207–17. This is a deliberate omission test, not an authentic alternate edition or a complete citation. |
| MLA-15 synthetic missing author/title | **Blocked — not submission-ready** | Unquoted bracketed placeholder and missing-author/title warnings; 207–17. No invented authors/title, no claim placeholder equals original title. |
| MLA-16 synthetic missing volume/issue/pages | Conditional — omission behavior pass | Omit all deliberately removed fields; keep journal/year/DOI; no empty labels or restored facts. Does not prove source really lacks those fields. |

Fresh publisher opens were limited to PLOS and Springer plus APA control examples. Other publisher comparisons are carried forward explicitly from `ASSESSMENT-2026-11-11.md`, not represented as newly fetched full-text validation. None of the 16 original deposit inputs was changed.

## Scope and remaining uncertainty

- Supported path: DOI-bearing journal records discovered with Crossref's `type:journal-article` filter. Crossref is metadata provenance, not a byline/style authority.
- Whole books, edited books, book chapters, non-DOI URLs, database-specific second containers, translations, article-level editors, unusual surname/suffix conventions, arbitrary non-Arabic pagination, and semantic scientific/book-title italics are **not certified** by this formatter. Do not describe it as a general-purpose book citation generator. Publisher information required for books is out of scope; it must not be invented or inserted into the journal template.
- Publication date currently stores year only. Month/season is not reconstructed. Missing author details, translated/multiple titles and group credits still require checking the original version. Title edits are citation-local; author metadata cannot be interactively repaired in the current citation dialog.
- Article-number omission is a conservative DOI-locator policy with corroborating library guidance; the older MLA answer alone does not certify edition 9. A librarian/handbook review is still appropriate for edge cases.
- Plain text cannot carry italics. The fallback explicitly requires italics to be reapplied; rich clipboard fidelity does not independently prove a source's citation facts.

## Actual validation

Full final results and GitHub delivery are recorded in PR #6. Local final suite: 175 passed/0 failed; project TypeScript passed. Production build passed in an ignored clean copy using unchanged installed dependencies/config/lockfile (Next 15.5.28); existing host-owned `.next` permissions had previously required this approach. Exact source equality is checked before delivery. No dependency changes were made.

Actual Chrome 157.0.8103.39 on Windows: live Crossref Grady search → APA display → MLA switch → explicit reviewed headline title → rich copy → Word and Google Docs paste. MLA journal italics, quotation marks, author order, DOI punctuation and 207–17 survived both pastes. Switch back showed original APA sentence-case draft and full 207–217; MLA title edit did not leak into APA. This pass did not claim fresh APA paste verification after the later interruption.

Plain/rich fallback, rejection, manual focus/selection and exact text equality were exercised by automated test doubles/JSDOM (simulations), including the existing accessibility regression. Prior native failure-harness results are in `CITATION_ACCEPTANCE_2026-11-11.md`; they were not re-labelled as new browser tests. Native permission-denial and spoken screen-reader acceptance remain outstanding. The browser/editor session was closed during the interruption, so further fresh paste checks were not claimed.

## Exact current-output audit trail

`final-accuracy-outputs.json` records every baseline and corrected output, italic spans, warnings, input metadata checksum and verdict. Baseline text is formatter output at `91f3e48`, **not a correct-answer key**. Corrected raw text intentionally retains original capitalization/damaged metadata to show where human review is still needed. The following output pairs are generated from that audit trail, not presented as independently approved full references.

### MLA-01 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Su, Jiahong, and Weipeng Yang. “Artificial intelligence in early childhood education: A scoping review.” Computers and Education: Artificial Intelligence, vol. 3, 2022, https://doi.org/10.1016/j.caeai.2022.100049.
```

After (original input, capitalization not silently edited):

```text
Su, Jiahong, and Weipeng Yang. “Artificial intelligence in early childhood education: A scoping review.” Computers and Education: Artificial Intelligence, vol. 3, 2022, https://doi.org/10.1016/j.caeai.2022.100049.
```

Italic spans: `Computers and Education: Artificial Intelligence`.

### MLA-02 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Jerrentrup, Andreas, et al. “Teaching medicine with the help of ‘Dr. House.’” PLOS ONE, vol. 13, no. 3, 2018, https://doi.org/10.1371/journal.pone.0193972.
```

After (original input, capitalization not silently edited):

```text
Jerrentrup, Andreas, et al. “Teaching medicine with the help of ‘Dr. House.’” PLOS ONE, vol. 13, no. 3, 2018, https://doi.org/10.1371/journal.pone.0193972.
```

Italic spans: `PLOS ONE`.

### MLA-03 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, vol. 8, no. 3, 2019, pp. 207–217, https://doi.org/10.1037/ppm0000185.
```

After (original input, capitalization not silently edited):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, vol. 8, no. 3, 2019, pp. 207–17, https://doi.org/10.1037/ppm0000185.
```

Italic spans: `Psychology of Popular Media Culture`.

### MLA-04 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Einstein, A. “Zur Elektrodynamik bewegter Körper.” Annalen der Physik, vol. 322, no. 10, 1905, pp. 891–921, https://doi.org/10.1002/andp.19053221004.
```

After (original input, capitalization not silently edited):

```text
Einstein, A. “Zur Elektrodynamik bewegter Körper.” Annalen der Physik, vol. 322, no. 10, 1905, pp. 891–921, https://doi.org/10.1002/andp.19053221004.
```

Italic spans: `Annalen der Physik`.

### MLA-05 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Huang, Chaolin, et al. “Clinical features of patients infected with 2019 novel coronavirus in Wuhan, China.” The Lancet, vol. 395, no. 10223, 2020, pp. 497–506, https://doi.org/10.1016/s0140-6736(20)30183-5.
```

After (original input, capitalization not silently edited):

```text
Huang, Chaolin, et al. “Clinical features of patients infected with 2019 novel coronavirus in Wuhan, China.” The Lancet, vol. 395, no. 10223, 2020, pp. 497–506, https://doi.org/10.1016/s0140-6736(20)30183-5.
```

Italic spans: `The Lancet`.

### MLA-06 — BLOCKED: byline, damaged or insufficient metadata; see report

Before (`91f3e48`):

```text
International Human Genome Sequencing Consortium, et al. “Initial sequencing and analysis of the human genome.” Nature, vol. 409, no. 6822, 2001, pp. 860–921, https://doi.org/10.1038/35057062.
```

After (original input, capitalization not silently edited):

```text
International Human Genome Sequencing Consortium, et al. “Initial sequencing and analysis of the human genome.” Nature, vol. 409, no. 6822, 2001, pp. 860–921, https://doi.org/10.1038/35057062.
```

Italic spans: `Nature`.

### MLA-07 — BLOCKED: byline, damaged or insufficient metadata; see report

Before (`91f3e48`):

```text
“Connection of the visual system functional condition with person social well-being.” Доклады башкирского университета, 2018, p. 49, https://doi.org/10.33184/dokbsu-2018.1.8.
```

After (original input, capitalization not silently edited):

```text
“Connection of the visual system functional condition with person social well-being.” Доклады башкирского университета, 2018, p. 49, https://doi.org/10.33184/dokbsu-2018.1.8.
```

Italic spans: `Доклады башкирского университета`.

### MLA-08 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Fereshtehpour, Mohammad, and Mohammad Reza Najafi. “Urban stormwater resilience: Global insights and strategies for climate adaptation.” Urban Climate, vol. 59, 2025, https://doi.org/10.1016/j.uclim.2025.102290.
```

After (original input, capitalization not silently edited):

```text
Fereshtehpour, Mohammad, and Mohammad Reza Najafi. “Urban stormwater resilience: Global insights and strategies for climate adaptation.” Urban Climate, vol. 59, 2025, https://doi.org/10.1016/j.uclim.2025.102290.
```

Italic spans: `Urban Climate`.

### MLA-09 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Sanchiz, M., et al. “How do older and young adults start searching for information? Impact of age, domain knowledge and problem complexity on the different steps of information searching.” Computers in Human Behavior, vol. 72, 2017, pp. 67–78, https://doi.org/10.1016/j.chb.2017.02.038.
```

After (original input, capitalization not silently edited):

```text
Sanchiz, M., et al. “How do older and young adults start searching for information? Impact of age, domain knowledge and problem complexity on the different steps of information searching.” Computers in Human Behavior, vol. 72, 2017, pp. 67–78, https://doi.org/10.1016/j.chb.2017.02.038.
```

Italic spans: `Computers in Human Behavior`.

### MLA-10 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Robinson, James T, et al. “Integrative genomics viewer.” Nature Biotechnology, vol. 29, no. 1, 2011, pp. 24–26, https://doi.org/10.1038/nbt.1754.
```

After (original input, capitalization not silently edited):

```text
Robinson, James T, et al. “Integrative genomics viewer.” Nature Biotechnology, vol. 29, no. 1, 2011, pp. 24–26, https://doi.org/10.1038/nbt.1754.
```

Italic spans: `Nature Biotechnology`.

### MLA-11 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Zhou, Fei, et al. “Clinical course and risk factors for mortality of adult inpatients with COVID-19 in Wuhan, China: a retrospective cohort study.” The Lancet, vol. 395, no. 10229, 2020, pp. 1054–1062, https://doi.org/10.1016/s0140-6736(20)30566-3.
```

After (original input, capitalization not silently edited):

```text
Zhou, Fei, et al. “Clinical course and risk factors for mortality of adult inpatients with COVID-19 in Wuhan, China: a retrospective cohort study.” The Lancet, vol. 395, no. 10229, 2020, pp. 1054–62, https://doi.org/10.1016/s0140-6736(20)30566-3.
```

Italic spans: `The Lancet`.

### MLA-12 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Mortazavi, Ali, et al. “Mapping and quantifying mammalian transcriptomes by RNA-Seq.” Nature Methods, vol. 5, no. 7, 2008, pp. 621–628, https://doi.org/10.1038/nmeth.1226.
```

After (original input, capitalization not silently edited):

```text
Mortazavi, Ali, et al. “Mapping and quantifying mammalian transcriptomes by RNA-Seq.” Nature Methods, vol. 5, no. 7, 2008, pp. 621–28, https://doi.org/10.1038/nmeth.1226.
```

Italic spans: `Nature Methods`.

### MLA-13 — BLOCKED: byline, damaged or insufficient metadata; see report

Before (`91f3e48`):

```text
Heisenberg, W. “�ber den anschaulichen Inhalt der quantentheoretischen Kinematik und Mechanik.” Zeitschrift f�r Physik, vol. 43, no. 3-4, 1927, pp. 172–198, https://doi.org/10.1007/bf01397280.
```

After (original input, capitalization not silently edited):

```text
Heisenberg, W. “�ber den anschaulichen Inhalt der quantentheoretischen Kinematik und Mechanik.” Zeitschrift f�r Physik, vol. 43, no. 3-4, 1927, pp. 172–98, https://doi.org/10.1007/bf01397280.
```

Italic spans: `Zeitschrift f�r Physik`.

### MLA-14 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, vol. 8, no. 3, pp. 207–217, https://doi.org/10.1037/ppm0000185.
```

After (original input, capitalization not silently edited):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, vol. 8, no. 3, pp. 207–17, https://doi.org/10.1037/ppm0000185.
```

Italic spans: `Psychology of Popular Media Culture`.

### MLA-15 — BLOCKED: byline, damaged or insufficient metadata; see report

Before (`91f3e48`):

```text
[Journal article; title unavailable]. Psychology of Popular Media Culture, vol. 8, no. 3, 2019, pp. 207–217, https://doi.org/10.1037/ppm0000185.
```

After (original input, capitalization not silently edited):

```text
[Journal article; title unavailable]. Psychology of Popular Media Culture, vol. 8, no. 3, 2019, pp. 207–17, https://doi.org/10.1037/ppm0000185.
```

Italic spans: `Psychology of Popular Media Culture`.

### MLA-16 — CONDITIONAL: supported supplied-field formatting; source/title/date review still required

Before (`91f3e48`):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, 2019, https://doi.org/10.1037/ppm0000185.
```

After (original input, capitalization not silently edited):

```text
Grady, Jessica Stoltzfus, et al. “Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States.” Psychology of Popular Media Culture, 2019, https://doi.org/10.1037/ppm0000185.
```

Italic spans: `Psychology of Popular Media Culture`.
