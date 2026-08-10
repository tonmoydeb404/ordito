PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS command_groups (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commands (
  id                    TEXT PRIMARY KEY,
  group_id              TEXT NOT NULL
    REFERENCES command_groups(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  command               TEXT NOT NULL,
  cwd                   TEXT NOT NULL DEFAULT '',
  requires_confirmation INTEGER NOT NULL DEFAULT 0,
  run_in_background     INTEGER NOT NULL DEFAULT 1,
  last_run_status       TEXT NOT NULL DEFAULT 'idle'
    CHECK(last_run_status IN ('idle','running','success','failed')),
  last_run_at           TEXT,
  position              INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id             TEXT PRIMARY KEY,
  command_id     TEXT NOT NULL
    REFERENCES commands(id) ON DELETE CASCADE,
  status         TEXT NOT NULL
    CHECK(status IN ('running','success','failed')),
  mode           TEXT NOT NULL
    CHECK(mode IN ('background','foreground')),
  started_at     TEXT NOT NULL,
  finished_at    TEXT,
  duration_ms    INTEGER,
  exit_code      INTEGER,
  output_preview TEXT NOT NULL DEFAULT '',
  output_path    TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  id           TEXT PRIMARY KEY,
  command_id   TEXT NOT NULL
    REFERENCES commands(id) ON DELETE CASCADE,
  enabled      INTEGER NOT NULL DEFAULT 1,
  mode         TEXT NOT NULL
    CHECK(mode IN ('once','recurring')),
  cron_expr    TEXT,
  run_at       TEXT,
  label        TEXT NOT NULL,
  next_run_at  TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  CHECK(
    (mode = 'once'      AND run_at IS NOT NULL AND cron_expr IS NULL) OR
    (mode = 'recurring' AND cron_expr IS NOT NULL AND run_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_commands_group    ON commands(group_id, position);
CREATE INDEX IF NOT EXISTS idx_runs_command       ON runs(command_id);
CREATE INDEX IF NOT EXISTS idx_runs_started       ON runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_command  ON schedules(command_id);
CREATE INDEX IF NOT EXISTS idx_schedules_enabled  ON schedules(enabled) WHERE enabled = 1;
