# VOC-086 — Reconcile repository/local F2 acceptance state

Status: **draft; no implementation authority**.

This package responds to [issue #131](https://github.com/KARSIFT/vocanova-platform/issues/131).
VOC-081's canonical package and the VOC-084 closure inventory prove that repository/local
F2 completed through exact head `a8694932671ad9c44fd2a97c128b14e6089e5faf`, merged by PR
#108 as `36d526bdec83e28b17aa30a6814d42b92f058ec1`, with passing post-merge
checks. Several living indexes, DOC-12, and the F2 evidence record still describe that
already-satisfied integration gate as pending.

The implementation will make the active repository/local F2 state truthful while
preserving candidate-era facts as history. It will not claim F3, staging, A1 or later
product-milestone acceptance, production, deployment, or live verification.
`VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held.

Plan adoption requires exact-revision independent general and R4 documentation/
governance-specialist review. Implementation may begin only after the approved candidate,
review evidence, adoption decision, `status: adopted`, and
`implementation.authorized: true` are recorded and this plan PR merges.
