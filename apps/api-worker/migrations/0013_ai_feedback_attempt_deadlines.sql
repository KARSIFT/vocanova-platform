-- A lease row is replaced when a learner starts another generation, so it
-- cannot identify the deadline of an older pending attempt. Persist the
-- reservation deadline with each new attempt; NULL preserves legacy rows,
-- which the repository recovers after its bounded fallback window.
ALTER TABLE ai_feedback_attempts
  ADD COLUMN generation_expires_at TEXT
  CHECK (
    generation_expires_at IS NULL
    OR (
      length(generation_expires_at) = 24
      AND substr(generation_expires_at, 5, 1) = '-'
      AND substr(generation_expires_at, 8, 1) = '-'
      AND substr(generation_expires_at, 11, 1) = 'T'
      AND substr(generation_expires_at, 14, 1) = ':'
      AND substr(generation_expires_at, 17, 1) = ':'
      AND substr(generation_expires_at, 20, 1) = '.'
      AND substr(generation_expires_at, 24, 1) = 'Z'
      AND (
        substr(generation_expires_at, 1, 4)
        || substr(generation_expires_at, 6, 2)
        || substr(generation_expires_at, 9, 2)
        || substr(generation_expires_at, 12, 2)
        || substr(generation_expires_at, 15, 2)
        || substr(generation_expires_at, 18, 2)
        || substr(generation_expires_at, 21, 3)
      ) NOT GLOB '*[^0-9]*'
      AND CAST(substr(generation_expires_at, 12, 2) AS INTEGER) BETWEEN 0 AND 23
      AND CAST(substr(generation_expires_at, 15, 2) AS INTEGER) BETWEEN 0 AND 59
      AND CAST(substr(generation_expires_at, 18, 2) AS INTEGER) BETWEEN 0 AND 59
      AND strftime('%Y-%m-%dT%H:%M:%fZ', generation_expires_at) IS NOT NULL
      AND strftime('%Y-%m-%dT%H:%M:%fZ', generation_expires_at) = generation_expires_at
    )
  );

CREATE INDEX ai_feedback_attempts_pending_expiry_idx
  ON ai_feedback_attempts (generation_expires_at)
  WHERE status = 'pending';

-- Bind AI idempotency keys to immutable attempt history without changing the
-- retired source-schema table. This keeps an original key replaying its
-- terminal outcome when a fresh key replaces the same request hash.
CREATE TABLE ai_feedback_idempotency_attempts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL CHECK (length(key) BETWEEN 1 AND 200),
  attempt_id TEXT NOT NULL REFERENCES ai_feedback_attempts(id) ON DELETE CASCADE
    CHECK (length(attempt_id) = 36 AND attempt_id NOT GLOB '*[^0-9a-f-]*'),
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
