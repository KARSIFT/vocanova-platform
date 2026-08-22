PRAGMA foreign_keys = ON;

CREATE TABLE learner_sentences (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  meaning_id TEXT REFERENCES word_meanings(id) ON DELETE RESTRICT,
  user_word_id TEXT REFERENCES user_words(id) ON DELETE RESTRICT,
  sentence_text TEXT NOT NULL CHECK (length(sentence_text) BETWEEN 1 AND 1000),
  normalized_sentence_text TEXT NOT NULL CHECK (length(normalized_sentence_text) > 0),
  source TEXT NOT NULL CHECK (source IN ('word_detail', 'review', 'daily_mission', 'free_practice')),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'feedback_ready', 'feedback_failed', 'archived')),
  submitted_at TEXT NOT NULL CHECK (submitted_at GLOB '????-??-??T??:??:??.???Z'),
  deleted_at TEXT CHECK (deleted_at IS NULL OR deleted_at GLOB '????-??-??T??:??:??.???Z'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE INDEX learner_sentences_user_submitted_idx ON learner_sentences (user_id, submitted_at);
CREATE INDEX learner_sentences_user_status_idx ON learner_sentences (user_id, status);

CREATE TABLE ai_feedback_attempts (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  learner_sentence_id TEXT NOT NULL REFERENCES learner_sentences(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  provider TEXT NOT NULL CHECK (length(provider) > 0),
  model TEXT NOT NULL CHECK (length(model) > 0),
  prompt_version TEXT NOT NULL CHECK (length(prompt_version) > 0),
  request_hash TEXT NOT NULL UNIQUE CHECK (length(request_hash) = 64 AND request_hash NOT GLOB '*[^0-9a-f]*'),
  feedback_json TEXT CHECK (feedback_json IS NULL OR json_valid(feedback_json)),
  feedback_text TEXT,
  error_code TEXT,
  error_message TEXT,
  started_at TEXT CHECK (started_at IS NULL OR started_at GLOB '????-??-??T??:??:??.???Z'),
  completed_at TEXT CHECK (completed_at IS NULL OR completed_at GLOB '????-??-??T??:??:??.???Z'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (status <> 'succeeded' OR completed_at IS NOT NULL),
  CHECK (status <> 'failed' OR error_code IS NOT NULL)
) STRICT;
CREATE INDEX ai_feedback_attempts_sentence_started_idx
  ON ai_feedback_attempts (learner_sentence_id, started_at);
CREATE INDEX ai_feedback_attempts_status_started_idx ON ai_feedback_attempts (status, started_at);

CREATE TABLE ai_feedback_reports (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  attempt_id TEXT NOT NULL REFERENCES ai_feedback_attempts(id) ON DELETE RESTRICT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (length(reason) BETWEEN 1 AND 200),
  classification TEXT CHECK (classification IS NULL OR length(classification) BETWEEN 1 AND 100),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (attempt_id, user_id)
) STRICT;

CREATE TABLE ai_usage_counters (
  scope TEXT NOT NULL CHECK (scope IN ('user_minute', 'user_day', 'global_day', 'global_month')),
  subject TEXT NOT NULL CHECK (length(subject) > 0),
  period TEXT NOT NULL CHECK (length(period) > 0),
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_cost_cents >= 0),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  PRIMARY KEY (scope, subject, period)
) WITHOUT ROWID, STRICT;

CREATE TABLE ai_generation_leases (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  lease_id TEXT NOT NULL UNIQUE CHECK (length(lease_id) = 36 AND lease_id NOT GLOB '*[^0-9a-f-]*'),
  expires_at TEXT NOT NULL CHECK (expires_at GLOB '????-??-??T??:??:??.???Z'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE INDEX ai_generation_leases_expiry_idx ON ai_generation_leases (expires_at);
