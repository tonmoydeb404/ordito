// ============ Backend (raw) types — match Rust serde output (snake_case) ============

export type CommandStatus = "idle" | "running" | "success" | "failed";

export type RunStatus = "running" | "success" | "failed";

export type RunMode = "background" | "foreground";

export type ScheduleMode = "once" | "recurring";

export type BackendGroup = {
  id: string;
  name: string;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type BackendCommand = {
  id: string;
  group_id: string;
  name: string;
  command: string;
  cwd: string;
  requires_confirmation: boolean;
  run_in_background: boolean;
  last_run_status: CommandStatus;
  last_run_at: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type BackendRun = {
  id: string;
  command_id: string;
  status: RunStatus;
  mode: RunMode;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  exit_code: number | null;
  output_preview: string;
  output_path: string | null;
};

export type BackendSchedule = {
  id: string;
  command_id: string;
  enabled: boolean;
  mode: ScheduleMode;
  cron_expr: string | null;
  run_at: string | null;
  label: string;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendCommandInput = {
  name: string;
  command: string;
  cwd: string;
  group_id: string;
  requires_confirmation: boolean;
  run_in_background: boolean;
  icon?: string | null;
  position?: number;
};

export type BackendGroupInput = {
  name: string;
  icon?: string | null;
  position?: number;
};

export type BackendScheduleInput = {
  command_id: string;
  mode: ScheduleMode;
  cron_expr?: string | null;
  run_at?: string | null;
  label: string;
};

// ============ View types — used by UI components ============

export type EditorMode = "create" | "edit";

export type HistoryFilter = "all" | "success" | "failed" | "running";

export type CommandItem = {
  id: string;
  name: string;
  command: string;
  cwd: string;
  groupId: string;
  requiresConfirmation: boolean;
  runInBackground: boolean;
  lastRunAt: string | null;
  icon: string | null;
  status: CommandStatus;
};

export type RunItem = {
  id: string;
  commandId: string;
  status: RunStatus;
  mode: RunMode;
  startedAt: string;
  durationMs: number | null;
  exitCode: number | null;
  outputPath: string | null;
};

export type ScheduleItem = {
  id: string;
  commandId: string;
  enabled: boolean;
  mode: ScheduleMode;
  cronExpr: string | null;
  runAt: string | null;
  label: string;
  nextRunAt: string | null;
};

export type CommandFormData = {
  name: string;
  command: string;
  cwd: string;
  group: string;
  requiresConfirmation: boolean;
  runInBackground: boolean;
  icon: string | null;
};

export type GroupItem = {
  id: string;
  name: string;
  icon: string | null;
};
