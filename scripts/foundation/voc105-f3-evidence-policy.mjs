import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectF2Scripts } from "./voc081-f2-evidence-policy.mjs";

export const F3_RECORD_PATH = "docs/operations/voc-105-f3-evidence.json";
export const F3_NARRATIVE_PATH = "docs/operations/voc-105-f3-evidence.md";
export const DESIGNATED_F3_SURFACES = Object.freeze([
  "docs/README.md",
  "docs/operations/README.md",
  "docs/operations/cloudflare-delivery.md",
  "docs/operations/voc-081-f2-evidence.json",
  "docs/operations/voc-081-f2-evidence.md",
  F3_RECORD_PATH,
  F3_NARRATIVE_PATH,
  "docs/product/12-mvp-implementation-plan.md",
  "docs/product/README.md",
]);

const DELIVERY_PATH = "docs/operations/cloudflare-delivery.md";
const PUBLIC_RESOURCES = Object.freeze({
  account: "0a9eda28b96d77c24dcde74f3e074d47",
  zone: "63286d93b5f32925ac7366b4e97908be",
  d1: "22ae386f-e3f5-4d98-a3ad-18b39d3b8556",
});
const CLOUDFLARE_PREFIX = ["CLOUD", "FLARE"].join("");
const ALLOWED_CREDENTIAL_NAMES = new Set([
  [CLOUDFLARE_PREFIX, "ACCOUNT", "ID"].join("_"),
  [CLOUDFLARE_PREFIX, "API", "TOKEN"].join("_"),
]);
const HIGH_RISK_PROJECTIONS = Object.freeze({
  "docs/README.md": [
    "3e75499263467247e4d6de638c2dc896dfa5a0cf72930a77aa5d12a68659093f",
    "483aaf62c39f54bb4d3686bb1ae952de64fd5baf219d40c7d255489bf247e343",
    "68d8e9ea9425c56261c98917298f52a1db9b01f7b07b8168db8a02420bc9bdff",
    "1c9b98c7040cd7bd67310c51beeb5be3f42a3315ff591696c0ddc3c444c6109b",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/README.md": [
    "afdee98b0d8ab476c2f69878aab9b3f3c794ed20c95971ba703cbc5fc4b72f77",
    "9920d72838f0b55dafbb62ed5821bcf148aed1b236519b44f34e64ae04f7884a",
    "26489ec7ff1deff5a889b4887eb9d3cafa76cb81ecf1ce45344f6aff4f746421",
    "b095339e678156c00fa5684993f9dc15e4ec83cb62af6c32c677c3a58183fa59",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/cloudflare-delivery.md": [
    "6cf2f6244e8c91372bbf47d87b3116634c79b10831e58d30ee92cf2924cbbea5",
    "77e4af75119bfb06bac1c9b447c1da9d24528e4530f46456adb4c9a3d7a90ea5",
    "8b44ba694f28c931f1203b2e9a787624d61c774d16b544d73d1fb96814e77946",
    "64688b2e1fa9a049270b1b1783239f03356d9cba4e00fe21aa286d5fa385bb44",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/voc-081-f2-evidence.json": [
    "96ce99c2f6f3016349a04d79e96a6924eb80305ed6cf4f0f6cf9a7e41e9c5a31",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "a560577733ece56f33c61cf610398e39d54d14cd70604c46eb4def98a8a966c5",
    "eba6af33d947290b913f91a393e363c4619da9a45658efa002a5b821a969b5b1",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/voc-081-f2-evidence.md": [
    "12a449c4192e0044f1f598013359b50d6ac745a4bf775d5fd3b3019b997c8f02",
    "a795a78dfe8ed9e50af5d793aa03fcd2e799bd8606582232335c3efc4c33df66",
    "8789f268f99465037ae972623ebc6ea63242c24fc190090e8fad8cdc420dc4c0",
    "f41f99dd470df4b3945a9af5282f1666f28da29bb85b8f1ad2647a477dab000c",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/voc-105-f3-evidence.json": [
    "c00ca8e8a95172dcc382cb77c083b92cabe43c871836807d1b88fcaabbd3c366",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "a9ee0b5641a49e54c33036ce3f6b8fcc244aa9e74443a1f8d5917118370dcd38",
    "3841de5ce90e64a4b4a1424f73025260bc83b22df7f37741c1b1053c89ae8b5a",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/operations/voc-105-f3-evidence.md": [
    "a8fb732239f1552c3509540cbd504391ffe004e4c31a8c86a6cf717bda136fac",
    "e56803e1b8a5b217df468f6afb8f24ff80200599b4d4408838df84a004eebe99",
    "e22b0023b329d93cc578cdb2c0e74a30f1ac42aa62f26fafab2093f62228f68c",
    "f4a490a89249dd4f6d3ab3f3d8cae8cb7cae822b0ed2543a10c7642513827c1e",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/product/12-mvp-implementation-plan.md": [
    "e90281dd2154d0d305ce0c0017c77f224074500f8c41fb92b15ff1218e248711",
    "26ddec86c049d2bf7ea7171fe0b4acd347423c10bfe51f6e154b9a6da67a161d",
    "455c9b73d263ba707a7fdbd2ef4afcea4839ff22ffe1ac6f1a3f825f48dbbac3",
    "16c22d4feec456cde52b20f90d215043b2bdf12e337d8d3ec24a538caa71d4cc",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
  "docs/product/README.md": [
    "9d9963f4e2ee70d5538099fdb869b35bb904f3c207ae0cd169163f3ee9de4ac3",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "fbb6b26654e2159dab0288eeb7caa309d622c1320674bec83002864f84fdacd9",
    "630f971607f1ddfd36c47f35c73c81e37a744e194750e527affb9e15a3275204",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
    "b4adb3f162894178e2a75aaeb835a5c35e7348cecdc8eaf1195858960d2834f4",
  ],
});
const OPERATIONAL_DOMAIN_PATTERN =
  /\b(?:(?:re[\s-]?)?(?:deploy\w*|dispatch\w*|migrat\w*|promot\w*|publish\w*|upload\w*|rotat\w*|revok\w*|remov\w*|delet\w*|cancel\w*|configur\w*|chang\w*|creat\w*|enabl\w*|disabl\w*|restor\w*|install\w*|rout\w*|access\w*|export\w*|import\w*|transform\w*|launch\w*|verif\w*|start\w*|destroy\w*|drop\w*|purg\w*|submit\w*|activat\w*|initializ\w*|flush\w*|clear\w*|open\w*|issu\w*|approv\w*|authoriz\w*|terminat\w*|quer(?:y|ies|ied|ying)|push\w*|switch\w*|stop\w*|run(?:s|ning)?|execute\w*|provision\w*|edit\w*|trigger\w*|ship\w*|mov(?:e|es|ed|ing)|restart\w*)|staging|delivery|delivered|retr(?:y|ied|ies|ying)|releas\w*|wip(?:e|es|ed|ing)|eras(?:e|es|ed|ing)|truncat\w*|boot\w*|proceed\w*|invok\w*|send(?:s|ing)?|sent|spin(?:s|ning)?|spun|shut(?:s|ting)?|writ(?:e|es|ing|ten)|turn(?:s|ed|ing)?|set(?:s|ting)?|us(?:e|es|ed|ing)|do[\s-]+(?:it|so)|ran|rollback\w*|roll(?:s|ed|ing)?[\s-]+(?:back|out)|kick(?:s|ed|ing)?[\s-]+off|workflows?|CI|DNS|traffic|resources?|D1|API[\s-]+Worker|Cloudflare[\s-]+Worker|build|live|learner[\s-]+data|credentials?|versions?|settings?|environments?|migrations?|promotions?|smoke|revocation)(?=\b|_)/i;
const CREDENTIAL_TERM_PATTERN =
  /\b(?:CLOUDFLARE_(?:ACCOUNT_ID|API_TOKEN)|[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCOUNT_ID)|credentials?|Basic(?:[\s-]+auth(?:entication)?)?|auth(?:entication)?[\s-]+(?:key|header|token|cookie|code)|JWT|session[\s-]+(?:cookie|ID|identifier)|signing[\s-]+(?:key|token|certificate)|private[\s-]+(?:key|token)|encryption[\s-]+key|SSH[\s-]+key|api[\s-]+(?:key|token)|access[\s-]+(?:key|token)|TOTP(?:[\s-]+seed)?|OTP|passcodes?|passphrases?|recovery[\s-]+(?:codes?|PIN|phrase)|login[\s-]+code|(?:reset|emergency|device|security|backup)[\s-]+code|client[\s-]+(?:cert(?:ificate)?s?|assertion)|mTLS[\s-]+certificates?|authenticator[\s-]+seed|tokens?|secrets?|passwords?|Authorization|Bearer|Cookie)\b/i;
const LATER_HOLD_TERM_PATTERN =
  /\b(?:A1|P1\+?|P[2-5]|R[12]|L1|product[\s-]+acceptance|production|launch|learner[\s-]+data|VOC-080-HOLD-(?:01|02))\b/i;
const F3_STATUS_TERM_PATTERN = /\b(?:F3|staging[\s-]+status)\b/i;
const POSITIVE_VERBS =
  "complete(?:[\\s-]+effective)?|completed|passed|accepted|effective|ready|active|enabled|released|resolved|verified|approved|authorized";
const POSITIVE_MODIFIERS =
  "(?:(?:clearly|actually|already|nevertheless|now|demonstrably|explicitly|firmly|currently|subsequently|finally|even\\s+so|in\\s+fact)\\s*,?\\s*)*";
const COPULAR_CHANGE =
  "(?:(?:is|was|became|becomes|turned|turns|changed|changes)(?:\\s+to)?|has\\s+been)";
const SUBJECTLESS_POSITIVE_LEAD =
  "(?:(?:It|This|That)\\s+" +
  POSITIVE_MODIFIERS +
  "(?:" +
  COPULAR_CHANGE +
  "\\s+" +
  POSITIVE_MODIFIERS +
  ")?|The\\s+(?:result|status|state)\\s+" +
  POSITIVE_MODIFIERS +
  COPULAR_CHANGE +
  "\\s+" +
  POSITIVE_MODIFIERS +
  "|" +
  COPULAR_CHANGE +
  "\\s+" +
  POSITIVE_MODIFIERS +
  ")?";
const SUBJECTLESS_BOUNDARY_POSITIVE_PATTERN = new RegExp(
  "(?:^|[.!?;]\\s*)" +
    POSITIVE_MODIFIERS +
    SUBJECTLESS_POSITIVE_LEAD +
    "(?:" +
    POSITIVE_VERBS +
    ")(?:\\s+now)?(?=[.!?;](?:\\s|$)|$)",
  "i",
);
const SUBJECTLESS_STALE_STATUS_PATTERN =
  /(?:^|[.!?;:]\s*)(?:(?:yet|clearly|apparently|actually|still|currently)\s+)*(?:(?:(?:It|This|That)\s+|(?:The\s+)?(?:(?:current|prospective)\s+)?(?:status|state)\s*(?::\s*)?)(?:(?:is|remains?|continues?(?:\s+(?:to\s+be|as))?)\s+)?(?:(?:still|currently|yet)\s+)*|(?:is\s+)?still\s+|remains?\s+|continues?(?:\s+(?:to\s+be|as))?\s+)?(?:pending|unresolved|incomplete|not(?:[\s-]+yet)?[\s-]+complete)(?:\s+(?:still|now))?(?:[.!?]|$)/i;
const AMBIGUOUS_STALE_TERM_PATTERN =
  /\b(?:pending|unresolved|incomplete)\b|\bnot(?:\s+yet)?\s+complete\b/i;
const GENERIC_CONTEXT_COMMAND_PATTERN =
  /^(?:(?:please|kindly|nevertheless|subsequently|finally|even\s+so|in\s+fact)\s*,?\s*)?(?:(?:[A-Za-z][A-Za-z-]*\s+){1,3}(?:it|so|this|that)\b.*|[^.!?;]*\bnow\b\s*)$/i;
const SAFE_OPERATIONAL_CLAUSE =
  "(?:No\\s+(?:(?:staging\\s+)?(?:deployment|delivery|migration|activation|restart|live\\s+deployment)|upload|promotion|(?:workflow\\s+)?dispatch)\\s+(?:(?:has|had|never|actually|ever)\\s+)*(?:occurred|took\\s+place)|(?:(?:Deployment|Migration|Dispatch|Upload|Promotion)\\s+(?:is\\s+)?prohibited|(?:Deployment|Migration|Dispatch|Upload|Promotion)\\s+did\\s+not\\s+occur)|(?:(?:Deployment|Migration|Dispatch|Upload|Promotion|Activation|Application)\\s+(?:was|is)\\s+not\\s+(?:performed|deployed)|No\\s+(?:deployment|migration|dispatch|upload|promotion|activation)\\s+was\\s+performed)|(?:(?:Deployment|Migration|Dispatch|Upload|Promotion|Activation|Workflow)\\s+(?:never\\s+occurred|was\\s+never\\s+performed|(?:was\\s+)?not\\s+(?:performed|dispatched|deployed|migrated)|had\\s+not\\s+been\\s+performed))|No\\s+query\\s+was\\s+issued|(?:The\\s+)?job\\s+was\\s+not\\s+invoked|Nothing\\s+was\\s+deployed|(?:The\\s+)?(?:application|app|system)\\s+(?:was|is|has\\s+been)\\s+not\\s+deployed|(?:The\\s+)?system\\s+never\\s+deployed|(?:The\\s+)?(?:deploy|publish|migration|dispatch)\\s+command\\s+was\\s+not\\s+executed|The\\s+(?:database|build)\\s+was\\s+not\\s+(?:migrated|deployed)|The\\s+(?:previous|prior|staging)\\s+(?:staging\\s+)?(?:delivery|upload|migration|deployment|run)\\s+(?:succeeded|failed\\s+safely|(?:had\\s+)?completed(?:\\s+(?:successfully|in\\s+the\\s+past))?|was\\s+completed\\s+in\\s+the\\s+past)|The\\s+(?:previous|prior)\\s+staging\\s+deployment\\s+succeeded|The\\s+(?:app|historical\\s+system)\\s+deployed\\s+in\\s+the\\s+past|The\\s+local\\s+migration\\s+(?:(?:had\\s+)?completed|succeeded|failed\\s+safely)|The\\s+unit[\\s-]+test\\s+(?:safely\\s+)?(?:deployed|initialized)\\s+(?:an?\\s+)?(?:in-memory\\s+)?fixture|The\\s+local\\s+runner\\s+(?:had\\s+)?executed\\s+(?:an?\\s+)?fixture|The\\s+unit[\\s-]+test\\s+local\\s+worker\\s+(?:had\\s+)?ran\\s+(?:an?\\s+)?fixture|The\\s+(?:local|historical|sanitized)\\s+(?:fixture|build|publication|publish|run|worker|system|migration)(?:\\s+[A-Za-z-]+){0,2}\\s+(?:(?:had\\s+)?(?:completed|succeeded)|failed\\s+safely|safely\\s+initialized|published\\s+in\\s+the\\s+past|deployed\\s+in\\s+the\\s+past)|(?:The\\s+)?documentation\\s+was\\s+published\\s+in\\s+the\\s+past|The\\s+sanitized\\s+delivery\\s+deployed\\s+the\\s+API\\s+Worker\\s+successfully\\s+in\\s+the\\s+past|The\\s+command\\s+“Deploy\\s+now”\\s+is\\s+prohibited|The\\s+sanitized\\s+past\\s+delivery\\s+description\\s+records\\s+that\\s+retry\\s+was\\s+not\\s+required|The\\s+reviewer\\s+verified\\s+the\\s+sanitized\\s+evidence|The\\s+sanitized\\s+result\\s+is\\s+not\\s+verified|The\\s+proposal\\s+is\\s+approved|The\\s+unrelated\\s+issue\\s+remains\\s+pending|The\\s+issue\\s+was\\s+resolved\\s+without\\s+external\\s+action|The\\s+(?:unit\\s+test|local\\s+worker)\\s+initialized\\s+(?:an?\\s+)?in-memory\\s+fixture|The\\s+(?:historical\\s+)?parser\\s+queried\\s+(?:a\\s+)?local\\s+object|The\\s+(?:historical|local)\\s+note\\s+verified\\s+(?:the\\s+|a\\s+)?checksum)";
const SAFE_STATUS_MODIFIERS =
  "(?:(?:however|still|firmly|explicitly|currently|clearly|definitely|actually)\\s+)*";
const UNRESOLVED_LATER_SUBJECT =
  "(?:(?:Authenticated\\s+)?A1(?:\\s+(?:product\\s+)?acceptance)?|P1\\+?(?:\\s+(?:product\\s+)?acceptance)?|P[2-5](?:\\s+(?:product\\s+)?acceptance)?|R[12](?:\\s+acceptance)?|L1(?:\\s+acceptance)?|Product\\s+acceptance|Public\\s+launch|Live\\s+(?:activation|verification|system|service))";
const HELD_LATER_SUBJECT =
  "(?:Production(?:\\s+(?:readiness|traffic|deployment))?|(?:Production\\s+)?Learner[\\s-]+data(?:\\s+(?:use|access|import|export|transform|transformation|delete|deletion))?|VOC-080-HOLD-(?:01|02))";
const NEGATABLE_LATER_SUBJECT =
  "(?:(?:Authenticated\\s+)?A1|P1\\+?|P[2-5]|R[12]|L1|Product\\s+acceptance|Public\\s+launch|Live\\s+(?:activation|verification|system|service)|Production(?:\\s+(?:readiness|traffic|deployment))?|(?:Production\\s+)?Learner[\\s-]+data(?:\\s+(?:use|access|import|export|transform|transformation|delete|deletion))?)";
const NO_SEMANTIC_CONJUNCTION =
  "(?![^.!?;\\n]*\\b(?:and|but|however|while|although|though|whereas)\\b)";
const SAFE_PROTECTED_NEGATIVE_CLAUSE =
  NO_SEMANTIC_CONJUNCTION +
  NEGATABLE_LATER_SUBJECT +
  "[^.!?;\\n]{0,120}\\b(?:no|not|never)\\b[^.!?;\\n]{0,120}\\b(?:" +
  POSITIVE_VERBS +
  ")\\b[^.!?;\\n]*";
const OPERATIONAL_CLAUSE_TERM =
  "(?:deploy\\w*|deployment|dispatch\\w*|workflow|migrat\\w*|promot\\w*|publish\\w*|upload\\w*|releas\\w*|start\\w*|activat\\w*|restart\\w*|traffic|DNS|settings?|resources?|change\\w*|run|ran|execute\\w*|initializ\\w*)";
const SAFE_NEGATED_OPERATIONAL_CLAUSE =
  NO_SEMANTIC_CONJUNCTION +
  "(?:No\\s+[^.!?;\\n]{0,160}\\b" +
  OPERATIONAL_CLAUSE_TERM +
  "\\b[^.!?;\\n]*|[^.!?;\\n]*\\b" +
  OPERATIONAL_CLAUSE_TERM +
  "\\b[^.!?;\\n]{0,120}\\b(?:(?:did|was|were|is|are|has|had)\\s+not|not|never)\\b[^.!?;\\n]*)";
const PAST_OPERATIONAL_ACTION =
  "(?:deployed|dispatched|migrated|promoted|published|uploaded|released|started|activated|restarted|changed|ran|executed|initialized|completed|succeeded|failed)";
const SAFE_CONTEXTUAL_PAST_OPERATIONAL_CLAUSE =
  NO_SEMANTIC_CONJUNCTION +
  "(?:[^.!?;\\n]*\\b(?:sanitized|prior|previous|historical|local|unit[\\s-]+test)\\b[^.!?;\\n]{0,160}\\b" +
  PAST_OPERATIONAL_ACTION +
  "\\b[^.!?;\\n]*|[^.!?;\\n]*\\b" +
  PAST_OPERATIONAL_ACTION +
  "\\b[^.!?;\\n]{0,160}\\b(?:in\\s+the\\s+past|sanitized|historical|local|unit[\\s-]+test)\\b[^.!?;\\n]*)";
const SAFE_NEGATIVE_AUXILIARY =
  "(?:(?:does|did)\\s+not(?:\\s+remain)?|(?:is|was)\\s+" +
  SAFE_STATUS_MODIFIERS +
  "not|has\\s+" +
  SAFE_STATUS_MODIFIERS +
  "not(?:\\s+been)?|" +
  SAFE_STATUS_MODIFIERS +
  "not(?:\\s+yet)?)";
const SAFE_LATER_CLAUSE =
  "(?:" +
  UNRESOLVED_LATER_SUBJECT +
  "\\s+" +
  SAFE_STATUS_MODIFIERS +
  "(?:(?:is|remains?|continues?(?:\\s+to\\s+be)?)\\s+)?" +
  SAFE_STATUS_MODIFIERS +
  "unresolved|" +
  HELD_LATER_SUBJECT +
  "\\s+" +
  SAFE_STATUS_MODIFIERS +
  "(?:(?:is|remains?|continues?(?:\\s+to\\s+be)?)\\s+)?" +
  SAFE_STATUS_MODIFIERS +
  "held|" +
  NEGATABLE_LATER_SUBJECT +
  "\\s+" +
  SAFE_STATUS_MODIFIERS +
  SAFE_NEGATIVE_AUXILIARY +
  "\\s+(?:" +
  POSITIVE_VERBS +
  "))";
const SAFE_CREDENTIAL_CLAUSE =
  "(?:Credentials?|Tokens?|Passwords?|Private[\\s-]+key|JWT|Basic[\\s-]+authentication|Recovery[\\s-]+(?:code|PIN|phrase)|Authentication[\\s-]+code|Login[\\s-]+code|(?:Reset|Emergency|Device|Security|Backup)[\\s-]+code|OTP|Passcode|Session[\\s-]+(?:ID|identifier)|Client[\\s-]+(?:cert(?:ificate)?|assertion)|mTLS[\\s-]+certificate|Signing[\\s-]+certificate|SSH[\\s-]+key|Authenticator[\\s-]+seed|Passphrase|TOTP[\\s-]+seed|Authentication[\\s-]+cookie|Encryption[\\s-]+key)\\s+(?:is|are|remains?)\\s+(?:value-free|absent|unavailable|redacted|prohibited)";
const IMPERATIVE_ACTION_PATTERN =
  /^(?:(?:please|kindly)\s*,?\s*)?(?:(?:immediately|now|carefully)\s+)*(?:(?:re[\s-]?)?(?:deploy|dispatch|migrate|promote|publish|upload|rotate|revoke|remove|delete|cancel|configure|change|create|enable|disable|restore|install|route|access|export|import|transform|launch|verify|start|destroy|drop|purge|submit|activate|initialize|flush|clear|open|issue|approve|authorize|terminate|query|push|switch|stop|run|execute|provision|edit|trigger|ship|move|restart)|retry|release|wipe|erase|truncate|boot|proceed|invoke|send|spin|shut|write|turn|set|use|do\s+(?:it|so)|rollback|roll\s+(?:back|out)|kick\s+off)\b/i;
const CANONICAL_PROSPECTIVE_LATER_CLAUSES = Object.freeze({
  "docs/product/12-mvp-implementation-plan.md": new Set([
    "production-provider component cannot be accepted until provider candidates",
    "** production resources ready, credentials",
  ]),
});
const GATE_EVIDENCE = new Map([
  [
    "isolated-staging-resources",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "privacy-safe-observability",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "compatible-d1-migrations",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "exact-version-delivery",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "bounded-staging-smoke",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "rollback-baseline-and-rehearsal",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "standard-environment-protection",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  ],
  [
    "external-phase-closure",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438136312",
  ],
  [
    "successful-current-delivery",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5477915272",
  ],
]);
const GATE_ITEMS = [...GATE_EVIDENCE.keys()];

const PROCEDURE_REGIONS = Object.freeze([
  {
    id: "credential-policy",
    start: "<!-- VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN -->",
    end: "<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->",
    includeEnd: true,
    sha256: "7892e3a2a5aa979de0f5f79401f1a36fc84a8616dca5dd9d6b94fc6b4c470655",
  },
  {
    id: "manual-staging",
    start: "## Standard manual staging delivery after settings action",
    end: "## Ordered implementation and truth boundary",
    includeEnd: false,
    sha256: "896fe5d079a3207b72b6ab87c0cfbc6d8f67c84ce5dffcd311d864e494f1c94a",
  },
  {
    id: "cancellation-rollback",
    start: "## Cancellation, failure, and rollback",
    end: "## Deterministic evidence",
    includeEnd: false,
    sha256: "e7a74c1cfc2dbb9960814664df2cc2283a82a97cd51e71156dd2b0e429c7c717",
  },
]);

const LATER_SUBJECTS = Object.freeze([
  {
    id: "later product milestone",
    pattern:
      "(?:A1(?:[\\s-]+authenticated)?|authenticated[\\s-]+A1|P1\\+?|P[2-5]|R[12]|L1)(?:[\\s-]+(?:product[\\s-]+)?acceptance)?",
  },
  {
    id: "production",
    pattern: "production(?:[\\s-]+(?:readiness|traffic|deployment))?",
  },
  {
    id: "live activation",
    pattern: "live[\\s-]+(?:activation|verification|system|service)",
  },
  { id: "public launch", pattern: "public[\\s-]+launch" },
  {
    id: "learner data",
    pattern:
      "learner[\\s-]+data(?:[\\s-]+(?:access|use|import|export|transform|transformation|delete|deletion))?",
  },
  { id: "aggregate product acceptance", pattern: "product[\\s-]+acceptance" },
]);

function readSurface(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalized(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\n\f\v]+/g, " ")
    .trim();
}

