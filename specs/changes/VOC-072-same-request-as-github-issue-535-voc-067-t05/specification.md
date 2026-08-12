# VOC-072 — Cloudflare Zone-Scoped API Token for VOC-067-T05 Origin-Port Cutover: Specification

## Objective and requirement source

Unblock VOC-067-T05's repository-driven Cloudflare origin-port remap removal by
provisioning and wiring a production GitHub secret whose API token can **read**
the `vocanova.site` zone and **edit Origin Rules** on that zone.

Grounded in
[GitHub issue #535](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/535)
and the blocked state recorded in
[`specs/changes/VOC-067-production-outage-root-cause-consider-unifying/t05-live-cutover-evidence.md`](../VOC-067-production-outage-root-cause-consider-unifying/t05-live-cutover-evidence.md)
(`cloudflare_remap_api_status: unconfirmed`; live `--verify-only` not executed
with a zone-capable token). VOC-067-DEP-03 already authorized repository-driven
Cloudflare API execution; this package supplies the missing credential boundary
without changing the cutover sequence.

Not yet approved — see `change.yaml`'s `requirement_approval_status`.

## Confirmed findings (from issue #535 and drafting-time re-read)

| Finding | Detail |
| --- | --- |
| Failing surface | `deploy-production.yml` job `voc067-cloudflare-cutover` (and the post-smoke `--apply` step when `voc067_cloudflare_origin_cutover=apply`) |
| Token in use | `secrets.PRODUCTION_CLOUDFLARE_API_TOKEN` |
| Original token purpose | Workers AI provider sync — `deploy-production.yml` writes `AI_PROVIDER_API_KEY=${PRODUCTION_CLOUDFLARE_API_TOKEN}` during deploy |
| Cutover script zone lookup | `resolve_zone_id()` in `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` calls `GET /zones?name=${ZONE_NAME}` (default `vocanova.site`) |
| Observed failure | Empty `result` array → script exits `ERROR: zone not found` (issue #535: token cannot read the zone) |
| Required Cloudflare scopes (minimum) | **Zone → Read** for `vocanova.site`; **Account → Origin Rules → Edit** (or equivalent Origin Rules edit permission scoped to that zone) |
| VOC-067 gate | External `:443` checks pass; remap absence unproven; `:8443` bridge must remain until `--verify-only` reports remap absent |

## Scope and non-goals

In scope:

- **`VOC-072-T00`**: Founder/ops creates the Cloudflare API token in the
  dashboard, adds it to the GitHub **production** environment, records redacted
  evidence (token name, scopes, secret name — never the secret value).
- **`VOC-072-T01`**: Repository wiring so cutover modes use the zone-capable
  credential per adoption (`VOC-072-DEP-00` / `DEP-01`):
  - **Recommended (dedicated secret):** introduce
    `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` (name subject to DEP-01)
    for `voc067-cloudflare-cutover` and `--apply` only; leave Workers AI sync
    on the existing narrow `PRODUCTION_CLOUDFLARE_API_TOKEN`.
  - **Alternative (reuse name):** replace `PRODUCTION_CLOUDFLARE_API_TOKEN`
    with a broader-scoped token that still satisfies Workers AI sync **and**
    zone/Origin-Rules cutover — only if adoption explicitly accepts the wider
    blast radius.
  - Update operator docs in `infra/README.md` and script header comments.
  - Optional: clearer error when `GET /zones` returns empty (distinguish
    permission denial from typo'd zone name) without logging token material.
- **`VOC-072-T02`**: Run `workflow_dispatch` with
  `voc067_cloudflare_origin_cutover=verify-only`; capture redacted job log
  showing successful zone resolution and remap verify output.

Non-goals / explicitly excluded:

- Shared-edge nginx architecture, deploy isolation, or HEALTHCHECK work (VOC-067
  T02–T03 — complete or out of scope here).
- Retiring the `:8443` bridge or VOC-067-T04 URL normalization (hard-gated on
  remap verification — may follow in VOC-067-T05/T04 once verify-only passes).
- General Cloudflare redesign, DNS changes, or new edge features.
- Committing secrets, rotating unrelated production credentials, or changing
  Workers AI account binding unless required by DEP-00 reuse path.
- Manual dashboard-only remap removal as the primary path (VOC-067-DEP-03 chose
  repository-driven API).

## Risk and protected areas

Builder assessment: expected git paths are `.github/workflows/deploy-production.yml`
and `infra/*` (R3 path floor). Human ops touches GitHub production-environment
secrets and Cloudflare dashboard tokens (production infrastructure). This package
proposes **`R3`** for the change as a whole (see `change.yaml`). It does not
revisit VOC-067's R4 shared-edge supersession decision; it executes a credential
prerequisite for an already-authorized cutover step.

Protected areas:

- `.github/workflows/*` — R3; workflow behavior change must stay within cutover
  credential wiring (AGENTS.md doc-reconciliation if workflow comments describe
  secret names).
- Production GitHub environment secrets — founder/ops authority; agents must not
  write real values to git.

EHR is not triggered. Independent verification and path classifier on the real
task file list govern, not this draft proposal.

## Decisions, contradictions, security, and privacy

`VOC-072-D00` (recorded for traceability; formal numbering applies after
adoption): Production Cloudflare cutover tooling must use a credential scoped for
**zone read + Origin Rules edit on `vocanova.site`**. Missing or mis-scoped
credentials remain a **fail-closed** TEST-06 outcome, not a pass.

No contradiction with VOC-067: DEP-03 assumed production GitHub Actions "already
holds" a usable Cloudflare token — issue #535 proves the existing token is
Workers-AI-scoped only. This package reconciles that gap without reversing the
repository-driven API decision.

Security/privacy:

- **Least privilege (recommended):** dedicated cutover secret limited to one
  zone's Origin Rules; Workers AI token unchanged.
- **Reuse path risk:** broadening `PRODUCTION_CLOUDFLARE_API_TOKEN` increases
  blast radius if the same token leaks — acceptable only with explicit adoption
  approval.
- No personal data, application auth logic, or schema changes.
- Evidence files must redact token values and full API responses that embed
  account identifiers beyond what operators need for audit.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None.
- **Analytics:** None.
- **Accessibility:** None. No UI change.

## Open questions

1. **`VOC-072-DEP-00` — Dedicated secret vs reuse `PRODUCTION_CLOUDFLARE_API_TOKEN`**
   Draft recommendation: **dedicated secret** so Workers AI sync keeps its
   existing narrow scope. Reuse is valid only if the founder confirms a single
   token can hold both permission sets without violating least-privilege intent.

2. **`VOC-072-DEP-01` — Dedicated secret name**
   Draft default: `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN`. Alternatives:
   `PRODUCTION_CLOUDFLARE_ORIGIN_RULES_TOKEN`. Must match what T01 wires in
   `deploy-production.yml`.

3. **Whether T02 may dispatch `--apply` in the same package**
   Default: **no** — T02 proves `--verify-only` only. If verify reports remap
   still present, founder/ops runs `--apply` under existing VOC-067-T05 /
   deploy-production dispatch authority in a separate, explicitly authorized
   step (could be a VOC-067-T05 follow-up issue, not silently bundled here).
