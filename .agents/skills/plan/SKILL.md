---
name: plan
description: Plan a substantial VocaNova change from repository evidence. Use before work that changes architecture, public APIs, persistence, authentication, or execution boundaries.
---

# Plan

1. Read `AGENTS.md`, the relevant docs, implementation, tests, and one nearby pattern.
2. Confirm the requested outcome, current behavior, constraints, and explicit exclusions.
3. Recommend a focused GitHub issue for large boundary changes. Open or update it only when the user requested repository delivery or issue creation. Routine work needs no planning artifact.
4. Name the files and contracts likely to change, migration or compatibility concerns, and exact validation.
5. Prefer one coherent vertical slice. Split only when units are independently useful and do not share a contract or rollback boundary.

Do not invent product requirements or reintroduce change packages, risk classes, standing approval roles, or evidence binders.
