# Citation acceptance follow-up — 2026-11-11

Scope: `codex/citation-release-polish`, starting at `a34749c`, draft PR #6.
Only synthetic assignments and the existing synthetic Su/Yang fixture were used.
No student work, exports, production credentials, hosting, or citation-formatting rules were changed.

## Decision

The observed Chrome/Edge workflow supports a **supervised, controlled local pilot**, with manual checking of every reference, routine local backup exports, and the stated clipboard fallback instructions. This is not a merge recommendation, comprehensive browser certification, or WCAG 2.2 AA conformance claim. Keep PR #6 draft. Native permission-denial and spoken screen-reader checks remain release gates; unresolved MLA identifier/page-range review remains a citation accuracy limitation.

## Confirmed defects and corrections

1. A successful copy followed by a failed retry retained the previous success status and “Copied” button. A new JSDOM regression first failed on that assertion. Copy attempts now clear prior success/error state before starting.
2. The failure message instructed users to select a non-focusable paragraph, with no straightforward keyboard-only recovery. On failure, a labelled read-only textarea now receives focus and selects the complete current citation. Instructions explain Ctrl+C/Command+C and that this recovery field is plain text: journal/volume italics must be reapplied. The original formatted citation remains available for selection. The recovery field is constrained to the existing modal width.
3. Editing capitalization now clears obsolete copy-error feedback. Switching styles already cleared it. No formatting algorithm or stored source metadata changed.

The regression exercises APA and MLA: success → denial → selected manual field → successful retry. It checks exact text, focus, selection range, read-only semantics, and removal of stale alerts/statuses. Existing API-level tests cover rich HTML, plain fallback, absent ClipboardItem, rejected writes, and missing clipboard APIs. These automated tests simulate failures; they are not browser permission tests.

## Environment and evidence boundaries

| Environment | Version / method | Scope |
|---|---|---|
| Windows Chrome | 157.0.8103.39, installed executable ProductVersion | Native UI, local pilot and isolated browser fixture |
| Windows Edge | 157.0.4341.46, installed executable ProductVersion | Native UI, actual localhost Next application |
| In-app Chromium browser | Exact version not exposed by the available DOM interface | Actual localhost rendering, accessible names/roles, keyboard checks and initial viewport measurements; not counted as Chrome or Edge |
| Firefox | Not found in app inventory or checked standard installation directories | Not tested; no browser installed for this task |
| Microsoft Word desktop | Existing unsaved synthetic Document1 | Actual OS clipboard paste |
| Google Docs in Chrome | Web application, version not exposed | New document “Quillora QA — Synthetic Citation Paste Test”; actual OS clipboard paste |

An ignored `.qa-output/acceptance.html` fixture bundled the actual Home component and CSS, using only `quillora-qa-final-synthetic` storage. Its clipboard selector deliberately substituted APIs for failure cases. `next/link` was replaced with a basic anchor in this fixture. The native mode restored the original browser clipboard implementation. It ran from a local file because sandbox-started loopback servers could not be reached from desktop browsers. It is not a production-origin permission test. Existing localhost browser storage and backup files were not cleared or imported over.

## Clipboard matrix

| Case | Result | Evidence / limitation |
|---|---|---|
| Native rich APA and MLA → Word | Pass | Chrome earlier session and Edge follow-up; journal italics preserved; APA volume italic, separator/issue/article identifier upright; MLA journal italic. Author order, DOI and punctuation visually retained for the two-author sample. |
| Native rich APA and MLA → Google Docs | Pass | Chrome, actual browser ClipboardItem/write implementation in isolated fixture; both pasted with journal italics and APA volume italics. Reviewed MLA capitalization supplied explicitly. |
| Clipboard API unavailable | Pass, injected in Chrome | Error visible; focused, fully selected manual field; no success reported. |
| ClipboardItem unavailable, text writer available | Pass, injected in Chrome | Plain success explicitly tells the user to reapply italics. Capturing writer is a test double, not an OS paste result. |
| Rich HTML write rejects, text write resolves | Pass, injected in Chrome | Plain fallback status; no false rich-format claim. |
| Both writes reject / denied | Pass, injected in Chrome | Error/manual recovery for APA and MLA; earlier successful-copy state removed on failed retry. Not a native site-permission denial. |
| Manual selection + Ctrl+C → Word | Pass | Actual OS manual copy from focused APA recovery textarea; full citation pasted as plain text, as disclosed. |
| Native browser site permission blocked | Not tested | Permission settings were not changed; injected NotAllowedError is separate evidence. |
| Every failure case in Edge / Firefox; every fallback × destination × style | Not completed | Native Edge rich paths tested; full cross-product not claimed. |

