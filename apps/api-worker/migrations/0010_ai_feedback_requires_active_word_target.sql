-- Word Detail practice must remain linked to an active saved word when its
-- learner sentence is persisted. Review-origin feedback intentionally keeps
-- its historical target after a word is removed.

CREATE TRIGGER learner_sentence_requires_active_word_target
BEFORE INSERT ON learner_sentences
FOR EACH ROW
WHEN NEW.source = 'word_detail' AND NOT EXISTS (
  SELECT 1 FROM user_words
  WHERE id = NEW.user_word_id AND user_id = NEW.user_id AND deleted_at IS NULL
)
BEGIN
  SELECT RAISE(ABORT, 'learner sentence requires an active word target');
END;
