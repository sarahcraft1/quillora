# Local Docker prerequisites and validation

This guide describes portable requirements, not a maintainer workstation inventory. Local Linux validation has passed; see [validation evidence](LINUX_VALIDATION.md). It does not authorize hosting, deployment, spending, invitations or changes to someone else's computer.

## Prerequisites

Use a supported 64-bit Windows version, CPU virtualization/SLAT support and sufficient RAM/disk for Docker Desktop and a Node build. Follow the [current Docker requirements](https://docs.docker.com/desktop/setup/install/windows-install/) rather than assuming another machine's specifications apply. Use the WSL 2 backend for Linux containers; a WSL 1 warning alone does not establish a WSL 2 problem.

## Setup boundaries

1. Check virtualization, Windows servicing and WSL availability without changing settings. Do not record personal machine identifiers or full local paths in repository documentation.
2. If prerequisites are missing, obtain the device owner's approval before administrator-level changes, WSL configuration changes or a restart. Firmware changes must be performed by the owner using the device vendor's instructions. Leave unrelated security and boot settings unchanged.
3. Install/update WSL only as separately approved, following [Microsoft's instructions](https://learn.microsoft.com/en-us/windows/wsl/install). Do not unregister distributions or change global resource settings without authorization. Ask again before a restart.
4. Download Docker Desktop only from the official source and verify the publisher/signature. Prefer a per-user installation where supported. The user must review/accept applicable terms; do not silently accept an agreement, enable paid features or expose the daemon over TCP.
5. Confirm the Linux engine is available. Do not enable unrelated orchestration, cloud integrations or public listeners.
6. Use the local [Linux validation procedure](LINUX_VALIDATION.md): synthetic read-only fixtures, loopback-only ports, explicit memory/CPU/PID limits and labeled disposable containers. Missing Access configuration must still reject private routes. No production bypass should be added for testing.

Host setup logs belong in private local storage, outside Git and Docker build context. Node/image versions and checksums needed to reproduce application validation are recorded separately; personal workstation inventories are unnecessary.
