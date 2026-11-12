# Quillora research-index redesign

## Direction

One shared responsive application, designed around a phone research index rather than a narrowed desktop dashboard. The default desk is restrained: resume first, compact course tabs, an assignment ledger, a source shelf, and evidence next steps. Desktop uses a course directory beside the main work column. Phones use a fixed compact masthead and five thumb-reachable destinations: My Desk, Classes, Research, Evidence, Sources. Assignments retain contextual links between Research and Evidence.

The studio is now a full-page workspace with live previews and three coordinated presets: Quiet scholar, Library margins, Night notebook. Existing theme, buddy, palette, name, spacing and widget settings remain. New optional settings add background patterns, heading treatments, widget order and muted dialogue. Reset to Professional Defaults changes appearance only.

Scholarly uses editorial rules and quiet surfaces. Bookish uses literary typography and double-rule framing. After Hours adds restrained star motifs and indexed details. Reading-heavy panels retain solid surfaces. Buddies use the eight original GIF/PNG assets unchanged and sit below the academic work instead of above Continue Researching.

## Buddy voices

- Quill: “A good question deserves a little room to unfold.”
- Inky: “Punctuation has entered the chat.”
- Sprig: “Little notes grow into big ideas.”
- Folio: “Quietly rooting for a well-labelled bibliography.”

Short contextual lines respond to confirmed saved sources, notes, evidence groups and checked requirements, plus actual assignment/citation opening. Messages do not invent accomplishments, review verification or scores. Another thought cycles general encouragement on demand. Messages can be dismissed or muted; animation and the buddy remain optional. Reduced-motion rules select still assets and suppress CSS motion.

## Preservation

Citation formatting, clipboard implementation, Crossref adapters, academic models, research persistence, backup format and original assets were not modified. Presentation and preference parsing were extended around those systems. Preferences stay under the existing separate preference key. New optional preferences safely default when absent; invalid options are ignored. No accounts, dependencies, production settings or services were added.

## Verification and limitations

- 23 targeted workspace, UI and dialogue tests passed. A JSDOM-only missing scrollIntoView method exposed a need for optional method invocation in the studio opener; this was guarded afterward. The affected navigation test was checked again.
- Project-wide TypeScript passed.
- Production build passed in `.qa-output/editorial-validation`, an isolated source copy using the existing dependencies. Existing build outputs were preserved.
- Before the environment interruption, the desktop redesigned composition and phone studio controls were inspected in the real in-app browser. Final phone workflow acceptance, all-three-theme screenshots, reduced-motion OS switching, screen-reader checks and the final screenshot set could not be completed.
- After continuation, the previous preview server was unavailable. A restarted server reached Ready, but localhost access reported a socket access-permission error; the browser timed out. Native app inventory also returned no applications. No authentication, firewall or security settings were changed. No final visual acceptance pass or screenshot deliverable is claimed.

## Local preview

Intended address: http://127.0.0.1:3020/ . Access is currently blocked in this tool session. From a normal authorized PowerShell terminal, the existing preview source copy can be started with:

```powershell
Set-Location -LiteralPath 'C:\Users\sarah\OneDrive\Desktop\portfolio\quillora\citation-release\.qa-output\mla-build-validation'
$env:QUILLORA_ACCESS_MODE='local'
npm.cmd run dev -- --port 3020
```

It uses the existing port-3020 browser storage. No site data should be cleared. Keep PR #7 in draft, preserve PR #6 unchanged, and complete final visual review before considering a merge. Nothing was deployed.
