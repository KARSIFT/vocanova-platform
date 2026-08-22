PRAGMA foreign_keys = ON;

CREATE TABLE daily_mission_snapshots (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  local_date TEXT NOT NULL CHECK (local_date GLOB '????-??-??'),
  timezone TEXT NOT NULL CHECK (length(timezone) > 0),
  review_target INTEGER NOT NULL CHECK (review_target BETWEEN 5 AND 100),
  reviews_completed INTEGER NOT NULL DEFAULT 0 CHECK (reviews_completed BETWEEN 0 AND review_target),
  new_word_target INTEGER CHECK (new_word_target BETWEEN 1 AND 100),
  new_words_completed INTEGER,
  sentence_practice_target INTEGER CHECK (sentence_practice_target BETWEEN 1 AND 100),
  sentence_practices_completed INTEGER,
  policy_version TEXT NOT NULL CHECK (length(policy_version) > 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'missed', 'protected')),
  completed_at TEXT,
  grace_applied INTEGER NOT NULL DEFAULT 0 CHECK (grace_applied IN (0, 1)),
  grace_day_id TEXT,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (new_word_target IS NULL OR new_words_completed BETWEEN 0 AND new_word_target),
  CHECK (sentence_practice_target IS NULL OR sentence_practices_completed BETWEEN 0 AND sentence_practice_target),
  CHECK (status <> 'completed' OR completed_at IS NOT NULL),
  UNIQUE (user_id, local_date)
) STRICT;
CREATE INDEX daily_mission_snapshots_user_status_idx ON daily_mission_snapshots (user_id, status);

CREATE TABLE daily_activity_summaries (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  local_date TEXT NOT NULL CHECK (local_date GLOB '????-??-??'),
  timezone TEXT NOT NULL CHECK (length(timezone) > 0),
  reviews_attempted INTEGER NOT NULL DEFAULT 0 CHECK (reviews_attempted >= 0),
  reviews_correct INTEGER NOT NULL DEFAULT 0 CHECK (reviews_correct BETWEEN 0 AND reviews_attempted),
  reviews_skipped INTEGER NOT NULL DEFAULT 0 CHECK (reviews_skipped BETWEEN 0 AND reviews_attempted),
  words_discovered INTEGER NOT NULL DEFAULT 0 CHECK (words_discovered >= 0),
  words_added INTEGER NOT NULL DEFAULT 0 CHECK (words_added >= 0),
  sentences_submitted INTEGER NOT NULL DEFAULT 0 CHECK (sentences_submitted >= 0),
  ai_feedback_received INTEGER NOT NULL DEFAULT 0 CHECK (ai_feedback_received >= 0),
  confidence_points_earned INTEGER NOT NULL DEFAULT 0,
  confidence_points_spent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (user_id, local_date)
) STRICT;

CREATE TABLE confidence_point_ledger (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('word_added', 'review_correct', 'daily_mission_completed', 'sentence_submitted', 'ai_feedback_received', 'streak_bonus', 'admin_adjustment')),
  source_type TEXT NOT NULL CHECK (source_type IN ('user_word', 'review_attempt', 'daily_mission', 'learner_sentence', 'ai_feedback_attempt', 'streak', 'admin')),
  source_id TEXT,
  idempotency_key TEXT,
  metadata_json TEXT CHECK (metadata_json IS NULL OR json_valid(metadata_json)),
  occurred_at TEXT NOT NULL CHECK (occurred_at GLOB '????-??-??T??:??:??.???Z'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE UNIQUE INDEX confidence_point_ledger_user_idempotency_key
  ON confidence_point_ledger (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX confidence_point_ledger_user_occurred_idx ON confidence_point_ledger (user_id, occurred_at);

CREATE TABLE streak_states (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  current_streak_count INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_count >= 0),
  longest_streak_count INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_count >= current_streak_count),
  last_completed_local_date TEXT CHECK (last_completed_local_date IS NULL OR last_completed_local_date GLOB '????-??-??'),
  last_activity_local_date TEXT CHECK (last_activity_local_date IS NULL OR last_activity_local_date GLOB '????-??-??'),
  timezone TEXT NOT NULL CHECK (length(timezone) > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'broken')),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE grace_day_ledger (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  balance_after INTEGER NOT NULL CHECK (balance_after BETWEEN 0 AND 2),
  reason TEXT NOT NULL CHECK (reason IN ('earned_by_streak', 'manual_grant', 'used_for_missed_day', 'expired', 'admin_adjustment')),
  source_type TEXT NOT NULL CHECK (source_type IN ('daily_mission', 'streak', 'admin')),
  source_id TEXT,
  applied_to_local_date TEXT NOT NULL CHECK (applied_to_local_date GLOB '????-??-??'),
  timezone TEXT NOT NULL CHECK (length(timezone) > 0),
  idempotency_key TEXT,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE UNIQUE INDEX grace_day_ledger_user_idempotency_key
  ON grace_day_ledger (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX grace_day_ledger_user_date_idx ON grace_day_ledger (user_id, applied_to_local_date);
