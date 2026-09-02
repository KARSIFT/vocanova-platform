// Lighthouse score thresholds and assertion helpers.
//
// The web application design records the three performance
// budgets for the VocaNova web app:
//
//   Performance    >= 85
//   Accessibility  >= 95
//   Best Practices >= 90
//
// This suite enforces the thresholds programmatically across four
// screens (Home, Discover, Reviews, Progress) at the
// three supported layouts (360px, 430px, one representative
// desktop width >=1024px) - 12 audits in total.
//
// Thresholds are mirrored verbatim here from the web application design. These
// constants are the executable source of truth for the runner.
// Lowering a threshold here without a matching design update would
// silently weaken the quality bar.

export const LIGHTHOUSE_THRESHOLDS = Object.freeze({
  performance: 85,
  accessibility: 95,
  "best-practices": 90,
});

export const LIGHTHOUSE_CATEGORIES = Object.freeze([
  "performance",
  "accessibility",
  "best-practices",
]);

/**
 * formatCategoryScoreRow renders one (screen, layout, category)
 * result line in the runner's stdout report. Kept as a separate
 * helper so the runner's per-run and summary output can share
 * one formatter.
 */
export function formatCategoryScoreRow({
  screen,
  layout,
  category,
  score,
  threshold,
  pass,
}) {
  const pct = score === null ? "n/a" : Math.round(score * 100);
  const bar = pass ? "PASS" : "FAIL";
  return `  [${bar}] ${screen.padEnd(8)} ${layout.padEnd(14)} ${category.padEnd(15)} score=${pct} (>=${threshold})`;
}

/**
 * assertScores compares the lighthouse category scores against
 * configured thresholds and returns the list of failing
 * (category, actual, threshold) entries. An empty list means
 * every category met its threshold.
 *
 * Scores are reported by `lighthouse()` as 0..1 floats; the
 * threshold constants are 0..100 integers, so this helper
 * multiplies before comparing.
 */
export function assertScores({ screen, layout, scores }) {
  const failures = [];
  for (const category of LIGHTHOUSE_CATEGORIES) {
    const raw = scores?.[category];
    const score = typeof raw === "number" ? raw : null;
    const threshold = LIGHTHOUSE_THRESHOLDS[category];
    if (score === null) {
      failures.push({ category, actual: null, threshold, screen, layout });
      continue;
    }
    const scorePct = score * 100;
    if (scorePct < threshold) {
      failures.push({
        category,
        actual: scorePct,
        threshold,
        screen,
        layout,
      });
    }
  }
  return failures;
}
