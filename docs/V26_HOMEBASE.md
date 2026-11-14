# V2.6 — My Desk home base

My Desk now organizes daily work around a personal welcome, a current-assignment resume card, the next active deadline, and manually confirmed checklist progress. Completed assignments are excluded from resume and deadline suggestions; legacy work with no activity timestamps gets an honest open-assignment fallback rather than invented activity.

The sidebar is a flowing stack of deadline, original buddy, and pinned personal bulletin. On phones it becomes part of the main reading flow, keeping the current question, next deadline, and continue action ahead of secondary sections.

## Compatible preferences

The existing browser preference object accepts two additional optional values:

- `studentName`: string, limited to 40 characters on read and input.
- `ornamentPosition`: `left` or `right`; absent values use the original upper-right placement.

Theme presets retain the name, desk title, motto, bulletin, and selected ornament position. Apply/Discard and Return to default retain their established behavior. No academic data migration, dependency, backup-format change, or production configuration was introduced.

The projection in `lib/desk-home.ts` derives deadlines, current work, progress, and recent activity without writing storage. New presentation lives in `app/desk-homebase.tsx` and scoped `app/desk-home.css`; research-area components are reused.

## Validation

19 targeted tests and TypeScript passed. Browser review covered all three themes at 1440 × 1000 and phone widths 320, 375, and 430 at 812px height, using synthetic work on a separate browser origin. No horizontal page overflow or obscured resume button was observed. The compact progress strip is close to the fixed phone navigation at the smallest widths.

Physical-device, screen-reader, and OS-level reduced-motion review remain outstanding. Existing buddy still-image fallbacks, opt-in motion, and reduced-motion rules are retained; the new milestone and hover effects also honor reduced motion.

Existing draft PRs remain unmerged and nothing was deployed.
