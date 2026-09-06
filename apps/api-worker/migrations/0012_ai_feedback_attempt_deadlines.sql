-- A lease row is replaced when a learner starts another generation, so it
-- cannot identify the deadline of an older pending attempt. Persist the
-- reservation deadline with each new attempt; NULL preserves legacy rows,
-- which the repository recovers after its bounded fallback window.
ALTER TABLE ai_feedback_attempts
  ADD COLUMN generation_expires_at TEXT
  CHECK (generation_expires_at IS NULL OR generation_expires_at GLOB '????-??-??T??:??:??.???Z');

CREATE INDEX ai_feedback_attempts_pending_expiry_idx
  ON ai_feedback_attempts (generation_expires_at)
  WHERE status = 'pending';

-- Bind AI idempotency keys to immutable attempt history without changing the
-- retired source-schema table. This keeps an original key replaying its
-- terminal outcome when a fresh key replaces the same request hash.
CREATE TABLE ai_feedback_idempotency_attempts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  key TEXT NOT NULL CHECK (length(key) BETWEEN 1 AND 200),
  attempt_id TEXT NOT NULL CHECK (length(attempt_id) = 36 AND attempt_id NOT GLOB '*[^0-9a-f-]*'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  PRIMARY KEY (user_id, key)
) WITHOUT ROWID, STRICT;

CREATE INDEX ai_feedback_idempotency_attempts_attempt_idx
  ON ai_feedback_idempotency_attempts (attempt_id);

-- Preserve replay linkage for existing active attempts whose stored request
-- hash still matches the historical idempotency fingerprint. Previously
-- finalized failures already rotate their hash and retain their established
-- retryable replay behavior.
INSERT INTO ai_feedback_idempotency_attempts (user_id, key, attempt_id, created_at)
SELECT k.user_id, k.key, a.id, k.created_at
FROM idempotency_keys k
JOIN ai_feedback_attempts a ON a.request_hash = k.fingerprint
JOIN learner_sentences s ON s.id = a.learner_sentence_id AND s.user_id = k.user_id
WHERE k.operation = 'ai_feedback_request';
