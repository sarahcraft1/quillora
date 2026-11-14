# Final pre-pilot acceptance — 11 November 2026

Reviewed source: `2bf08786e5773b2e125c1a2610d531fbe6de6a85`, branch `codex/citation-release-polish`, draft PR #6. This follow-up makes no application, dependency, lockfile or security-setting changes. No new high-impact defect was confirmed, so no speculative source fix or redundant regression test was added. Existing work and backups were preserved; one clearly labelled synthetic assignment and a new backup were added through the actual application.

## Decision

**Conditional GO for a facilitated 2–3 student practice pilot on the verified Chrome/Edge paths, DOI-bearing journal articles only.** A facilitator must verify every citation against the original source, validate each participant's required input/assistive technology before their session, and check backups. Use [the pilot guide](SUPERVISED_PILOT_GUIDE.md). This is not approval for unattended academic use, a Firefox compatibility claim, screen-reader certification, general MLA compliance, merge, deployment, or expansion of access.

**NO-GO for an unrestricted or accessibility-complete release.** The unperformed checks below remain open. The pilot cannot claim those requirements passed. Prior MLA review remains in force: [12 conditional cases and 4 blocked cases](mla9-review/FINAL-ACCURACY-2026-11-11.md); blocked metadata is excluded.

## Verified browser results

Actual Windows Chrome version **157.0.8103.52 (Official Build, 64-bit)** read from `chrome://version` in this session. Earlier reports used Chrome 157.0.8103.39; they are historical evidence, not fresh results for this updated version. Edge 157.0.4341.46 results below are also carried forward explicitly from [earlier acceptance](CITATION_ACCEPTANCE_2026-11-11.md), not rerun here.

| Check | Actual result | Evidence and boundary |
|---|---|---|
| Local application and live discovery | Pass, Chrome | Actual Next app at `127.0.0.1:3000`; a synthetic DOI query returned Crossref results. Search is relevance-based, not exact DOI retrieval. No claim of a live Crossref outage. |
| Assignment keyboard dialog | Pass on inspected path, Chrome | Initial name-field focus; empty submission showed native required-field validation; Tab from input to submit to close stayed inside; Escape dismissed and visible focus returned to New assignment; Enter reopened it. Creation completed by keyboard. Spoken announcement not verified. |
| Citation keyboard/recovery | Pass on inspected path, Chrome isolated fixture | Shift+Tab wrapped from initial close to Copy with visible focus. Enter invoked native clipboard failure; labelled manual field was focused and fully selected. Error exposed as alert, no false Copied status. |
| Native clipboard denied by document policy | Pass for this denial mechanism, Chrome | Isolated loopback document sent `Permissions-Policy: clipboard-write=()`. Unmodified native `navigator.clipboard.writeText` probe returned actual `NotAllowedError` explicitly naming permissions policy. Actual Home copy fell through to its manual field; Ctrl+C then paste into the address field (not submitted) retained the full APA citation/DOI. This is browser-enforced rejection, **not** an injected JavaScript rejection and **not** a user-denied site-permission prompt. Browser/security settings were untouched. |
| Controlled HTTP 503 and retry | Pass, real Chrome HTTP against isolated server | Displayed Crossref-unavailable alert and Retry search. Server restored a valid fixture response; clicking Retry displayed a source and removed error state. This verifies client handling, not the upstream route's live outage behavior. |
| Controlled empty response | Pass visually, Chrome | HTTP 200 with empty articles removed old result cards and displayed No sources match these filters/Clear filters. No spoken result announcement claimed. |
| Interrupted response | Pass, real Chrome connection failure against isolated server | Local test server began JSON then destroyed the connection. Native fetch failed, loading ended, visible `Failed to fetch` alert and Retry search appeared. Error wording is technical but recovery is available. This is not a physical Wi-Fi disconnect. |
| Reload and persistence | Pass, actual local Next app | Created QA Prepilot Recovery — Synthetic; saved its question and waited for Assignment details saved; reload returned to Search, Assignments retained question and original saved-source count. Original QA assignment remained. A reload attempted while a save was pending showed the browser's unsaved-change warning; cancelled it and waited for save before successful reload. |
| Export backup | Pass, actual app and downloaded file | Export backup produced `quillora-backup (5).json` (2,281 bytes) in Downloads. Parsed the file read-only: version 1, two assignments, one saved source, newly saved synthetic assignment/question present. No old backup overwritten; the actual app storage was not used for the restore drill. |
| Backup restore rehearsal | Pass, Chrome isolated synthetic fixture | Imported the freshly exported file into the separate port-3108 synthetic workspace; preview, Merge backup and saved confirmation observed. Reload retained all four assignment names (two fixture seeds plus the two imported assignments), one deduplicated saved source, and the restored synthetic question. Actual port-3000 work remained untouched by import. |
| Browser offline/reconnect | Pass for saved-work recovery, actual app | DevTools Go offline led to fail-closed session-verification message. DevTools Go online, close tools, reload same address restored app with both assignment names and saved-source count intact. No OS network/security settings changed. Unsaved-draft recovery and live retry during a physical outage are not certified. |
| Edge workflow/zoom; rich pastes to Word/Docs | Earlier verified, not rerun | See earlier acceptance and MLA review for actual native rich paste, zoom and keyboard observations. Do not count them as fresh runs of this session. |

