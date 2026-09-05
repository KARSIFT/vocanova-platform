-- A review's append-only evidence and its scheduler transition must both belong
-- to an active saved word. This guards the stale-read window between repository
-- validation and its atomic batch, so a concurrent soft delete aborts every
-- downstream review, mission, activity, reward, and idempotency statement.

CREATE TRIGGER review_attempt_requires_active_saved_word
BEFORE INSERT ON review_attempts
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM user_words
  WHERE id = NEW.user_word_id
    AND user_id = NEW.user_id
    AND meaning_id = NEW.meaning_id
    AND deleted_at IS NULL
)
BEGIN
  SELECT RAISE(ABORT, 'review attempt requires an active saved word');
END;