function occurrences(source, needle) {
  let count = 0;
  let offset = 0;
  while ((offset = source.indexOf(needle, offset)) !== -1) {
    count += 1;
    offset += needle.length;
  }
  return count;
}

function requireEqual(errors, actual, expected, label) {
  if (actual !== expected)
    errors.push(
      `${F3_RECORD_PATH}: ${label}: expected ${JSON.stringify(expected)}`,
    );
}

function exactKeys(errors, value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${F3_RECORD_PATH}: ${label}: expected object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    errors.push(
      `${F3_RECORD_PATH}: ${label}: exact keys expected ${wanted.join(",")}; got ${actual.join(",")}`,
    );
  return true;
}

function duplicateRawJsonKeys(source) {
  const duplicates = [];
  let index = 0;
  const skip = () => {
    while (/\s/.test(source[index] ?? "")) index += 1;
  };
  const stringToken = () => {
    const start = index++;
    let escaped = false;
    while (index < source.length) {
      const character = source[index++];
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') break;
    }
    return JSON.parse(source.slice(start, index));
  };
  const value = (objectPath) => {
    skip();
    if (source[index] === "{") return object(objectPath);
    if (source[index] === "[") return array(objectPath);
    if (source[index] === '"') return void stringToken();
    while (index < source.length && !/[\],}]/.test(source[index])) index += 1;
  };
  const object = (objectPath) => {
    index += 1;
    const keys = new Set();
    skip();
    while (index < source.length && source[index] !== "}") {
      const key = stringToken();
      skip();
      if (source[index] !== ":") throw new Error("invalid object separator");
      index += 1;
      if (keys.has(key))
        duplicates.push(`${objectPath}: duplicate raw key ${key}`);
      keys.add(key);
      value(`${objectPath}.${key}`);
      skip();
      if (source[index] === ",") {
        index += 1;
        skip();
      } else break;
    }
    if (source[index] !== "}") throw new Error("invalid object terminator");
    index += 1;
  };
  const array = (arrayPath) => {
    index += 1;
    let item = 0;
    skip();
    while (index < source.length && source[index] !== "]") {
      value(`${arrayPath}[${item++}]`);
      skip();
      if (source[index] === ",") {
        index += 1;
        skip();
      } else break;
    }
    if (source[index] !== "]") throw new Error("invalid array terminator");
    index += 1;
  };
  try {
    value("$");
  } catch {
    return [];
  }
  return duplicates;
}

