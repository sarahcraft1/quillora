# Quillora V2 visual review — November 12, 2026

Preview: http://127.0.0.1:3035/ (verified in the in-app browser after the user started the server in their own PowerShell). Keep that terminal open. No security settings were changed.

Base commit: 23df9b7, branch codex/v2-my-research-desk. PRs #6 and #7 were not modified.

## Verified in a real browser, using responsive viewport overrides

- Scholarly homepage at 320 × 740, 375 × 812, 430 × 932; desktop at 1440 × 1000. No horizontal document overflow at inspected widths. Empty states and a synthetic saved assignment were inspected.
- Bookish and After Hours desktop desks; Bookish phone desk; After Hours desk and Evidence Board at 320px. Text, controls and navigation fit the inspected layouts.
- Studio at 320px, 375px and 430px, plus desktop. Theme and buddy selection, live previews, animation toggle, and Escape dismissal with focus restoration worked.
- Quill, Inky, Sprig and Folio selected through the studio; original buddy assets displayed. GIF loading verified for Quill and Folio. Sprig was also viewed with animation disabled.
- Phone navigation reached Classes, Research, Evidence and Sources. A synthetic assignment named “Design review — student research” and Scholarly/Folio preferences survived reload.
- Screenshots in this directory are actual browser captures, not design mockups. Full-page captures include fixed navigation at its viewport position.

## Confirmed defect corrected locally

On narrow screens the hidden research-heading line break joined “research” and “starts.” Added an explicit space before the break in app/home.tsx. Hot reload showed “Good research starts here.” wrapping correctly at 320px. No academic logic changed. No previously successful test suites were repeated for this text-only correction.

## Limits

These are browser viewport checks, not physical-phone tests. This focused visual review did not revalidate citation accuracy, external discovery, rich clipboard behavior, populated source/evidence cards, screen-reader behavior, all keyboard paths, OS reduced-motion, or browser restarts. The previous successful automated checks were not repeated. No full accessibility compliance claim is made.

The synthetic assignment was created in the initially empty preview origin. Existing research was not removed, restored or overwritten. Local screenshots and the text correction remain available for design review; no commit, push, merge or deployment was performed in this review.
