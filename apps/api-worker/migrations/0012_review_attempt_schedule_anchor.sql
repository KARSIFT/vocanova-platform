ALTER TABLE review_attempts
  ADD COLUMN schedule_anchor_at TEXT
  CHECK (
    schedule_anchor_at IS NULL
    OR (
      length(schedule_anchor_at) = 24
      AND substr(schedule_anchor_at, 5, 1) = '-'
      AND substr(schedule_anchor_at, 8, 1) = '-'
      AND substr(schedule_anchor_at, 11, 1) = 'T'
      AND substr(schedule_anchor_at, 14, 1) = ':'
      AND substr(schedule_anchor_at, 17, 1) = ':'
      AND substr(schedule_anchor_at, 20, 1) = '.'
      AND substr(schedule_anchor_at, 24, 1) = 'Z'
      AND (
        substr(schedule_anchor_at, 1, 4)
        || substr(schedule_anchor_at, 6, 2)
        || substr(schedule_anchor_at, 9, 2)
        || substr(schedule_anchor_at, 12, 2)
        || substr(schedule_anchor_at, 15, 2)
        || substr(schedule_anchor_at, 18, 2)
        || substr(schedule_anchor_at, 21, 3)
      ) NOT GLOB '*[^0-9]*'
      AND CAST(substr(schedule_anchor_at, 12, 2) AS INTEGER) BETWEEN 0 AND 23
      AND CAST(substr(schedule_anchor_at, 15, 2) AS INTEGER) BETWEEN 0 AND 59
      AND CAST(substr(schedule_anchor_at, 18, 2) AS INTEGER) BETWEEN 0 AND 59
      AND strftime('%Y-%m-%dT%H:%M:%fZ', schedule_anchor_at) IS NOT NULL
      AND strftime('%Y-%m-%dT%H:%M:%fZ', schedule_anchor_at) = schedule_anchor_at
    )
  );