function validateRecord(source, record) {
  const errors = duplicateRawJsonKeys(source).map(
    (error) => `${F3_RECORD_PATH}: ${error}`,
  );
  exactKeys(
    errors,
    record,
    [
      "schema_version",
      "status",
      "package",
      "milestone_gate",
      "delivery_event",
      "settings_contract",
      "later_boundaries",
      "historical_boundary",
      "external_effects_by_voc105",
    ],
    "record",
  );
  requireEqual(
    errors,
    record.schema_version,
    "vocanova-voc105-f3-v1",
    "schema_version",
  );
  requireEqual(
    errors,
    record.status,
    "f3-staging-foundation-complete-effective",
    "status",
  );
  requireEqual(
    errors,
    record.package,
    "specs/changes/VOC-105-f3-current-documentation-reconciliation",
    "package",
  );

  const gate = record.milestone_gate;
  exactKeys(
    errors,
    gate,
    ["decision", "missing_evidence", "f2_dependency", "items"],
    "milestone_gate",
  );
  requireEqual(
    errors,
    gate?.decision,
    record.status,
    "milestone_gate.decision",
  );
  if (
    !Array.isArray(gate?.missing_evidence) ||
    gate.missing_evidence.length !== 0
  )
    errors.push(
      `${F3_RECORD_PATH}: milestone_gate.missing_evidence: expected empty array`,
    );
  exactKeys(
    errors,
    gate?.f2_dependency,
    ["status", "pull_request", "merge_sha"],
    "milestone_gate.f2_dependency",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.status,
    "complete-effective",
    "F2 status",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.pull_request,
    "https://github.com/KARSIFT/vocanova-platform/pull/108",
    "F2 PR",
  );
  requireEqual(
    errors,
    gate?.f2_dependency?.merge_sha,
    "36d526bdec83e28b17aa30a6814d42b92f058ec1",
    "F2 merge SHA",
  );

  if (!Array.isArray(gate?.items))
    errors.push(`${F3_RECORD_PATH}: milestone_gate.items: expected array`);
  else {
    if (gate.items.length !== GATE_ITEMS.length)
      errors.push(
        `${F3_RECORD_PATH}: milestone_gate.items: expected ${GATE_ITEMS.length} ordered items`,
      );
    gate.items.forEach((item, itemIndex) => {
      exactKeys(
        errors,
        item,
        ["id", "status", "evidence"],
        `milestone_gate.items[${itemIndex}]`,
      );
      const expectedId = GATE_ITEMS[itemIndex];
      requireEqual(errors, item?.id, expectedId, `gate item ${itemIndex} id`);
      if (!GATE_EVIDENCE.has(item?.id))
        errors.push(
          `${F3_RECORD_PATH}: gate item ${itemIndex}: unknown id ${JSON.stringify(item?.id)}`,
        );
      else {
        requireEqual(
          errors,
          item.status,
          "validated",
          `gate item ${item.id} status`,
        );
        requireEqual(
          errors,
          item.evidence,
          GATE_EVIDENCE.get(item.id),
          `gate item ${item.id} evidence`,
        );
      }
    });
    for (const id of GATE_ITEMS) {
      const count = gate.items.filter((item) => item?.id === id).length;
      if (count !== 1)
        errors.push(
          `${F3_RECORD_PATH}: gate item ${id}: expected exactly once; got ${count}`,
        );
    }
  }

  const event = record.delivery_event;
  exactKeys(
    errors,
    event,
    [
      "workflow",
      "run_id",
      "attempt",
      "event_sha",
      "url",
      "required",
      "delivery_gate",
      "staging_job",
      "steps",
      "production_job",
    ],
    "delivery_event",
  );
  requireEqual(errors, event?.workflow, "CI", "delivery workflow");
  requireEqual(errors, event?.run_id, 33386240492, "delivery run");
  requireEqual(errors, event?.attempt, 1, "delivery attempt");
  requireEqual(
    errors,
    event?.event_sha,
    "03528a84988ebe664207c6a439e133070627c92a",
    "delivery SHA",
  );
  requireEqual(
    errors,
    event?.url,
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
    "delivery URL",
  );
  for (const field of ["required", "delivery_gate", "staging_job"])
    requireEqual(errors, event?.[field], "success", `delivery_event.${field}`);
  exactKeys(
    errors,
    event?.steps,
    [
      "migration",
      "immutable_upload",
      "exact_promotion",
      "bounded_smoke",
      "rollback_after_promotion_failure",
      "sanitized_outcome",
    ],
    "delivery_event.steps",
  );
  for (const step of [
    "migration",
    "immutable_upload",
    "exact_promotion",
    "bounded_smoke",
    "sanitized_outcome",
  ])
    requireEqual(
      errors,
      event?.steps?.[step],
      "success",
      `delivery step ${step}`,
    );
  requireEqual(
    errors,
    event?.steps?.rollback_after_promotion_failure,
    "skipped-expected",
    "rollback outcome",
  );
  requireEqual(
    errors,
    event?.production_job,
    "skipped-held",
    "production outcome",
  );

  const settings = record.settings_contract;
  const settingsExpected = {
    delivery_controls_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/175",
    settings_truth_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/179",
    credential_policy_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/178",
    sanitized_readback:
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  };
  exactKeys(
    errors,
    settings,
    Object.keys(settingsExpected),
    "settings_contract",
  );
  for (const [key, expected] of Object.entries(settingsExpected))
    requireEqual(errors, settings?.[key], expected, `settings contract ${key}`);

  const later = record.later_boundaries;
  const laterExpected = {
    a1_authenticated_product_acceptance: "unresolved",
    p1_plus_product_acceptance: "unresolved",
    production_readiness: "held",
    production_traffic: "held",
    public_launch: "unresolved-held",
    learner_data: "held",
    inherited_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
  };
  exactKeys(errors, later, Object.keys(laterExpected), "later_boundaries");
  for (const [key, expected] of Object.entries(laterExpected)) {
    if (Array.isArray(expected)) {
      if (JSON.stringify(later?.[key]) !== JSON.stringify(expected))
        errors.push(
          `${F3_RECORD_PATH}: ${key}: expected exact ordered array ${JSON.stringify(expected)}`,
        );
    } else requireEqual(errors, later?.[key], expected, key);
  }

  exactKeys(
    errors,
    record.historical_boundary,
    ["packages", "later_evidence_supersedes_prospective_pending_language"],
    "historical_boundary",
  );
  requireEqual(
    errors,
    record.historical_boundary?.packages,
    "VOC-094-through-VOC-104-immutable",
    "historical package boundary",
  );
  requireEqual(
    errors,
    record.historical_boundary
      ?.later_evidence_supersedes_prospective_pending_language,
    true,
    "historical supersession boundary",
  );
  requireEqual(
    errors,
    record.external_effects_by_voc105,
    "none-repository-only",
    "VOC-105 external effects",
  );
  return errors;
}

