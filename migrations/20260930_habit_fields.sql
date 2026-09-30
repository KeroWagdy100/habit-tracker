BEGIN;

LOCK TABLE tracks IN ACCESS EXCLUSIVE MODE;

-- Keep the discontinued Study and Exercise checkbox values for historical reference.
CREATE TABLE IF NOT EXISTS track_legacy_habits (
  track_id INTEGER PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
  study BOOLEAN NOT NULL,
  exercise BOOLEAN NOT NULL
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'habit_3'
  ) THEN
    INSERT INTO track_legacy_habits (track_id, study, exercise)
    SELECT id, habit_3, habit_4 FROM tracks
    ON CONFLICT (track_id) DO NOTHING;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'habit_1'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'prayer'
  ) THEN
    ALTER TABLE tracks RENAME COLUMN habit_1 TO prayer;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'habit_2'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'read_bible'
  ) THEN
    ALTER TABLE tracks RENAME COLUMN habit_2 TO read_bible;
  END IF;
END $$;

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS prayer BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS read_bible BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS verse TEXT NOT NULL DEFAULT '';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS reflection TEXT NOT NULL DEFAULT '';
ALTER TABLE tracks DROP COLUMN IF EXISTS habit_3;
ALTER TABLE tracks DROP COLUMN IF EXISTS habit_4;

COMMIT;
