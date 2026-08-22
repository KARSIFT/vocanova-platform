-- Freeze every converted table while an exact multi-invocation reconciliation
-- is active. The plan-bound lock row lives in platform_metadata and is released
-- explicitly only after the completed report has been recorded.
-- Existing STRICT table and CHECK constraints remain unchanged.

CREATE TRIGGER users_reconciliation_guard_insert
BEFORE INSERT ON users
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER users_reconciliation_guard_update
BEFORE UPDATE ON users
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER users_reconciliation_guard_delete
BEFORE DELETE ON users
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER external_identities_reconciliation_guard_insert
BEFORE INSERT ON external_identities
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER external_identities_reconciliation_guard_update
BEFORE UPDATE ON external_identities
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER external_identities_reconciliation_guard_delete
BEFORE DELETE ON external_identities
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_onboarding_profiles_reconciliation_guard_insert
BEFORE INSERT ON user_onboarding_profiles
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_onboarding_profiles_reconciliation_guard_update
BEFORE UPDATE ON user_onboarding_profiles
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_onboarding_profiles_reconciliation_guard_delete
BEFORE DELETE ON user_onboarding_profiles
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_settings_reconciliation_guard_insert
BEFORE INSERT ON user_settings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_settings_reconciliation_guard_update
BEFORE UPDATE ON user_settings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_settings_reconciliation_guard_delete
BEFORE DELETE ON user_settings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER sessions_reconciliation_guard_insert
BEFORE INSERT ON sessions
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER sessions_reconciliation_guard_update
BEFORE UPDATE ON sessions
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER sessions_reconciliation_guard_delete
BEFORE DELETE ON sessions
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER magic_links_reconciliation_guard_insert
BEFORE INSERT ON magic_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER magic_links_reconciliation_guard_update
BEFORE UPDATE ON magic_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER magic_links_reconciliation_guard_delete
BEFORE DELETE ON magic_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER oauth_states_reconciliation_guard_insert
BEFORE INSERT ON oauth_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER oauth_states_reconciliation_guard_update
BEFORE UPDATE ON oauth_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER oauth_states_reconciliation_guard_delete
BEFORE DELETE ON oauth_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER email_change_links_reconciliation_guard_insert
BEFORE INSERT ON email_change_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER email_change_links_reconciliation_guard_update
BEFORE UPDATE ON email_change_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER email_change_links_reconciliation_guard_delete
BEFORE DELETE ON email_change_links
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER account_deletion_requests_reconciliation_guard_insert
BEFORE INSERT ON account_deletion_requests
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER account_deletion_requests_reconciliation_guard_update
BEFORE UPDATE ON account_deletion_requests
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER account_deletion_requests_reconciliation_guard_delete
BEFORE DELETE ON account_deletion_requests
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER canonical_words_reconciliation_guard_insert
BEFORE INSERT ON canonical_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER canonical_words_reconciliation_guard_update
BEFORE UPDATE ON canonical_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER canonical_words_reconciliation_guard_delete
BEFORE DELETE ON canonical_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_meanings_reconciliation_guard_insert
BEFORE INSERT ON word_meanings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_meanings_reconciliation_guard_update
BEFORE UPDATE ON word_meanings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_meanings_reconciliation_guard_delete
BEFORE DELETE ON word_meanings
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_examples_reconciliation_guard_insert
BEFORE INSERT ON word_examples
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_examples_reconciliation_guard_update
BEFORE UPDATE ON word_examples
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER word_examples_reconciliation_guard_delete
BEFORE DELETE ON word_examples
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER usage_notes_reconciliation_guard_insert
BEFORE INSERT ON usage_notes
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER usage_notes_reconciliation_guard_update
BEFORE UPDATE ON usage_notes
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER usage_notes_reconciliation_guard_delete
BEFORE DELETE ON usage_notes
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_situations_reconciliation_guard_insert
BEFORE INSERT ON journey_situations
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_situations_reconciliation_guard_update
BEFORE UPDATE ON journey_situations
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_situations_reconciliation_guard_delete
BEFORE DELETE ON journey_situations
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_words_reconciliation_guard_insert
BEFORE INSERT ON journey_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_words_reconciliation_guard_update
BEFORE UPDATE ON journey_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER journey_words_reconciliation_guard_delete
BEFORE DELETE ON journey_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_words_reconciliation_guard_insert
BEFORE INSERT ON user_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_words_reconciliation_guard_update
BEFORE UPDATE ON user_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER user_words_reconciliation_guard_delete
BEFORE DELETE ON user_words
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER idempotency_keys_reconciliation_guard_insert
BEFORE INSERT ON idempotency_keys
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER idempotency_keys_reconciliation_guard_update
BEFORE UPDATE ON idempotency_keys
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER idempotency_keys_reconciliation_guard_delete
BEFORE DELETE ON idempotency_keys
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER review_attempts_reconciliation_guard_insert
BEFORE INSERT ON review_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER review_attempts_reconciliation_guard_update
BEFORE UPDATE ON review_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER review_attempts_reconciliation_guard_delete
BEFORE DELETE ON review_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_mission_snapshots_reconciliation_guard_insert
BEFORE INSERT ON daily_mission_snapshots
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_mission_snapshots_reconciliation_guard_update
BEFORE UPDATE ON daily_mission_snapshots
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_mission_snapshots_reconciliation_guard_delete
BEFORE DELETE ON daily_mission_snapshots
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_activity_summaries_reconciliation_guard_insert
BEFORE INSERT ON daily_activity_summaries
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_activity_summaries_reconciliation_guard_update
BEFORE UPDATE ON daily_activity_summaries
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER daily_activity_summaries_reconciliation_guard_delete
BEFORE DELETE ON daily_activity_summaries
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER learner_sentences_reconciliation_guard_insert
BEFORE INSERT ON learner_sentences
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER learner_sentences_reconciliation_guard_update
BEFORE UPDATE ON learner_sentences
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER learner_sentences_reconciliation_guard_delete
BEFORE DELETE ON learner_sentences
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER ai_feedback_attempts_reconciliation_guard_insert
BEFORE INSERT ON ai_feedback_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER ai_feedback_attempts_reconciliation_guard_update
BEFORE UPDATE ON ai_feedback_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER ai_feedback_attempts_reconciliation_guard_delete
BEFORE DELETE ON ai_feedback_attempts
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER confidence_point_ledger_reconciliation_guard_insert
BEFORE INSERT ON confidence_point_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER confidence_point_ledger_reconciliation_guard_update
BEFORE UPDATE ON confidence_point_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER confidence_point_ledger_reconciliation_guard_delete
BEFORE DELETE ON confidence_point_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER streak_states_reconciliation_guard_insert
BEFORE INSERT ON streak_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER streak_states_reconciliation_guard_update
BEFORE UPDATE ON streak_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER streak_states_reconciliation_guard_delete
BEFORE DELETE ON streak_states
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER grace_day_ledger_reconciliation_guard_insert
BEFORE INSERT ON grace_day_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER grace_day_ledger_reconciliation_guard_update
BEFORE UPDATE ON grace_day_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;

CREATE TRIGGER grace_day_ledger_reconciliation_guard_delete
BEFORE DELETE ON grace_day_ledger
WHEN EXISTS (
  SELECT 1 FROM platform_metadata
  WHERE key = 'data_reconciliation_write_lock'
)
BEGIN
  SELECT RAISE(ABORT, 'data reconciliation write lock is active');
END;