function extractProcedureRegion(source, definition) {
  const start = source.indexOf(definition.start);
  if (start === -1) return null;
  const endStart = source.indexOf(
    definition.end,
    start + definition.start.length,
  );
  if (endStart === -1) return null;
  const end = definition.includeEnd
    ? endStart + definition.end.length
    : endStart;
  return { start, end, source: source.slice(start, end) };
}

function projectionDigest(source, pattern) {
  const lineProjection = source
    .split(/\r?\n/)
    .flatMap((line, index) =>
      pattern.test(line) ? [`${index + 1}\0${line}\0`] : [],
    )
    .join("");
  const paragraphProjection = source
    .split(/\r?\n\s*\r?\n/)
    .flatMap((paragraph, index) => {
      const exactParagraph = paragraph.trim();
      return pattern.test(exactParagraph)
        ? [`${index + 1}\0${exactParagraph}\0`]
        : [];
    })
    .join("");
  return crypto
    .createHash("sha256")
    .update(`lines\0${lineProjection}paragraphs\0${paragraphProjection}`)
    .digest("hex");
}

function maskSafeClauses(source) {
  const pattern = new RegExp(
    `(^|[\\n.!?;]\\s*)(${SAFE_OPERATIONAL_CLAUSE}|${SAFE_PROTECTED_NEGATIVE_CLAUSE}|${SAFE_NEGATED_OPERATIONAL_CLAUSE}|${SAFE_CONTEXTUAL_PAST_OPERATIONAL_CLAUSE}|${SAFE_LATER_CLAUSE}|${SAFE_CREDENTIAL_CLAUSE})(?=$|[\\n.!?;])`,
    "gim",
  );
  return source.replace(
    pattern,
    (_match, prefix, clause) => `${prefix}${" ".repeat(clause.length)}`,
  );
}

