# Engineering Documentation

| ID     | Document                                                         | Status   | Owner   | Related                                                        |
| ------ | ---------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------- |
| DOC-04 | [Technical Architecture](04-technical-architecture.md)           | approved | founder | DOC-05, DOC-06, DOC-07, DOC-08, DOC-09, DOC-10, DOC-11, DOC-17 |
| DOC-05 | [Database Design](05-database-design.md)                         | approved | founder | DOC-04, DOC-06, DOC-07, DOC-09                                 |
| DOC-06 | [Backend Design](06-backend-design.md)                           | approved | founder | DOC-04, DOC-05, DOC-07, DOC-09, DOC-10                         |
| DOC-07 | [API Contract and DTO Design](07-api-contract-and-dto-design.md) | approved | founder | DOC-04, DOC-05, DOC-06, DOC-08, DOC-09                         |
| DOC-09 | [AI Features](09-ai-features.md)                                 | approved | founder | DOC-00, DOC-01, DOC-04, DOC-05, DOC-06, DOC-07                 |

DOC-04/05/06/07/09 are amended by
[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md): the target is
OpenNext + Hono Workers + D1, while Go/PostgreSQL remains the VOC-080 parity reference.
