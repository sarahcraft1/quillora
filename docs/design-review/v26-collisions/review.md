# Quillora V2.6 — Layout correction review

Historical V2.6 review, captured November 13, 2026 before the subsequent V2.7 GitHub synchronization. Open `index.html` alongside this file for the screenshot comparisons and theme matrix.

## Implemented in this pass

1. **Tablet My Desk:** the desktop two-column structure cramped the current assignment at 768px. It now stacks at 761–900px without changing navigation or academic content.
2. **Class cards:** nested grids and fixed 160px strip cards squeezed titles. A shared `--class-card-min:200px` drives adaptive grids and the existing mobile horizontal strip. Classes naturally fills a single column on narrow phones.
3. **Buddy controls:** a late flex rule overrode the intended artwork layout. Named grid areas preserve a separate radio/name row and a 72px artwork area.
4. **Assignment actions:** a dedicated wrapping action row prevents the uneven parent grid from squeezing Open assignment beside Evidence Board.
5. **Quick Notes stacking:** an independently scrolling body keeps the title outside the scrolling content, including clear confirmation at short viewport heights.
6. **Assignment overview:** a wrapped heading/action row now has token-based separation from the research question.
7. **Quick Notes keyboard focus:** the browser rejected focus while the collapsed launcher was still hidden. Restoration now happens after the closed state is rendered. The existing focus test models that browser restriction.

## Files modified for these corrections

Repository: `sarahcraft1/quillora`, branch `codex/v2-my-research-desk`.

- `app/desk-home.css`: adaptive home layout, class grid and assignment action row.
- `app/desk-design.css`: buddy choice grid.
- `app/workspace-spacing.css`: shared class minimum and overview header separation.
- `app/research-desk.tsx`: group the existing assignment buttons.
- `app/quick-notes.tsx`: scroll-body wrapper and focus restoration timing.
- `app/quick-notes.css`: title/body scrolling separation.
- `tests/quick-notes.test.ts`: realistic mobile focus regression.

Earlier V2.5/V2.6 changes and other uncommitted work were preserved. No academic data models or persistence formats changed in this pass.

## Visual verification

Actual rendered screenshots were inspected, not just page measurements.

- Personalized My Desk in Scholarly, Bookish and After Hours: 320, 375, 430, 768 and 1440px CSS widths.
- Classes: narrow phone, larger phone, tablet class strip and desktop, including an empty workspace.
- Assignment overview, discovery, saved sources, evidence cards and an expanded source notebook; includes a 1024px tablet view.
- Atmosphere, My Buddy, Decorations and Layout in all three themes; desktop draft and discard previews.
- Quick Notes open/closed, every theme, desktop dock, mobile sheet, empty scratchpad, short-height clear confirmation, Escape and visible focus restoration.
- Empty My Desk in all three themes and empty Evidence Board.

Sample QA data was kept at `http://localhost:3035/`. Empty-state review used `http://localhost.:3035/`, a separate browser origin reaching the same loopback-only application. The normal `http://127.0.0.1:3035/` origin and its stored research were not overwritten.

Eight before/after pairs are included. The keyboard correction has an additional after screenshot; it is a focus defect, not a visual overlap.

## Targeted checks

15 distinct affected component/navigation cases passed. After the focus change, the 11 Quick Notes and related navigation cases passed again, including the stronger hidden-launcher regression. Relevant coverage: isolated scratchpad autosave, minimize/remount, confirmation/cancel, copy/failure, save recovery, tab conflicts, mobile focus trap/Escape, identity isolation, corrupted storage, assignment resume, classes, personalization, and navigation preserving drafts/research.

TypeScript passed with no emitted files. Git whitespace check passed. No full tests or production build.

Package-lock SHA256 remains `A1CBF715AE74B103CA246FB28056EB616C6CA110DD9D8F59474F1294AC0DC91B`.

Branch: `codex/v2-my-research-desk`, existing HEAD `85f4a0e`. No commit, push, merge or deployment was performed. No additional dependencies or security/credential changes.

## Remaining verification

No further unintended overlap was observed in the screenshots reviewed. A physical mobile device and its on-screen keyboard were not available; the 375 × 350 browser check covers the constrained-height layout but does not establish real-device keyboard behavior. Screen-reader behavior was not separately audited.

Preview: http://127.0.0.1:3035/