function exactOccurrences(source, text, metadata = {}) {
  const found = [];
  let offset = 0;
  while ((offset = source.indexOf(text, offset)) !== -1) {
    found.push({ start: offset, end: offset + text.length, text, ...metadata });
    offset += text.length;
  }
  return found;
}

function maskPairedHistoricalF3(paragraph) {
  const states = [];
  const supersessions = [];
  const genericThat = exactOccurrences(
    paragraph,
    "Later exact VOC-105 evidence supersedes that prospective F3 status.",
    { packageId: null, status: "generic" },
  );
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    for (const [text, status] of [
      [`${packageId} is immutable history: F3 is pending.`, "pending"],
      [`${packageId} is immutable history: F3 pending.`, "pending"],
      [`${packageId} is immutable history: F3 remains pending.`, "pending"],
      [`${packageId} is immutable history: F3 was pending.`, "pending"],
      [`${packageId} is immutable history: F3 is unresolved.`, "unresolved"],
      [`${packageId} is immutable history: F3 unresolved.`, "unresolved"],
      [
        `${packageId} is immutable history: F3 staging is unresolved.`,
        "unresolved",
      ],
      [
        `${packageId} is immutable history: F3 is not yet delivered.`,
        "not-delivered",
      ],
      [
        `${packageId} is immutable history: F3 has not been delivered.`,
        "not-delivered",
      ],
      [`F3 is pending in ${packageId} immutable history.`, "pending"],
      [`F3 remains pending in ${packageId} immutable history.`, "pending"],
      [
        `F3 staging is unresolved in ${packageId} immutable history.`,
        "unresolved",
      ],
      [
        `F3 is not yet delivered in ${packageId} immutable history.`,
        "not-delivered",
      ],
      [`In immutable ${packageId} history, F3 is pending.`, "pending"],
      [`In immutable ${packageId} history, F3 remains pending.`, "pending"],
      [`In immutable ${packageId} history, F3 was pending.`, "pending"],
      [
        `In immutable ${packageId} history, F3 staging is unresolved.`,
        "unresolved",
      ],
      [`${packageId} immutable history records F3 as pending.`, "pending"],
      [
        `${packageId} immutable historical snapshot records F3 as unresolved.`,
        "unresolved",
      ],
      [
        `In immutable ${packageId} history, the historical snapshot records F3 as unresolved.`,
        "unresolved",
      ],
      [
        `${packageId} immutable history records F3 staging as unresolved.`,
        "unresolved",
      ],
    ])
      states.push(...exactOccurrences(paragraph, text, { packageId, status }));
    for (const [text, status] of [
      [
        `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 pending status.`,
        "pending",
      ],
      [
        `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 unresolved status.`,
        "unresolved",
      ],
      [
        `Later exact VOC-105 evidence supersedes ${packageId} prospective F3 not-delivered status.`,
        "not-delivered",
      ],
      [
        `Later exact VOC-105 evidence supersedes the prospective F3 status from ${packageId}.`,
        "generic",
      ],
    ])
      supersessions.push(
        ...exactOccurrences(paragraph, text, { packageId, status }),
      );
  }
  states.sort((left, right) => left.start - right.start);
  const candidates = [...supersessions, ...genericThat].sort(
    (left, right) => left.start - right.start,
  );
  const used = new Set();
  const mask = paragraph.split("");
  for (const state of states) {
    const candidate = candidates.find(
      (entry) =>
        !used.has(entry) &&
        (entry.packageId === null || entry.packageId === state.packageId) &&
        (entry.status === state.status || entry.status === "generic") &&
        (entry.end <= state.start
          ? paragraph.slice(entry.end, state.start).trim() === ""
          : state.end <= entry.start &&
            paragraph.slice(state.end, entry.start).trim() === ""),
    );
    if (!candidate) continue;
    used.add(candidate);
    for (const span of [state, candidate])
      for (let index = span.start; index < span.end; index += 1)
        mask[index] = " ";
  }
  return mask.join("");
}

