# V2.6 — Shared spacing and Quick Notes

## Spacing

`app/workspace-spacing.css` defines shared horizontal insets for cards, panels, nested evidence cards, controls, icons, and accent clearances. Desktop accents have 20px clear space and phone accents 16px. Nested panels use smaller gutters so padding does not accumulate into a cramped reading column.

The same pass improves mobile preset rows and resume focus visibility. Returning to My Desk resets scroll position; changing academic destinations focuses the new heading without bypassing existing unsaved-edit or failed-save guards.

## Quick Notes

`app/quick-notes.tsx` mounts once within the authenticated workspace, keyed by its existing storage identity. `lib/quick-notes.ts` stores one versioned text record at `storageKey + ':quick-notes'`, separate from research and preferences.

- Up to 20,000 characters, saved after a short typing pause and flushed on minimize, page hide, or unmount.
- No writes during hydration. Conflict comparison prevents overwriting an observed newer record.
- Quota/storage failures retain the current draft and show Not saved. Corrupt or unsupported stored records are preserved.
- Copy has success/failure feedback. Clearing and loading a saved version over a draft require explicit confirmation.
- Scratchpad text is not part of academic backup files. The pad discloses this and offers Copy note.
- At wide desktop widths the workspace reserves a notepad column. Smaller windows use a focus-contained sheet. On phones the launcher occupies a header slot rather than covering academic actions or bottom navigation.
- The sheet uses visual-viewport sizing; minimize and Escape preserve the text. Notes inherit the current theme. A fixed dock is intentional; dragging and multiple notes are not part of this version.

## Verification

20 focused tests and TypeScript passed. Browser review covered the three themes at desktop and 320/375/430px with the notepad open and collapsed. All checked home, overview, source, and evidence layouts stayed within page width; the desktop pad remained separate from main content. A constrained 375 × 350 view was also inspected.

Real-device keyboard and screen-reader acceptance remain outstanding. No production settings, dependencies, academic data structures, backup format, merge, or deployment changed.
