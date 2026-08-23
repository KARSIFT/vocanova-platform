PRAGMA foreign_keys = ON;

CREATE TABLE platform_metadata (
  key TEXT PRIMARY KEY NOT NULL
    CHECK (length(key) BETWEEN 1 AND 120),
  value_json TEXT NOT NULL
    CHECK (json_valid(value_json)),
  updated_at TEXT NOT NULL
    CHECK (updated_at GLOB '????-??-??T??:??:??.???Z')
) STRICT;

CREATE INDEX platform_metadata_updated_at_idx
  ON platform_metadata (updated_at DESC, key ASC);