function maskPermittedHistoricalContexts(source) {
  return source
    .split(/(\r?\n\s*\r?\n)/)
    .map((paragraph, index) =>
      index % 2 === 0 ? maskPairedHistoricalF3(paragraph) : paragraph,
    )
    .join("");
}

function subjectlessBoundaryProjectionSource(source) {
  const safeSubject = new RegExp(
    `^(?:${SAFE_LATER_CLAUSE}|${SAFE_PROTECTED_NEGATIVE_CLAUSE})$`,
    "i",
  );
  const paragraphs = source.split(/\r?\n\s*\r?\n/).map((paragraph) => {
    const clauses = semanticClauses(paragraph);
    return {
      candidates: clauses.flatMap((clause, index) =>
        SUBJECTLESS_BOUNDARY_POSITIVE_PATTERN.test(clause)
          ? [{ clause, index }]
          : [],
      ),
      safeIndexes: clauses.flatMap((clause, index) =>
        safeSubject.test(clause) ? [index] : [],
      ),
    };
  });
  return paragraphs
    .flatMap((paragraph, paragraphIndex) =>
      paragraph.candidates.flatMap((candidate) => {
        const sameParagraph = paragraph.safeIndexes.length > 0;
        const adjacentParagraph = [paragraphIndex - 1, paragraphIndex + 1].some(
          (index) => paragraphs[index]?.safeIndexes.length > 0,
        );
        return sameParagraph || adjacentParagraph ? [candidate.clause] : [];
      }),
    )
    .join("\n");
}

function staleHistoricalTailProjectionSource(source) {
  const paragraphs = source.split(/\r?\n\s*\r?\n/).map((paragraph) => {
    const remainder = maskPairedHistoricalF3(paragraph);
    return { paragraph, remainder, hasPair: remainder !== paragraph };
  });
  return paragraphs
    .flatMap((entry, index) => {
      const candidateSource = entry.hasPair ? entry.remainder : entry.paragraph;
      if (!hasAmbiguousHistoricalTail(candidateSource)) return [];
      const followsPair = paragraphs[index - 1]?.hasPair ?? false;
      return entry.hasPair || followsPair ? [candidateSource.trim()] : [];
    })
    .join("\n\n");
}

export function protectedProjectionDigests(source, relativePath) {
  const historyMasked = maskPermittedHistoricalContexts(source);
  const exactContextMasked = maskSafeClauses(historyMasked);
  let operationalSource = exactContextMasked;
  if (relativePath === DELIVERY_PATH) {
    const characters = operationalSource.split("");
    for (const definition of PROCEDURE_REGIONS) {
      const region = extractProcedureRegion(exactContextMasked, definition);
      if (!region) continue;
      for (let index = region.start; index < region.end; index += 1)
        characters[index] = " ";
    }
    operationalSource = characters.join("");
  }
  return [
    projectionDigest(operationalSource, OPERATIONAL_DOMAIN_PATTERN),
    projectionDigest(exactContextMasked, CREDENTIAL_TERM_PATTERN),
    projectionDigest(exactContextMasked, LATER_HOLD_TERM_PATTERN),
    projectionDigest(exactContextMasked, F3_STATUS_TERM_PATTERN),
    projectionDigest(
      subjectlessBoundaryProjectionSource(historyMasked),
      SUBJECTLESS_BOUNDARY_POSITIVE_PATTERN,
    ),
    projectionDigest(
      staleHistoricalTailProjectionSource(source),
      AMBIGUOUS_STALE_TERM_PATTERN,
    ),
  ];
}

function validatePublicResourceContext(source, relativePath) {
  const errors = [];
  const pattern =
    /\b[0-9a-f]{32}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  const found = [...source.matchAll(pattern)].map((match) =>
    match[0].toLowerCase(),
  );
  const allowed = new Set(Object.values(PUBLIC_RESOURCES));
  if (relativePath !== DELIVERY_PATH) {
    for (const value of found)
      errors.push(
        `${relativePath}: protected or unknown resource identifier ${value}`,
      );
    return errors;
  }
  for (const value of found)
    if (!allowed.has(value))
      errors.push(
        `${relativePath}: protected or unknown resource identifier ${value}`,
      );
  const compact = normalized(source);
  const contexts = [
    `token is scoped to account \`${PUBLIC_RESOURCES.account}\` with exactly`,
    `tuple binds account \`${PUBLIC_RESOURCES.account}\`, zone \`${PUBLIC_RESOURCES.zone}\`, D1 \`${PUBLIC_RESOURCES.d1}\`, API Worker`,
    `is restricted to account \`${PUBLIC_RESOURCES.account}\` with exactly`,
  ];
  for (const context of contexts)
    if (occurrences(compact, context) !== 1)
      errors.push(
        `${relativePath}: canonical public resource context is missing or relocated: ${context}`,
      );
  for (const [value, count] of [
    [PUBLIC_RESOURCES.account, 3],
    [PUBLIC_RESOURCES.zone, 1],
    [PUBLIC_RESOURCES.d1, 1],
  ])
    if (found.filter((entry) => entry === value).length !== count)
      errors.push(
        `${relativePath}: canonical public resource ${value} must occur exactly ${count} time(s)`,
      );
  return errors;
}

function validateCredentialVocabulary(source, relativePath, projections) {
  const errors = [];
  const names =
    source.match(
      /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*(?:_SECRET|_TOKEN|_PASSWORD|_PRIVATE_KEY|_API_KEY|_ACCOUNT_ID)\b/g,
    ) ?? [];
  for (const name of names)
    if (!ALLOWED_CREDENTIAL_NAMES.has(name))
      errors.push(`${relativePath}: unknown credential interface name ${name}`);
  const safeCredentialDescription =
    "(?:a\\s+)?(?:value-free|confidential|sensitive|redacted|prohibited|absent|unavailable|required|available|scoped|valid|revoked|inactive|active|held|allowed|canonical|non-sensitive|evaluated|referenced)\\b|false\\b|null\\b|none\\b";
  const assignedAllowed = new RegExp(
    `\\b(?:${[...ALLOWED_CREDENTIAL_NAMES].join("|")})\\b[\\\"'\\x60]*\\s*` +
      `(?:(?:has|had)\\b\\s+(?:a\\s+)?value(?:\\s+of)?|value\\s+(?:is|was|equals)\\b|(?:is|was|equals)\\b|[=:])\\s*` +
      `[\\\"'\\x60]?(?!${safeCredentialDescription})[^\\s,;]{3,}`,
    "gi",
  );
  if (assignedAllowed.test(source))
    errors.push(
      `${relativePath}: allowed credential interface name has a prohibited value`,
    );
  const labelledValue = new RegExp(
    `\\b(?:token|api[_ -]?token|access[_ -]?token|secret|password|private[_ -]?key|api[_ -]?key|credential|recovery[_ -]?(?:code|PIN|phrase)|authentication[_ -]?code|login[_ -]?code|(?:reset|emergency|device|security|backup)[_ -]?code|OTP|passcode|session[_ -]?(?:ID|identifier)|client[_ -]?(?:cert(?:ificate)?|assertion)|mTLS[_ -]?certificate|signing[_ -]?certificate|SSH[_ -]?key|authenticator[_ -]?seed|passphrase|TOTP[_ -]?seed|authentication[_ -]?cookie|encryption[_ -]?key)\\b[\\\"'\\x60]*\\s*` +
      `(?:(?:has|had)\\b\\s+(?:a\\s+)?value(?:\\s+of)?|value\\s+(?:is|was|equals)\\b|(?:is|was|equals)\\b|[=:])\\s*` +
      `[\\\"'\\x60]?(?!${safeCredentialDescription})[A-Za-z0-9_./+:=-]{6,}`,
    "i",
  );
  if (labelledValue.test(source))
    errors.push(
      `${relativePath}: token, secret, password, key, or credential value is prohibited`,
    );
  const credentialContextWithValueContinuation = new RegExp(
    `\\b(?:${CREDENTIAL_TERM_PATTERN.source})\\b[^\\n]*?[.!?]\\s*` +
      `(?:Its\\s+(?:value|replacement)\\s*(?:(?:is|was|equals)\\s*|[:=])|That\\s+value\\s*(?:(?:is|was|equals)\\s*|[:=])|It\\s+(?:equals|contains)|(?:The\\s+)?(?:value|replacement)\\s*(?:(?:is|was|equals)\\s*|[:=])|Actual\\s+value\\s*:)[\\s\\x60\"']*[A-Za-z0-9_./+:=-]{6,}`,
    "i",
  );
  if (credentialContextWithValueContinuation.test(source))
    errors.push(
      `${relativePath}: credential value continuation after a safe label is prohibited`,
    );
  const safeCredentialClause = new RegExp(
    "^(?:" + SAFE_CREDENTIAL_CLAUSE + ")$",
    "i",
  );
  const plausibleCompactValue =
    /\b(?:synthetic[-_][A-Za-z0-9_-]{3,}|[A-Za-z]{16,}|(?=[A-Za-z0-9_-]{8,}\b)(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9_-]{8,})\b/i;
  for (const paragraph of source.split(/\r?\n\s*\r?\n/)) {
    const clauses = paragraph
      .split(/(?:\r?\n|[.!?;])/)
      .map((clause) => clause.trim())
      .filter(Boolean);
    const safeCredentialIndexes = clauses.flatMap((clause, index) =>
      safeCredentialClause.test(clause) ? [index] : [],
    );
    for (const index of safeCredentialIndexes) {
      if (
        !clauses.slice(index + 1).some((clause) => {
          for (const match of clause.matchAll(
            new RegExp(plausibleCompactValue.source, "gi"),
          )) {
            const lead = clause.slice(0, match.index);
            const tail = clause.slice(match.index + match[0].length);
            if (
              /^\s+(?:value-free|absent|unavailable|redacted|prohibited)\b/i.test(
                tail,
              )
            )
              continue;
            if (
              /(?:[:=]|\b(?:is|are|was|were|equals?|contains?|holds?|follows?)\b)\s*[\x60"']*\s*$/i.test(
                lead,
              )
            )
              return true;
          }
          return false;
        })
      )
        continue;
      errors.push(
        relativePath +
          ": paragraph-level credential context has a prohibited compact value",
      );
      break;
    }
    if (
      errors.some((error) =>
        error.includes("paragraph-level credential context"),
      )
    )
      break;
  }
  const compactCredentialValue =
    /\bBasic\s+(?!(?:auth|authentication)\b)[A-Za-z0-9+/]{8,}={0,2}\b|\beyJ[A-Za-z0-9_-]{3,}\.[A-Za-z0-9_-]{3,}\.[A-Za-z0-9_-]{3,}\b|\bCookie\s*:\s*(?:session|sessionid|auth|authentication)[-_A-Za-z0-9]*\s*=\s*[^\s;,]{3,}/i;
  if (compactCredentialValue.test(source))
    errors.push(`${relativePath}: compact credential value is prohibited`);
  if (projections[1] !== HIGH_RISK_PROJECTIONS[relativePath]?.[1])
    errors.push(
      `${relativePath}: credential value is prohibited or credential context is not canonical`,
    );
  return errors;
}

