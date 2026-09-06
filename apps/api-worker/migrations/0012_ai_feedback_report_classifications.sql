-- Reports are immutable records. Enforce the fixed, privacy-bounded mapping
-- for future inserts without rewriting historical generic report rows.
CREATE TRIGGER ai_feedback_reports_classification_guard_insert
BEFORE INSERT ON ai_feedback_reports
WHEN NEW.classification NOT IN (
  'incorrect_correction',
  'unclear_explanation',
  'irrelevant_feedback',
  'inappropriate_feedback',
  'other_quality_problem'
) OR NEW.classification IS NULL
OR (NEW.classification = 'incorrect_correction' AND NEW.reason <> 'The correction is wrong.')
OR (NEW.classification = 'unclear_explanation' AND NEW.reason <> 'The explanation is unclear.')
OR (NEW.classification = 'irrelevant_feedback' AND NEW.reason <> 'The feedback is irrelevant.')
OR (NEW.classification = 'inappropriate_feedback' AND NEW.reason <> 'The feedback is inappropriate.')
OR (NEW.classification = 'other_quality_problem' AND NEW.reason <> 'Another quality problem.')
BEGIN
  SELECT RAISE(ABORT, 'invalid AI feedback report classification');
END;