The ignored `.qa-output/prepilot-entry.jsx` bundles the reviewed Home component, actual CSS, React and citation code. `next/link` is represented by a basic anchor; it uses only a new synthetic storage key `quillora-qa-prepilot-20261111`. Its test server runs on loopback port 3108. Native clipboard APIs were not replaced. HTTP failure/empty responses were controlled by that server, and the mid-response failure used a destroyed socket. Those fixture results do not replace production/access-middleware testing. Existing automated API tests simulate upstream network errors, 429 and malformed Crossref responses and passed in the full suite.

## Unperformed checks and limits

| Requirement | Status and reason |
|---|---|
| Firefox | **Not tested.** Absent from available app inventory and checked Program Files, Program Files (x86), and user-local Mozilla installation paths. No browser installed for this task. |
| Native user-denied clipboard site permission | **Not tested.** No existing denied origin was available; changing browser permissions/security settings was excluded by the task. Policy-denial evidence above is narrower. |
| Spoken Narrator acceptance | **Blocked by test environment.** Narrator was present (installed binary 10.0.26100.8972), launch exposed a higher-integrity window inaccessible to the available controls; no speech output was available to assess. Ended the attempt; Narrator no longer appeared in the final app inventory. UI accessibility-tree inspection is not a screen-reader pass. |
| NVDA/JAWS | **Not tested.** No usable installed instance discovered; standard NVDA locations checked. No assistive technology installed or settings changed. |
| Complete keyboard order / screen-reader virtual navigation | **Not certified.** Only the listed dialog and recovery paths were inspected. Full background/virtual-cursor isolation and dynamic announcements need a real assistive-technology reviewer. |
| Whole-app WCAG 2.2 AA, all browser/viewport combinations | **Not certified.** Earlier sampled contrast, responsive and zoom checks remain bounded; no comprehensive compliance claim. |
| Physical network interruption, delayed-request reload across browsers | **Not fully tested.** Actual tab offline/reconnect plus controlled socket interruption were exercised. No physical network disruption, exhaustive delayed-request reload matrix, or fresh Edge/Firefox fault matrix. |
| Exhaustive backup failure matrix | **Not rerun in real browsers.** Successful export/import/reload was verified in isolated storage. Existing simulated corrupt/quota/conflict/import regressions passed; these do not certify every browser-storage failure. |

## Regression and dependency validation

| Command / check | Exact result |
|---|---|
| `npm test` | **175 passed, 0 failed, 0 skipped**, exit 0 |
| `npx --no-install tsc --noEmit --incremental false` | **Pass**, exit 0 |
| `npm run build` | **Pass**, exit 0; clean existing `.qa-output/mla-build-validation` copy, same installed dependencies. All 27 tracked app/lib/config/package files compared byte-for-byte with reviewed checkout: zero mismatches. Original host-owned build output left alone. |
| Sandbox fresh audits | Failed to reach registry: `ENOTFOUND`; not counted as audit results. |
| Fresh desktop `npm audit --json` | Completed against npm registry, **exit 1: 6 moderate, 0 high, 0 critical**. This is a finding, not a clean pass. |
| Fresh desktop `npm audit --omit=dev --json` | **Exit 0: zero reported production vulnerabilities**. Audit is not a security certification. |
| Advisory detail | `GHSA-g3hv-75wg-m249`, minimatch globparts amplification denial of service. Six affected entries are minimatch and five transitive @typescript-eslint packages. All are development tooling; fixAvailable true. No dependency or lockfile edits made. |
| GitHub CI for reviewed application commit | [Run 16](https://github.com/sarahcraft1/quillora/actions/runs/43120621464) passed on `2bf0878` in the preceding review. New documentation-commit CI must be reported separately after push. |

Ignored local evidence: `.qa-output/prepilot-tests.log`, `prepilot-typescript.log`, `prepilot-build.log`, `prepilot-native-audit.json`, `prepilot-native-audit-production.json`. Native PowerShell audit redirects are UTF-16; read with that encoding. Original lockfile and source remained unchanged throughout validation.

## Blockers versus optional work

**Blockers for a particular student session:** inability to use that student's required browser/assistive technology; failed save/reload/export or unverified restore rehearsal; source metadata the facilitator cannot verify; no independent citation review; session connection unavailable. Pause rather than risk the student's work. The four blocked MLA records remain excluded.

**Open release gates:** Firefox acceptance, user-denied permission behavior, spoken screen-reader review including announcements/dialog isolation, expanded network/failure coverage and applicable WCAG review. These block calling the release fully accepted and any broader rollout. PR #6 remains draft.

**Optional before this tightly scoped pilot:** clearer generic network-error wording and development-tooling dependency remediation, provided trusted local tooling inputs are used. Address moderate audit findings in a focused dependency change with its own validation before broader release; do not force-upgrade packages as part of this QA task.
