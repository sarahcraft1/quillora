# Production Linux validation — October 28, 2026

## Authorization and machine setup

User authorized local Docker installation/testing only; administrator/WSL/restart actions required separate permission. User approved WSL prerequisite installation, a restart into firmware settings, then Docker-specific WSL setup. User reported accepting Docker's agreement personally. No agreement was accepted by the agent. No further restart, paid subscription, cloud provisioning, deployment, invitations, student-data migration, main merge or credential changes occurred.

Prerequisite checks confirmed a working WSL 2 Linux backend after separately approved setup. Docker's official installer signature was verified before per-user installation. The user personally accepted its agreement. Host-specific hardware, operating-system build and kernel inventory are intentionally omitted; application/runtime evidence below is retained for reproducibility.

## Final result: PASS for the local checks listed below

Production Docker build succeeded, including Next.js production compilation/type checks and dev-dependency pruning. No visual/app workflow redesign was needed. Runtime Node version: **v24.22.1**, Debian slim Linux, non-root `node` user.

Tested image ID: `sha256:a6c1f07da8049d601365a674945a23de3ab1481e68f0369341b76c4d6c6a554e`.

Base image resolved during build: `node:24-bookworm-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c`. Dockerfile still uses the moving Node 24 tag; record/pin the approved image digest during staging release preparation. No registry image was pushed.

| Check | Evidence / result |
| --- | --- |
| Linux production startup | HTTP health returns only `{status:"ok"}`; Docker image healthcheck becomes healthy. |
| Host exposure / process privilege | Random published port bound to 127.0.0.1 only; Config.User node and live UID nonzero. |
| Resource configuration | Inspect and cgroup memory.max confirm 1536 MiB; one CPU and 128-PID limits configured. CPU/PID exhaustion itself was not stress-tested. |
| Missing access configuration | HTTP pages, search/session/rubric APIs and forged identity/middleware headers rejected with 503. |
| Configured but unauthorized | Synthetic issuer/audience/email/origin settings reject absent/forged tokens with 401; setting local mode does not bypass production auth. No real Cloudflare credentials or valid provider token used. |
| Native PDF/DOCX compatibility | Real committed synthetic rubric fixtures extracted through bundled production handler code; expected instructions present. |
| Malformed/mismatched/large inputs | Invalid PDF, invalid ZIP, PDF renamed DOCX return 422; >10 MB file returns 413. |
| Streaming and slow body | Body cap enforced without trustworthy length; stalled body cancelled at deadline. |
| Concurrent uploads | An overlapping request returns 429 while the first body is pending; permit is released after first failure. This is two-request admission testing, not five-student load certification. |
| Worker failure recovery | Deliberately hung and crashed disposable workers fail safely; next valid extraction succeeds. |
| Original upload regressions | **8/8 passed inside the production Linux image**, including actual DOCX inflation bound, entry count and a 61-page PDF rejection. |
| Hard native-memory limit | A separate 128 MiB test container allocating Buffers exits 137, with OOMKilled true. Main application stays healthy. This is controlled real cgroup exhaustion, not a simulated StoragePort failure or proof against every hostile PDF. |
| Server process/container interruption | Forced KILL followed by explicit start recovers HTTP health and the Docker healthcheck. This proves manual local restart recovery, not automatic hosting recovery. |

The QA helper process RSS snapshot was about 121 MiB; **not** aggregate server/worker peak memory or a capacity prediction. Container-wide hard memory limits do not guarantee an individual native parser cannot terminate the whole app under a malicious workload. Keep upload admission/limits and test hosted OOM behavior later.

HTTP authentication tests hit the real running production server. Authorized parsing tests invoke production handler code inside the image through a separate read-only QA bundle; they do **not** bypass authentication over HTTP and do not establish a valid authenticated end-to-end Cloudflare upload flow.

The final runner completed ten integration checks, removed exactly its three labeled disposable containers, and verified no QA-labeled containers remained. It did not remove images, volumes, existing containers, student work or local backups. Docker Desktop remains installed/running; the local tested image/cache remains available.

## Defects found and corrected

1. Citation-review generator used readonly tuple inference for synthetic missing-author arrays. Next.js production type-checking rejected it. Changed the annotation to explicitly typed partial article patches; TypeScript and production Linux build now pass. Generated review artifacts are byte-identical; formatter/application output unchanged.
2. Initial validation harness assumed Docker's randomly published port survived container restart. Docker assigned a new port; the server was healthy but the probe used the old address. Re-read the loopback binding after start. Final restart checks pass. Initial failed report retained separately; no application workaround or authentication bypass was introduced.
3. Initial build could not find Docker's newly installed credential-helper executable in this existing shell. Added the official Docker bin directory to that build process's PATH only. No persistent PATH or credential-store edit.

## Reproduction (local synthetic environments only)

1. `node scripts/prepare-linux-qa.mjs` creates ignored `.qa-output` bundles and copies only rubric test fixtures. No production test route is added. The QA output is excluded from Docker context.
2. `docker build --progress=plain -t quillora:p0-local .` (new Windows shells may need Docker's bin directory on process PATH).
3. `node scripts/validate-linux-container.mjs`. Set DOCKER_CLI to the official docker.exe absolute path if the current shell lacks it. The runner creates unique run-labeled containers, loopback-only ports and read-only synthetic mounts; intentional OOM affects a separate capped test container. Cleanup verifies ownership labels before removal.
4. Inspect ignored `.qa-output/linux-validation.json` for detailed results. `.qa-output/linux-validation-initial.json` retains the initial port-probe failure. Container checks have no dependency on student origins or backups.

Windows `npm test`: **139/139 passed again**. Final `npx tsc --noEmit`, `git diff --check`, and production dependency audit passed (zero known production vulnerabilities at check). The complete 139-case suite was not run in Linux; the eight upload regressions plus production integration checks were. No actual-browser quota rerun this stage; prior disposable Chromium evidence remains in P0_LOCAL_READINESS.md.

## Remaining private-staging gates

- Independent MLA 9 reviewer has not completed the prepared 16-case package. Candidate outputs must not be called independently certified.
- Real Cloudflare token/key retrieval, login/expiry/logout/revocation, origin/domain bypass protection and authenticated upload flow remain unverified; synthetic configuration is not provider validation.
- Hosting accounts/configuration, region/domain, spending ceiling and a synthetic-data private staging deployment require separate authorization. Provider request/resource limits, log query redaction/retention, rate-limiting behavior and restart policy need staging checks.
- Five-user simultaneous usage, browser matrix, OS-crash/disk-flush durability, image scanning and broader malicious-file testing remain limitations. Existing browser-local/export recovery contract remains in force; no cloud persistence or migration.

GitHub still contains the specifically approved commit 90045ea on codex/p0-local-pilot. Follow-up review/setup/validation work remains committed **locally only** until pushing those additional commits is approved. Main was untouched. Recommended next decision: authorize pushing the remaining branch commits and opening a review PR, without merging or deploying.
