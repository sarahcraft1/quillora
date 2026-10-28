# WSL prerequisite installation — October 28, 2026

After the user authorized proceeding with administrator-level WSL prerequisite installation (but no restart), `wsl --install --no-distribution` completed with exit code 0. Microsoft WSL 3.0.3 was installed and VirtualMachinePlatform was enabled. Windows explicitly reports changes require reboot. A read-only `wsl --version` confirms WSL 3.0.3.0 / kernel 6.18.54.1-1. No Ubuntu distribution was requested.

No restart, firmware change, Docker installation, deployment or student-data operation was performed. Firmware virtualization still reports false. The next action requires an explicitly approved restart and user-controlled BIOS/UEFI virtualization enablement, followed by read-only verification. Docker/Linux tests remain NOT RUN. Installer output is retained locally in `%TEMP%/quillora-wsl-prerequisites/install.log`; completion status is in `result.json`. Only the expected WSL/Windows prerequisite operation was authorized; unrelated settings must remain unchanged.

This update supersedes the earlier statement that WSL was absent. Commit 90045ea remains the only authorized/pushed follow-up code commit; subsequent review/setup documentation remains local.

---

# P0 validation stage 2 — 28 October 2026

## Completed

- Pushed exactly `90045eaae6b75e78e7315ab2576daec2c4b1d78e` on `codex/p0-local-pilot` to the existing private GitHub repository. `git ls-remote` independently confirmed the remote hash. No main update, merge, deployment or new cloud service.
- Read-only computer compatibility checks completed. Hardware supports CPU virtualization/SLAT and has about 32 GB RAM, but firmware virtualization is disabled and WSL is not installed. Docker installation and Linux execution are blocked by prerequisite changes requiring explicit approval. Preparing setup steps was subsequently approved; executing them was not.
- Prepared [Docker setup plan](DOCKER_SETUP_PLAN.md), with explicit firmware, administrator, WSL, terms and restart boundaries.
- Prepared [independent MLA 9 review package](mla9-review/README.md): 13 real cases + 3 labeled synthetic omissions, untouched 49-record metadata with provenance, observed outputs/italic spans/warnings, provisional expected behavior, reviewer-expected fields, blind worksheet and reproducible manifest. No independent reviewer has completed it; no package sent externally.
- Reran all 139 automated tests: pass, zero failures. These include signature/issuer/audience/expiry/required-claim checks, spoofed/unauthorized requests, session separation, body caps/deadline, valid/malformed extraction, ZIP inflation, PDF page limit, worker timeout/exit and concurrent admission. They ran on **Windows**, not in a Linux container.

## Not run / not claimed

| Check | Result |
| --- | --- |
| Production Linux image build/start, Node/native dependency compatibility | NOT RUN: Docker/WSL prerequisites unavailable |
| Container health endpoint and unauthorized network requests | NOT RUN in Linux; prior local Windows production HTTP checks passed |
| Hard container memory limit, OOM, native-memory stress, recovery/restart | NOT RUN |
| Linux PDF/DOCX extraction, resource and concurrent-upload checks | NOT RUN; analogous Windows regressions pass |
| New actual-browser quota tests this stage | NOT RERUN; prior disposable Chromium checks remain documented |
| MLA 9 independent human approval | PENDING; package prepared only |
| Real Cloudflare, domain bypass, lifecycle, provider logs | NOT RUN: services/staging not authorized |

No new application defect was found by the regression run. An unavailable Linux runtime is an environment blocker, not an application pass or failure.

## Next decision

Approve actual local prerequisite setup, beginning with administrator-level WSL installation and a user-controlled firmware-virtualization step. Any restart still needs explicit approval at action time. The existing answer approved **preparing steps only**. Until then do not install/configure WSL, change firmware, elevate, or restart. Once Linux checks and MLA review are complete, private staging additionally needs separate account/configuration/spending/deployment approval. Students are not invited.

The review package/setup documentation follow-up is retained locally on the same development branch. Only commit 90045ea was authorized for pushing; follow-up material has not been pushed. Student data, backups, design and application code are unchanged during this stage.
