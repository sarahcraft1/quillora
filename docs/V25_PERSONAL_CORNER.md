# Quillora V2.5 — personal corner and research workspace

## Delivered

- Three primary destinations: My Desk, Classes, Research. Assignment work has contextual Overview, Discover, Sources & citations, and Notes & evidence navigation, plus the global Reading shelf. Existing source cards, citation dialog and Evidence Board are reused.
- Assignment overview shows the current assignment instead of repeating every assignment. A breadcrumb preserves course and assignment context. Focus mode temporarily minimizes navigation chrome and patterned backgrounds without changing saved research.
- The desk has an optional motto, a small personal bulletin, actual assignment/source totals and pinned/due work. Classes use restrained folder tabs.
- Personalize Desk has Atmosphere, My Buddy, Decorations and Layout categories. Changes remain drafts in a live page preview until Apply to my desk. Discard preview and Escape leave the stored appearance unchanged. Reset previews professional defaults before applying.
- Curated botanical, stamp, washi and celestial ornaments, double/stitch borders, coordinated presets and background patterns. Ornaments are decorative, inaccessible to pointer input, and placed away from academic content. Research views keep solid backgrounds.
- Original four buddy GIFs and still images remain unchanged; dialogue has additional character-specific lines. Existing mute, dismiss, hide and reduced-motion support are retained.
- Backup controls remain the same implementation and format, within a Research safety disclosure. The earlier local mobile heading-space correction is included.

## Data protection

Academic work, citations, Crossref adapters, notes models and backup parsers were not rewritten. Optional identity/stationery preferences extend the separate existing preferences key with validated enums and bounded text. Older preferences retain their default behavior. No new dependencies, services, accounts, storage architecture or production configuration.

## Validation

- Affected Research Desk/workspace tests: 24 cases passed across the initial run (23 passes) and the corrected new route test. The new route test initially used an incomplete Cite selector, then incorrectly expected assignment opening not to update last-opened activity; those test assertions were corrected. No app change was needed for those failures.
- Buddy dialogue/preset tests: 2 passed.
- Project-wide TypeScript: passed, exit 0.
- Production build in the original checkout: blocked by Windows EPERM creating `.next/static/chunks/app/api/rubric`.
- A fresh isolated source copy in `.qa-output/v25-production`: production build passed, exit 0; `/` 34.7 kB, 138 kB first load. An existing exhaustive-dependencies warning in ResearchDesk remains. No dependencies were reinstalled and no successful full suite was repeated.

## Browser review still required

The user's PowerShell preview previously worked at http://127.0.0.1:3035/. During this V2.5 implementation both available browser-control connections returned “Transport closed.” Therefore this revision's mobile (320/375/430), tablet, desktop, theme, focus-mode and studio visuals have **not** been verified in a real browser. No V2.5 screenshots or browser passes are claimed. Screenshots under `docs/design-review` represent the prior 23df9b7 design review and must not be presented as V2.5 evidence.

Before approving the design, verify staged Apply/Discard/Escape, all four studio categories, long desk/motto text, every theme and ornament, workspace-area navigation with unsaved notes, mobile touch targets, focus visibility, reload persistence and backup disclosure access. Physical phones and assistive technologies remain outside this focused automated validation.

PR #7 must remain draft pending visual acceptance. PR #6 is unchanged. No merge or deployment.
