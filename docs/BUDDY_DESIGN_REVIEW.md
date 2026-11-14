# Desk buddy design review

Open http://127.0.0.1:3020/ and choose **Personalize desk**. Changes are local and uncommitted on the existing V2 branch. Prior uncommitted Evidence Board work was preserved; PR #6 was not modified.

Original transparent assets were copied unchanged from `../buddy-output` into `public/buddies`: Quill, Inky, Sprig and Folio, each with its supplied 128 × 128, eight-frame GIF and RGBA PNG still. No characters or animations were regenerated.

## Experience

- Scholarly, no buddy, no decorations and still-image mode remain the professional defaults for new preferences. Existing theme and density preferences remain valid.
- Personalize desk adds live character previews, four readable accent palettes plus theme defaults, a 60-character desk name, subtle paper details, optional recent-source and research-next-step widgets, and existing spacing controls.
- Classes, assignments, resume navigation and Evidence Board access cannot be hidden through these controls.
- Each companion offers a research check-in based on actual saved notes, questions, reading states, sources or groups. Recent successful research changes trigger a short update reaction; no invented scores, peer-review claims, sounds or pop-ups are added.
- Animation is explicitly optional. Still PNGs replace GIFs when disabled or when the browser matches reduced motion; the brief CSS reaction also respects both controls.
- Preferences continue to use the separate existing `:preferences` storage key. Academic records and backups are not modified by appearance changes.

## Focused verification

- 19 focused workspace/component checks passed, including the new personalization roundtrip and unchanged academic storage bytes. After the reaction refinement, the affected personalization regression was checked again.
- Project-wide TypeScript check passed. No full suite, dependency installation, build, commit or push was repeated for this appearance iteration.
- Real in-app browser: selected buddies and palettes, toggled animation and widgets, named the desk, reloaded and verified retained values, and used arrow keys to change buddy radios.
- 375px mobile layout: selector stacked without horizontal overflow (panel width 328px, content width 326px). Native-sized desktop selector and three theme dashboards were captured. Browser viewport was restored.
- The in-app preview uses synthetic class/assignment data in its separate browser profile. Existing browser research was not cleared or replaced.
- Actual operating-system reduced-motion switching and screen-reader testing were not performed. Reduced-motion image selection and styles are implemented, not claimed as an assistive-technology acceptance pass.

## Captures

- [Buddy selector](buddy-preview/selector.jpg)
- [Scholarly / Quill](buddy-preview/scholarly-quill.jpg)
- [Bookish / Sprig](buddy-preview/bookish-sprig.jpg)
- [After Hours / Inky](buddy-preview/after-hours-inky.jpg)
- [Mobile / Quill](buddy-preview/mobile-quill.jpg)

This is a local design preview, not release approval. Outstanding Evidence Board release QA from the previous iteration is unchanged.