function semanticClauses(source) {
  return source
    .split(
      /(?:\r?\n|[.!?;:]|\s+[—–-]\s+|\s*,\s*(?=(?:but|however|yet|and|while|although|though|whereas)\b)|\b(?:but|however|yet|and|while|although|though|whereas)\b)/i,
    )
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function hasExplicitUnrelatedSubject(clause) {
  return /^(?:(?:nevertheless|subsequently|finally|even\s+so|in\s+fact)\s*,?\s*)?(?:The|A|An)\s+(?!(?:(?:current|prospective)\s+)?(?:status|state)\b)(?!F3\b)[A-Za-z][\w-]*/i.test(
    clause,
  );
}

function hasExplicitCommandSubject(clause) {
  return (
    hasExplicitUnrelatedSubject(clause) ||
    /^(?:I|We|You|He|She|They)\b/i.test(clause)
  );
}

function hasAmbiguousHistoricalTail(source) {
  const statusClauses = source
    .split(/(?:\r?\n|[.!?;:]|\s+[—–-]\s+)/)
    .map((clause) => clause.trim())
    .filter(Boolean);
  return statusClauses.some(
    (clause) =>
      AMBIGUOUS_STALE_TERM_PATTERN.test(clause) &&
      !hasExplicitUnrelatedSubject(clause),
  );
}

function validateProcedures(source, relativePath, projections) {
  const errors = [];
  let scanSource = maskSafeClauses(maskPermittedHistoricalContexts(source));
  if (relativePath === DELIVERY_PATH) {
    const regions = [];
    for (const definition of PROCEDURE_REGIONS) {
      const region = extractProcedureRegion(source, definition);
      if (!region) {
        errors.push(
          `${relativePath}: bounded procedure ${definition.id} region is missing or relocated`,
        );
        continue;
      }
      const digest = crypto
        .createHash("sha256")
        .update(region.source)
        .digest("hex");
      if (digest !== definition.sha256)
        errors.push(
          `${relativePath}: bounded procedure ${definition.id} guards or content drifted`,
        );
      regions.push(region);
    }
    const characters = scanSource.split("");
    for (const region of regions)
      for (let index = region.start; index < region.end; index += 1)
        characters[index] = " ";
    scanSource = characters.join("");
  }
  if (projections[0] !== HIGH_RISK_PROJECTIONS[relativePath]?.[0]) {
    errors.push(
      `${relativePath}: protected operational domain occurrence exposes an unbounded, moved, or noncanonical live-action instruction context`,
    );
    const imperative = semanticClauses(scanSource).find((clause) =>
      IMPERATIVE_ACTION_PATTERN.test(clause),
    );
    if (imperative)
      errors.push(
        `${relativePath}: subjectless command-shaped live action is prohibited: ${imperative}`,
      );
  }
  const relocatedProcedure =
    /remove the environment API-token secret|cancel in-flight staging runs|retry\s+revocation|verify the affected token is inactive|run the exact ordered D1 migration ledger|upload immutable SHA-prefix\/run-ID\/attempt-tagged Worker versions|promote the exact UUIDs|run bounded staging smoke|both API and web restoration independently/i;
  const relocatedScanSource = scanSource.replace(
    /If token scope or disclosure\s+evidence is wrong, revoke the token and remove the environment API-token secret before\s+staging can resume\./,
    " ",
  );
  const relocatedMatch = relocatedProcedure.exec(relocatedScanSource);
  if (relocatedMatch)
    errors.push(
      `${relativePath}: bounded live-action clause is outside its guarded runbook region: ${relocatedMatch[0]}`,
    );
  return errors;
}

function validateLaterBoundaries(source, relativePath, projections) {
  const errors = [];
  const clauses = semanticClauses(source);
  const safeLaterClause = new RegExp(
    "^(?:" + SAFE_LATER_CLAUSE + "|" + SAFE_PROTECTED_NEGATIVE_CLAUSE + ")$",
    "i",
  );
  for (const subject of LATER_SUBJECTS) {
    const pattern = new RegExp(
      `\\b${subject.pattern}\\b[^\\n.!?]{0,64}\\b(?:is\\s+|has\\s+been\\s+)?(?:${POSITIVE_VERBS})\\b`,
      "gi",
    );
    for (const clause of clauses) {
      if (safeLaterClause.test(clause)) continue;
      const match = pattern.exec(clause);
      pattern.lastIndex = 0;
      if (!match) continue;
      if (CANONICAL_PROSPECTIVE_LATER_CLAUSES[relativePath]?.has(clause))
        continue;
      errors.push(`${relativePath}: prohibited positive ${subject.id} claim`);
      break;
    }
  }
  // Safe subject clauses are projected away only for byte-identity comparison. This
  // semantic pass deliberately retains each subject and scans every later clause in
  // its paragraph so punctuation cannot launder an elliptical positive continuation.
  const subjectlessPositiveOnly = SUBJECTLESS_BOUNDARY_POSITIVE_PATTERN;
  const safeSubjectClause = safeLaterClause;
  for (const paragraph of source.split(/\r?\n\s*\r?\n/)) {
    const paragraphClauses = semanticClauses(paragraph);
    for (let index = 0; index < paragraphClauses.length; index += 1) {
      if (!safeSubjectClause.test(paragraphClauses[index])) continue;
      for (const continuation of paragraphClauses.slice(index + 1)) {
        if (!subjectlessPositiveOnly.test(continuation)) continue;
        errors.push(
          `${relativePath}: prohibited positive continuation after a protected safe subject`,
        );
        break;
      }
    }
  }
  const paragraphClauses = source
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => semanticClauses(paragraph));
  for (
    let paragraphIndex = 0;
    paragraphIndex < paragraphClauses.length;
    paragraphIndex += 1
  ) {
    const current = paragraphClauses[paragraphIndex];
    const safeIndexes = current.flatMap((clause, index) =>
      safeSubjectClause.test(clause) ? [index] : [],
    );
    for (let index = 0; index < current.length; index += 1) {
      const clause = current[index];
      if (
        hasExplicitCommandSubject(clause) ||
        (!GENERIC_CONTEXT_COMMAND_PATTERN.test(clause) &&
          !IMPERATIVE_ACTION_PATTERN.test(clause))
      )
        continue;
      const followsSameParagraphSubject = safeIndexes.some(
        (safeIndex) => safeIndex < index,
      );
      const followsAdjacentSubject = paragraphClauses[paragraphIndex - 1]?.some(
        (candidate) => safeSubjectClause.test(candidate),
      );
      if (!followsSameParagraphSubject && !followsAdjacentSubject) continue;
      errors.push(
        `${relativePath}: protected safe subject has a prohibited command continuation`,
      );
      break;
    }
  }
  const holdRelease = new RegExp(
    `\\bVOC-080-HOLD-(01|02)\\b[^\\n.!?]{0,64}\\b(?:(?:is\\s+|has\\s+been\\s+)?(?:${POSITIVE_VERBS}|lifted|cleared|removed|satisfied|closed|expired|waived|discharged|ceased)|no\\s+longer\\s+(?:applies|in\\s+force))\\b`,
    "i",
  );
  if (holdRelease.test(source))
    errors.push(`${relativePath}: inherited hold release claim is prohibited`);
  const currentTruthSource = maskPermittedHistoricalContexts(source);
  if (
    /\bF3(?:\/staging|[ -]+staging)?\b[^\n.!?]{0,80}\b(?:(?:remains?|is|are|stays?|continues?\s+to\s+be)\s+(?:pending|unresolved|held)|is\s+not[\s-]+yet[\s-]+delivered)\b/i.test(
      currentTruthSource,
    )
  )
    errors.push(`${relativePath}: stale current F3 unresolved/held wording`);
  if (
    /\bIt\s+(?:(?:still|currently)\s+)?(?:remains?|is|continues?\s+to\s+be)\s+(?:pending|unresolved|not[\s-]+yet[\s-]+delivered)\b|(?:^|[.!?;])\s*Still\s+(?:pending|unresolved|not[\s-]+yet[\s-]+delivered)\b/im.test(
      currentTruthSource,
    )
  )
    errors.push(
      `${relativePath}: stale current F3 pronoun or elliptical status tail`,
    );
  if (projections[2] !== HIGH_RISK_PROJECTIONS[relativePath]?.[2])
    errors.push(
      `${relativePath}: prohibited positive or noncanonical later/hold context`,
    );
  if (projections[3] !== HIGH_RISK_PROJECTIONS[relativePath]?.[3])
    errors.push(
      `${relativePath}: stale current F3 or noncanonical F3 history context`,
    );
  if (projections[4] !== HIGH_RISK_PROJECTIONS[relativePath]?.[4])
    errors.push(
      `${relativePath}: unexplained subjectless positive boundary claim is prohibited`,
    );
  if (projections[5] !== HIGH_RISK_PROJECTIONS[relativePath]?.[5])
    errors.push(
      `${relativePath}: stale subjectless F3 status outside paired history is prohibited`,
    );
  return errors;
}

