-- Reserve each saved-word scheduler transition before writing its derived state.
-- This D1-only runtime table leaves converted source-table schemas unchanged.
-- A concurrent submission that read the same version fails atomically and retries
-- from committed state instead of overwriting counters or next_review_at.

CREATE TABLE review_state_reservations (
  user_word_id TEXT NOT NULL REFERENCES user_words(id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL CHECK (state_version >= 0),
  created_at TEXT NOT NULL CHECK (datetime(created_at) IS NOT NULL),
  PRIMARY KEY (user_word_id, state_version)
) STRICT;
