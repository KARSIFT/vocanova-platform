PRAGMA foreign_keys = ON;

CREATE TABLE canonical_words (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  text TEXT NOT NULL CHECK (length(text) > 0),
  normalized_text TEXT NOT NULL CHECK (length(normalized_text) > 0),
  word_type TEXT NOT NULL DEFAULT 'word'
    CHECK (word_type IN ('word', 'phrase', 'phrasal_verb', 'idiom', 'collocation')),
  language_code TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  difficulty_level TEXT CHECK (difficulty_level IN ('a1', 'a2', 'b1', 'b2', 'c1', 'unknown')),
  frequency_rank INTEGER,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (language_code, normalized_text)
) STRICT;

CREATE TABLE word_meanings (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  word_id TEXT NOT NULL REFERENCES canonical_words(id) ON DELETE RESTRICT,
  part_of_speech TEXT NOT NULL
    CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun', 'determiner', 'phrase', 'idiom', 'phrasal_verb', 'collocation', 'other')),
  short_definition TEXT NOT NULL CHECK (length(short_definition) > 0),
  learner_definition TEXT,
  meaning_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  difficulty_level TEXT CHECK (difficulty_level IN ('a1', 'a2', 'b1', 'b2', 'c1', 'unknown')),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (word_id, meaning_order)
) STRICT;
CREATE INDEX word_meanings_word_id_idx ON word_meanings (word_id);

CREATE TABLE word_examples (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  meaning_id TEXT NOT NULL REFERENCES word_meanings(id) ON DELETE RESTRICT,
  example_text TEXT NOT NULL CHECK (length(example_text) > 0),
  example_order INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('a1', 'a2', 'b1', 'b2', 'c1', 'unknown')),
  situation_label TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (meaning_id, example_order)
) STRICT;
CREATE INDEX word_examples_meaning_id_idx ON word_examples (meaning_id);

CREATE TABLE usage_notes (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  meaning_id TEXT NOT NULL REFERENCES word_meanings(id) ON DELETE RESTRICT,
  note_type TEXT NOT NULL
    CHECK (note_type IN ('collocation', 'register', 'common_mistake', 'grammar', 'pronunciation', 'other')),
  note_text TEXT NOT NULL CHECK (length(note_text) > 0),
  note_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (meaning_id, note_order)
) STRICT;
CREATE INDEX usage_notes_meaning_id_idx ON usage_notes (meaning_id);

