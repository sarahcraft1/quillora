# Quillora V2 workspace review

## Scope and preview

Branch: `codex/v2-my-research-desk`. Existing uncommitted V2 work was preserved first in checkpoint `d7ac24f`. Release branch `codex/citation-release-polish` remains at `c758ba0`; PR #6 was not edited. Nothing was merged or deployed.

Open **http://127.0.0.1:3020** on this Windows computer. The running local-only development preview uses `.qa-output/mla-build-validation`, a source copy, so validation does not overwrite the original build outputs. Its browser storage is separate from port 3000. Preview fixtures are synthetic; a different port/browser will have a different research store.

If the preview is stopped, use PowerShell in that preview folder:

```powershell
$env:QUILLORA_ACCESS_MODE="local"
npm.cmd run dev -- --port 3020
```

## Experience

- My Research Desk is the default home and primary navigation destination. Continue Researching resumes the last opened, non-completed assignment. Empty states allow starting immediately without creating classes.
- My Classes replaces Research in Motion. Classes have names, optional course codes, six recognizable icons, and custom accent colors. Class views show linked assignments and their deduplicated saved sources. Uncategorized work always remains reachable.
- Organize assignment exposes class reassignment, optional due dates, and an explicit Active/Completed choice. Pinning brings important assignments first. Upcoming, Due today and Overdue derive from the actual local calendar date; Completed requires the student's choice. Requirements show actual checked items rather than invented percentages.
- Personalize desk previews Scholarly, Bookish and After Hours across navigation, cards, forms, buttons, citation dialogs, and backup surfaces. Comfortable/Compact controls dashboard spacing. Theme radio choices work with keyboard arrows. Reduced-motion preferences retain the existing motion protections.
- Research is still browser-only. The save indicator and existing Back Up Research / Restore Research actions remain available. This iteration did not redesign backup UI.

## Data preservation and compatibility

The existing storage key, locked write/conflict-recovery path, assignment/source IDs, notes, rubrics, research questions, checklist state and citation records are retained. New fields are optional. Legacy records load without an eager migration write or fabricated dates. Removing a class unlinks it; it does not delete assignments or sources. Orphaned class references display as Uncategorized.

Backups remain version 1 with additive optional `classes`, `classId`, `pinned`, `dueDate` and `status` metadata. Restore validates fields and remaps conflicting class IDs while preserving both classes and their associated assignments. Repeated conflicting restores are covered for idempotence. Older Quillora versions can retain core research but will not preserve these new fields if they re-export it; use the V2 version when restoring V2 backups.

Appearance preferences are stored separately under the existing research key plus `:preferences`. Preference errors fall back safely or show a preview-only message and do not modify research. Appearance preferences are not included in research backups. No accounts, database, server persistence, credentials or production configuration were added or changed. Citation formatting and Crossref implementation were not edited.

## Verification

| Check | Result / evidence |
| --- | --- |
| Full automated suite | 190 passed, 0 failed, 0 skipped; `npm test` |
| TypeScript | Passed; `npx tsc --noEmit --incremental false` |
| Production build | Passed; `npm run build` in an isolated source copy with the existing dependencies |
| Legacy data and backup compatibility | Automated model and JSDOM regression passes: additive loading, source retention, class conflict remapping and repeated restore |
| Classes / assignments | Automated create, rename, remove, reassignment, class filtering, pin, due date and explicit completion roundtrips passed |
| Theme / density persistence | Automated whole-shell preference switching, remount persistence and unchanged research bytes passed |
| Sampled palette contrast | Automated selected body/muted/action/resume/focus palette pairs passed their thresholds; this is not a complete computed-style or WCAG conformance audit |
| Real browser | Chrome 157.0.8103.52, Windows; installed executable version recorded |
| Responsive views | Chrome device emulation at 320px, 375px, 768px and 1440px; observed responsive navigation, wrapping and cards; no clipping observed in reviewed areas. These are browser-emulated viewports, not physical devices |
| Actual class and pin persistence | Created synthetic Cultural Psychology / PSYC 30403, associated an existing assignment, pinned it, reloaded, and confirmed the class, pin, assignments and source remained |
| Actual class source retrieval | Opened the class, found its linked saved article, opened its citation dialog |
| Actual theme persistence | Bookish survived reload; After Hours styled the citation dialog; returned preview to Scholarly / Comfortable |
| Actual keyboard checks | Class form filled via Tab; theme and density radio groups changed with arrows; visible focus outline observed; APA/MLA selection and Escape dismissal exercised |

Automation uses Node/JSDOM and is not a substitute for real browser or assistive-technology testing. Full tab-order, focus-trap and focus-restoration coverage was not conclusively verified in this browser session. Native segmented date entry was not completed reliably through UI automation; date validation, calendar states, UI changes and persistence are covered by automated regression tests. Date-picker interaction should receive a short hands-on check before pilot use.

Firefox, Edge, screen readers, physical mobile devices, full browser restart persistence, comprehensive 200%/400% zoom and full WCAG 2.2 AA evaluation were not performed in this iteration. No new Word/Google Docs clipboard acceptance is claimed; the citation/clipboard engine is unchanged and its existing regression tests passed. No new GitHub CI result is claimed for this local work.

During preview restart, session verification briefly displayed its existing fail-closed message while the development server was recompiling. A fresh navigation after startup restored the workspace; previously saved research remained intact. Chrome also reported an existing missing favicon (404), which does not affect research functionality.

## Screenshots

Native Chrome full-page captures at a 1440px CSS viewport. Captured with synthetic research before the later association/pin checks; all represent the implemented interface.

- [Scholarly](v2-preview/scholarly.png)
- [Bookish](v2-preview/bookish.png)
- [After Hours](v2-preview/after-hours.png)

## Recommendation

Ready for Sarah's local design review; do not merge pending that approval. Before another student session, verify native date-picker input and complete keyboard/focus and assistive-technology checks. The next meaningful product improvement is source notes and evidence linked to an assignment's research question, using the existing local storage and backup safeguards.