Italics cannot survive a genuinely plain-text clipboard format. Recovery preserves the citation text and discloses the required formatting repair; it does not pretend to preserve rich formatting. General citation accuracy is not established by clipboard fidelity. The sample still carries the existing MLA article-identifier warning, and title case is explicitly reviewed by the user rather than inferred automatically.

## Browser, layout and accessibility matrix

| Check | Confirmed result | Limits |
|---|---|---|
| Assignment creation, live Crossref discovery, source save | Pass in localhost Chrome/in-app session and Edge | Synthetic data only; one scholarly two-author record, DOI 10.1016/j.caeai.2022.100049 |
| Empty assignment name | Browser rejects empty required field; accessible label present | In-app browser observed native “Please fill out this field.”; spoken announcement untested |
| Saved assignment, question and source after reload | Pass, in-app/earlier Chrome and Edge | Return to Search resets transient active/search state; saved assignment data remains in Assignments |
| Citation focus | Pass in in-app browser and native Chrome/Edge | Initial close focus; Shift+Tab wraps to Copy; Tab wraps to close; visible focus; Escape dismisses and returns to Cite. Main dialog paths tested, not a full application tab-order audit. |
| 320px | Pass for inspected Chrome fixture source card/actions and citation dialog | DevTools responsive viewport, not physical mobile hardware; text wraps and Copy scrolls into view by keyboard |
| 375px | Pass for inspected source/assignment/card/dialog paths | Chrome DevTools and prior localhost browser QA; dialog content scrolls to Copy |
| 768px | Inspected Chrome fixture saved-source/citation layout contained | DevTools width, fit-to-window scaled display; not an exhaustive tablet workflow |
| 1440px | Inspected Chrome fixture saved-source/citation layout contained | DevTools width, scaled display; not an exhaustive desktop workflow |
| Horizontal overflow | None observed in inspected paths | Initial in-app dialog measurements at 320/375/768/1440 showed document scroll width equal to client width; later viewport override became unreliable and returned unchanged widths, so those later measurements were discarded. No global no-overflow guarantee. |
| 200% and 400% native browser zoom | Edge citation dialog reflows; keyboard reaches Copy at 400%; zoom restored | Main workflow at all zoom levels not exhaustively tested. Development-only Next indicator grows/overlays at high zoom; production UI does not include it. |
| Accessible labels and roles | Dialog name, form labels, named icon close/cancel actions; success role=status and errors role=alert verified in DOM/source | No spoken Narrator/NVDA/JAWS verification; accessibility tree inspection alone is not a screen-reader pass |
| Contrast | Automated CSS-token calculations passed | Muted text: paper 5.67:1, card 6.03:1, sidebar 5.35:1, selected/notice background 4.78:1; white primary text 6.25:1; green focus/paper 5.83:1. Not a complete rendered contrast, target-size or WCAG audit. |
| Error recovery | Clipboard failure → manual field/retry verified; existing simulated search/storage/rubric recovery suite passes | Real network outage/retry, every upload error, every screen-reader error announcement not retested in browsers |

## Regression validation of the corrected source

| Command | Result |
|---|---|
| `npm test` | **170 passed, 0 failed** |
| `npx --no-install tsc --noEmit --incremental false` | **Pass**, exit 0 |
| `npm run build` in existing checkout | Blocked by EPERM creating existing `.next/types/app/api`; not treated as a source failure |
| `npm run build` in clean copy | **Pass**, exit 0, Next.js 15.5.28; tracked files plus new regression copied with installed dependencies to ignored `.qa-output/build-validation`; no config/lockfile workarounds |
| `npm audit --json` and `npm audit --omit=dev --json` | Refresh **blocked**: ENOTFOUND registry.npmjs.org; neither current audit is a pass |
| Earlier same-day audit of unchanged lockfile | Six moderate findings, development-only @typescript-eslint → minimatch chain, GHSA-g3hv-75wg-m249; production-only audit zero. Historical result only. No fixes applied. |
| Existing GitHub CI | Earlier a34749c run passed; does not validate the new follow-up commit until pushed/rerun |

The initial follow-up regression run caught missing assignment state during development; it was restored before the final 170/170 run and clean build. No package or lockfile changed. Local logs are ignored under `.qa-output/final-*`.

## Remaining release work

- Verify actual denied clipboard permission and unsupported behavior in allowed native browser contexts, including text/manual recovery to both document editors.
- Complete spoken screen-reader acceptance, including required-field errors, dynamic copy status, manual recovery focus, and background/dialog navigation.
- Run Firefox when available, and extend Edge narrow-width, zoomed main-workflow, and failure-path coverage.
- Review all required WCAG 2.2 AA criteria, beyond the sampled keyboard/contrast checks.
- Resolve MLA 9 article-identifier/page-range questions against authoritative guidance; keep manual verification disclosures meanwhile.
- Refresh the audit and run new-commit CI in an authorized network environment. Keep PR #6 draft; do not merge or deploy.
