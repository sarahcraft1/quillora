> COMPLETED UPDATE: WSL prerequisites/restart and Docker-specific setup were subsequently approved. Docker Desktop 4.97.0 is installed per-user, virtualization is enabled and Linux validation passes. User personally accepted the agreement. See [LINUX_VALIDATION.md](LINUX_VALIDATION.md). The original preparation-only instructions below remain historical.

# Local Docker prerequisite plan — preparation only

User has approved preparing setup steps, **not executing administrator-level changes, WSL changes or a restart**. None were performed. Docker was not installed because its Linux prerequisites are absent. No paid software, cloud service or deployment is involved.

## Read-only compatibility observations

- Windows 11 Home, 64-bit, build 26200; AMD Ryzen 5 3600.
- Approximately 32 GB physical RAM and 124 GB free on C: at inspection.
- Processor reports SLAT and VM-monitor support: true. Firmware virtualization: **false**. Hypervisor present: **false**.
- WSL executable exists as a Windows entry point, but `wsl --status` says WSL is not installed. Docker CLI is absent.
- Windows Server service is running with automatic startup.
- Motherboard: Gigabyte B450M DS3H WIFI-CF. Exact board revision/firmware-menu layout has not been verified; do not guess revision-specific instructions or flash firmware.

Conclusion: processor/RAM are suitable, but Docker's WSL 2 Linux backend cannot run in the current configuration. These checks are not a successful Docker installation or Linux validation. Docker lists Windows Home as Linux-container-only; no Windows-container requirement exists for Quillora. Confirm Windows servicing status during setup.

## Planned steps, with approval boundaries

1. Save work and ensure a recoverable Windows backup/recovery information is available before system changes. Do not stop other applications, restart, or change firmware automatically.
2. **User-controlled firmware step, at an explicitly approved restart:** consult the board/revision's official manual and enable AMD CPU virtualization (often named SVM). Do not change storage boot mode, Secure Boot, encryption or unrelated options. This requires the user's physical BIOS/UEFI interaction. After returning to Windows, repeat read-only virtualization checks.
3. **Separate administrator/WSL approval:** install WSL without an unnecessary default Ubuntu distribution using Microsoft's `wsl --install --no-distribution` command in an elevated terminal. This enables required Windows virtualization components and installs WSL. Review actual prompts; stop before any restart. Do not add flags, switch backends or change `.wslconfig` without approval. Administrator authentication must be handled by the user.
4. If Windows requires restarting, ask at that point. After approved restart, check `wsl --version` / `wsl --status`, ensuring version >= 2.1.5. Do not unregister/delete any distribution. Any required update is another WSL change and needs authorization.
5. Download Docker Desktop x86_64 only through the official Docker download page. Verify Authenticode publisher/signature before running. Prefer per-user WSL 2 installation (`install --user`) to avoid a privileged Docker service. Stop if the installer asks for unexpected elevation, WSL modifications or reboot. User must review the subscription agreement; do not silently accept terms or sign up for paid features. Do not add users to docker-users or enable TCP daemon access.
6. Start Docker Desktop after its prerequisites/terms are satisfied; verify Linux engine and `docker info`. Do not expose ports beyond loopback. Do not enable Kubernetes, cloud integrations or unrelated features.
7. Build Quillora and run the proposed local resource-limited container from P0_LOCAL_READINESS.md, using only synthetic fixtures mounted read-only. Verify Node 24/non-root process, valid/malformed PDF/DOCX, decompression/page/body limits, concurrent admission, timeout, hard memory limit/OOM and post-failure health/restart. Missing Access configuration must still reject private routes; never introduce a production bypass to make tests pass.

Until steps 1–6 are completed, **all Linux container execution/resource results remain NOT RUN**, rather than failed application tests. Existing Windows tests do not certify Linux/native-memory behavior.

Sources: [Docker Windows requirements/install](https://docs.docker.com/desktop/setup/install/windows-install/), [Microsoft WSL installation](https://learn.microsoft.com/en-us/windows/wsl/install), [WSL command options](https://learn.microsoft.com/en-us/windows/wsl/basic-commands). Recheck official versions and prompts at execution time. No automatic elevation or restart has been scheduled.
