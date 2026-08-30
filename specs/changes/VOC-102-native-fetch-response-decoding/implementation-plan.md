# VOC-102 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
present on `develop`. Use one isolated branch/worktree, one minimum-sufficient task,
and one coherent implementation PR into `develop`.

## Existing-file reconciliation

| Path                                                     | Classification               | Reconciliation                                                                                                           |
| -------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `scripts/foundation/cloudflare-delivery-policy.mjs`      | present-needs-reconciliation | Correct only `requestJson()` response/fixture discrimination and decoding; preserve all validators and policy constants. |
| `scripts/foundation/cloudflare-delivery-policy.test.mjs` | present-needs-reconciliation | Add focused real-native-`Response` success/failure regression cases and preserve the existing suite.                     |

All workflows, manifests, documentation, settings records, applications, and
historical packages are present-compatible and excluded from the implementation diff.

## Ordered implementation

1. Add focused failing tests that drive `evaluateDeliveryEvent()` through its
   injected `http` boundary with two real native JSON `Response` objects and assert
   an exact eligible credential-check result.
2. Add native response cases for non-2xx, non-JSON content type, and malformed JSON;
   assert ineligibility through the sanitized readback failure path.
3. Add an injected plain decoded-record case that proves the intended fixture path
   remains supported and cannot be confused with response-like objects.
4. Change `requestJson()` to identify response-like values by capability/shape,
   including inherited accessors, then status-check, content-type-check, and await
   `json()`. Keep the plain-record path narrow and explicit.
5. Run the focused delivery test, delivery validation, complete foundation suite,
   governance validation, risk classification, workspace validation if required by
   the committed development instructions, and whitespace validation.
6. Confirm the implementation diff is exactly the two approved files and every
   historical package has zero diff.
7. Obtain exact-SHA Cloudflare/CI-security specialist review and a separate
   independent R3 verdict. Resolve every blocking finding with fresh checks and fresh
   different-actor review of any changed SHA; use a separate non-author merge actor.

## Validation commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate` if applicable under `docs/development.md`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

Do not report an unavailable command as passing. Record prerequisites or an
environmental failure separately from a behavioral failure.

## Rollback

Before merge, close the implementation PR with no effect. After merge, use a
separately reviewed revert PR that restores both implementation files to the
last-known-good pre-implementation `develop` revision. The rollback owner is the
implementation change owner. No live-system rollback is part of this package because
implementation performs no external action.