CREATE TABLE journey_situations (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  slug TEXT NOT NULL UNIQUE CHECK (length(slug) > 0),
  title TEXT NOT NULL CHECK (length(title) > 0),
  short_description TEXT NOT NULL CHECK (length(short_description) > 0),
  level_band TEXT CHECK (level_band IN ('a1_a2', 'a2_b1', 'b1_b2', 'mixed')),
  category TEXT NOT NULL CHECK (category IN ('daily_life', 'travel', 'work', 'study', 'social')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  display_order INTEGER NOT NULL,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE INDEX journey_situations_status_order_idx
  ON journey_situations (status, display_order, id);

CREATE TABLE journey_words (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  journey_situation_id TEXT NOT NULL REFERENCES journey_situations(id) ON DELETE RESTRICT,
  meaning_id TEXT NOT NULL REFERENCES word_meanings(id) ON DELETE RESTRICT,
  relevance_score INTEGER NOT NULL DEFAULT 50 CHECK (relevance_score BETWEEN 1 AND 100),
  display_order INTEGER,
  is_core INTEGER NOT NULL DEFAULT 0 CHECK (is_core IN (0, 1)),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (journey_situation_id, meaning_id)
) STRICT;
CREATE INDEX journey_words_situation_idx ON journey_words (journey_situation_id);
CREATE INDEX journey_words_meaning_idx ON journey_words (meaning_id);

CREATE TABLE user_words (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  meaning_id TEXT NOT NULL REFERENCES word_meanings(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'learning', 'reviewing', 'mastered', 'ignored', 'archived')),
  source TEXT NOT NULL CHECK (source IN ('journey', 'search', 'ai_suggestion', 'manual', 'seed')),
  review_step INTEGER NOT NULL DEFAULT 0 CHECK (review_step BETWEEN 0 AND 7),
  next_review_at TEXT,
  last_reviewed_at TEXT,
  last_result TEXT CHECK (last_result IN ('correct', 'incorrect', 'skipped')),
  last_rating TEXT CHECK (last_rating IN ('again', 'hard', 'good', 'easy')),
  consecutive_correct_count INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_correct_count >= 0),
  consecutive_incorrect_count INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_incorrect_count >= 0),
  total_review_count INTEGER NOT NULL DEFAULT 0 CHECK (total_review_count >= 0),
  correct_review_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_review_count BETWEEN 0 AND total_review_count),
  added_at TEXT NOT NULL CHECK (added_at GLOB '????-??-??T??:??:??.???Z'),
  mastered_at TEXT,
  ignored_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (next_review_at IS NULL OR next_review_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (last_reviewed_at IS NULL OR last_reviewed_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (deleted_at IS NULL OR deleted_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;
CREATE UNIQUE INDEX user_words_active_key
  ON user_words (user_id, meaning_id) WHERE deleted_at IS NULL;
CREATE INDEX user_words_user_status_idx ON user_words (user_id, status);
CREATE INDEX user_words_due_idx
  ON user_words (user_id, next_review_at, id) WHERE deleted_at IS NULL;

CREATE TABLE idempotency_keys (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  operation TEXT NOT NULL CHECK (length(operation) > 0),
  key TEXT NOT NULL CHECK (length(key) BETWEEN 1 AND 200),
  fingerprint TEXT NOT NULL CHECK (length(fingerprint) = 64 AND fingerprint NOT GLOB '*[^0-9a-f]*'),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (user_id, operation, key)
) STRICT;
CREATE INDEX idempotency_keys_created_at_idx ON idempotency_keys (created_at);

CREATE TABLE review_attempts (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  user_word_id TEXT NOT NULL REFERENCES user_words(id) ON DELETE RESTRICT,
  meaning_id TEXT NOT NULL REFERENCES word_meanings(id) ON DELETE RESTRICT,
  attempt_type TEXT NOT NULL CHECK (attempt_type = 'review'),
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('multiple_choice', 'self_check')),
  result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect', 'skipped')),
  rating TEXT CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  review_step_before INTEGER NOT NULL CHECK (review_step_before BETWEEN 0 AND 7),
  review_step_after INTEGER NOT NULL CHECK (review_step_after BETWEEN 0 AND 7),
  answered_at TEXT NOT NULL CHECK (answered_at GLOB '????-??-??T??:??:??.???Z'),
  response_time_ms INTEGER NOT NULL DEFAULT 0 CHECK (response_time_ms >= 0),
  selected_option_meaning_id TEXT REFERENCES word_meanings(id) ON DELETE RESTRICT,
  typed_answer TEXT,
  was_hint_used INTEGER NOT NULL DEFAULT 0 CHECK (was_hint_used IN (0, 1)),
  source TEXT NOT NULL CHECK (source IN ('review', 'review_session')),
  client_attempt_id TEXT NOT NULL CHECK (length(client_attempt_id) > 0),
  metadata_json TEXT CHECK (metadata_json IS NULL OR json_valid(metadata_json)),
  created_at TEXT NOT NULL CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  updated_at TEXT NOT NULL CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (user_id, client_attempt_id)
) STRICT;
CREATE INDEX review_attempts_user_answered_idx ON review_attempts (user_id, answered_at);
CREATE INDEX review_attempts_user_word_answered_idx ON review_attempts (user_word_id, answered_at);
CREATE INDEX review_attempts_meaning_answered_idx ON review_attempts (meaning_id, answered_at);