function validateHistoryBoundary(source, relativePath) {
  const errors = [];
  const currentTruthSource = maskPermittedHistoricalContexts(source);
  for (let number = 94; number <= 104; number += 1) {
    const packageId = `VOC-${String(number).padStart(3, "0")}`;
    const pattern = new RegExp(
      `\\b${packageId}\\b[^.!?]{0,180}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,100}\\b(?:F3|staging)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b|\\b${packageId}\\b[^.!?]{0,180}\\b(?:F3|staging)\\b[^.!?]{0,80}\\b(?:current|now|still|remains?|active)\\b[^.!?]{0,60}\\b(?:pending|unresolved|not[\\s-]+yet[\\s-]+delivered)\\b`,
      "i",
    );
    if (pattern.test(currentTruthSource))
      errors.push(
        `${relativePath}: ${packageId} superseded F3 history is presented as current`,
      );
  }
  if (relativePath === F3_NARRATIVE_PATH) {
    const compact = normalized(source);
    for (const marker of [
      "VOC-094 through VOC-104 remain immutable historical snapshots.",
      "This later exact record supersedes their prospective pending language only for current F3 status",
    ])
      if (!compact.includes(marker))
        errors.push(
          `${relativePath}: explicit immutable-history and later-VOC-105 supersession boundary is missing`,
        );
  }
  return errors;
}

export function inspectF3Surface(source, relativePath) {
  const projections = protectedProjectionDigests(source, relativePath);
  return [
    ...validatePublicResourceContext(source, relativePath),
    ...validateCredentialVocabulary(source, relativePath, projections),
    ...validateProcedures(source, relativePath, projections),
    ...validateLaterBoundaries(source, relativePath, projections),
    ...validateHistoryBoundary(source, relativePath),
  ];
}

export function inspectF3Evidence(root) {
  const errors = [];
  const sources = new Map();
  for (const relativePath of DESIGNATED_F3_SURFACES) {
    try {
      sources.set(relativePath, readSurface(root, relativePath));
    } catch {
      errors.push(
        `${relativePath}: designated current-truth surface is missing or unreadable`,
      );
    }
  }
  const recordSource = sources.get(F3_RECORD_PATH);
  if (recordSource !== undefined) {
    try {
      errors.push(...validateRecord(recordSource, JSON.parse(recordSource)));
    } catch (error) {
      errors.push(`${F3_RECORD_PATH}: invalid JSON (${error.message})`);
    }
  }
  for (const [relativePath, source] of sources)
    errors.push(...inspectF3Surface(source, relativePath));
  const narrative = sources.get(F3_NARRATIVE_PATH);
  if (narrative !== undefined)
    for (const marker of [
      "33386240492",
      "03528a84988ebe664207c6a439e133070627c92a",
      "skipped-expected",
      "skipped-held",
      "VOC-094 through VOC-104 remain immutable",
    ])
      if (!narrative.includes(marker))
        errors.push(`${F3_NARRATIVE_PATH}: missing ${marker}`);

  let packageJson;
  try {
    packageJson = JSON.parse(readSurface(root, "package.json"));
  } catch (error) {
    errors.push(`package.json: ${error.message}`);
    return errors;
  }
  if (
    packageJson.scripts?.["ci:f3-evidence"] !==
    "node scripts/foundation/voc105-f3-evidence-policy.mjs"
  )
    errors.push("package.json: ci:f3-evidence script is missing or drifted");
  errors.push(...inspectF2Scripts(JSON.stringify(packageJson)));
  const segments = (packageJson.scripts?.["ci:foundation"] ?? "")
    .split("&&")
    .map((segment) => segment.trim());
  if (
    segments.filter((segment) => segment === "pnpm run ci:f3-evidence")
      .length !== 1
  )
    errors.push(
      "package.json: ci:foundation must contain exact ci:f3-evidence segment once",
    );
  const settingsIndex = segments.indexOf("pnpm run ci:settings-truth");
  if (
    segments[settingsIndex + 1] !== "pnpm run ci:f3-evidence" ||
    segments[settingsIndex + 2] !== "node --test scripts/foundation/*.test.mjs"
  )
    errors.push(
      "package.json: ci:f3-evidence must occupy the governed extension slot",
    );
  return errors;
}

export function validateF3Evidence(root) {
  const errors = inspectF3Evidence(root);
  if (errors.length)
    throw new Error(
      `VOC-105 F3 evidence policy failed:\n- ${errors.join("\n- ")}`,
    );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    validateF3Evidence(process.cwd());
    console.log("VOC-105 F3 evidence policy: PASS");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
