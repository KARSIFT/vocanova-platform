-- Preserve the legacy smoke-account marker during deterministic conversion.
-- The parent users table remains STRICT; the new field keeps an explicit CHECK.
ALTER TABLE users
  ADD COLUMN is_synthetic_test_account INTEGER NOT NULL DEFAULT 0
  CHECK (is_synthetic_test_account IN (0, 1));

CREATE UNIQUE INDEX users_single_synthetic_test_account_idx
  ON users (is_synthetic_test_account)
  WHERE is_synthetic_test_account = 1;
