# VOC-112 — Complete A1 provider integration and staging readiness

This draft R3 package is the separate A1 intake requested by
[issue #189](https://github.com/KARSIFT/vocanova-platform/issues/189). It is
planning only: it is not adopted, implementation is not authorized, and it grants no
Cloudflare, GitHub settings/secret, provider-account, credential, deployment, D1,
production-data, spending, DNS, traffic, or launch action.

VOC-025 and VOC-080 already delivered the provider-neutral identity domain, D1
persistence, magic-link/OAuth/session behavior, requester authorization, authenticated
web shell, onboarding/settings/account lifecycle, and deterministic tests. The active
gap is narrower: the Worker still constructs an unavailable email sender and `null`
OAuth provider by default, staging keeps both methods disabled, and no current
Cloudflare-native exact-revision evidence proves the DOC-12 A1 gate.

After adoption, one coherent implementation PR may add and wire credential-free-testable
transactional-email and Google OAuth adapters, fail-closed runtime configuration,
strict 16,384-byte token and 65,536-byte user-info response ceilings with bounded
stream cleanup, security/contract/workerd/browser coverage, and a sanitized
staging-acceptance runbook.
It must leave every staging/production feature switch off and every credential absent.
Actual provider selection/account creation, contracts or spend, credential installation,
settings mutation, dispatch/deployment, live test identities, and A1 milestone acceptance
require separately authorized later actions and evidence.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)

The earlier candidate `ff286cbb87d13913f7d2a95e40d53f8f16f609fe` is blocked and
superseded because it did not specify response-size/read-disposal controls or a fully
literal implementation inventory/provider contract. It grants no authority and must
not be reviewed as the current candidate.
