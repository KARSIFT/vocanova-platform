PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  email TEXT COLLATE NOCASE UNIQUE CHECK (email IS NULL OR length(email) BETWEEN 3 AND 254),
  display_name TEXT NOT NULL DEFAULT '' CHECK (length(display_name) <= 80),
  avatar_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted')),
  onboarding_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed')),
  email_verified_at TEXT,
  last_login_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (email_verified_at IS NULL OR email_verified_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (last_login_at IS NULL OR last_login_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (deleted_at IS NULL OR deleted_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE external_identities (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'email')),
  provider_subject TEXT NOT NULL CHECK (length(provider_subject) > 0),
  provider_email TEXT NOT NULL DEFAULT '',
  provider_email_verified INTEGER NOT NULL DEFAULT 0 CHECK (provider_email_verified IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (updated_at GLOB '????-??-??T??:??:??.???Z'),
  UNIQUE (provider, provider_subject)
) STRICT;

CREATE INDEX external_identities_user_id_idx ON external_identities (user_id);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL CHECK (expires_at > created_at),
  revoked_at TEXT,
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (expires_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (revoked_at IS NULL OR revoked_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE INDEX sessions_user_expiry_idx ON sessions (user_id, expires_at);
CREATE INDEX sessions_active_expiry_idx ON sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE magic_links (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT REFERENCES users(id) ON DELETE RESTRICT,
  email TEXT NOT NULL COLLATE NOCASE CHECK (length(email) > 2),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  environment TEXT NOT NULL CHECK (length(environment) > 0),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL CHECK (expires_at > created_at),
  consumed_at TEXT,
  revoked_at TEXT,
  CHECK (consumed_at IS NULL OR revoked_at IS NULL),
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (expires_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (consumed_at IS NULL OR consumed_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (revoked_at IS NULL OR revoked_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE INDEX magic_links_active_expiry_idx ON magic_links (expires_at)
  WHERE consumed_at IS NULL AND revoked_at IS NULL;

CREATE TABLE oauth_states (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  environment TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider = 'google'),
  app_return_url TEXT NOT NULL CHECK (length(app_return_url) > 0),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL CHECK (expires_at > created_at),
  consumed_at TEXT,
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (expires_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (consumed_at IS NULL OR consumed_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE user_settings (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  daily_review_target INTEGER NOT NULL DEFAULT 20 CHECK (daily_review_target BETWEEN 5 AND 100),
  review_interval_preset TEXT NOT NULL DEFAULT 'vocanova_default'
    CHECK (review_interval_preset IN ('vocanova_default', 'wordup_like', 'custom')),
  notifications_enabled INTEGER NOT NULL DEFAULT 1 CHECK (notifications_enabled IN (0, 1)),
  marketing_emails_enabled INTEGER NOT NULL DEFAULT 0 CHECK (marketing_emails_enabled IN (0, 1)),
  app_language TEXT NOT NULL DEFAULT 'en' CHECK (app_language = 'en'),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE user_onboarding_profiles (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  english_level TEXT NOT NULL CHECK (english_level IN ('a1', 'a2', 'b1', 'b2', 'unknown')),
  native_language TEXT NOT NULL CHECK (length(native_language) > 0),
  learning_goal TEXT NOT NULL CHECK (learning_goal IN ('general', 'work', 'travel', 'study', 'conversation', 'exam')),
  main_use_case TEXT NOT NULL CHECK (main_use_case IN ('daily_life', 'work', 'travel', 'study', 'social')),
  daily_review_target INTEGER NOT NULL CHECK (daily_review_target BETWEEN 5 AND 100),
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (completed_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE email_change_links (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  new_email TEXT NOT NULL COLLATE NOCASE CHECK (length(new_email) > 2),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  environment TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL CHECK (expires_at > created_at),
  consumed_at TEXT,
  revoked_at TEXT,
  CHECK (consumed_at IS NULL OR revoked_at IS NULL),
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (expires_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (consumed_at IS NULL OR consumed_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (revoked_at IS NULL OR revoked_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE INDEX email_change_links_user_id_idx ON email_change_links (user_id);

CREATE TABLE account_deletion_requests (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'deactivated'
    CHECK (status IN ('deactivated', 'anonymizing', 'completed')),
  requested_at TEXT NOT NULL,
  purge_after TEXT NOT NULL CHECK (purge_after > requested_at),
  completed_at TEXT,
  idempotency_key TEXT NOT NULL CHECK (length(idempotency_key) BETWEEN 1 AND 200),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (requested_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (purge_after GLOB '????-??-??T??:??:??.???Z'),
  CHECK (completed_at IS NULL OR completed_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (created_at GLOB '????-??-??T??:??:??.???Z'),
  CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE TABLE auth_rate_limits (
  bucket_key TEXT PRIMARY KEY NOT NULL CHECK (length(bucket_key) BETWEEN 1 AND 200),
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts >= 1)
) STRICT;
