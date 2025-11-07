/**
 * TypeScript type definitions for Ordito API
 * Matches Tauri backend command signatures
 */

// ============================================================================
// COMMAND TYPES
// ============================================================================

export interface CreateCommandDto {
  command_group_id: string;
  title: string;
  value: string;
  working_dir: string;
  timeout?: number;
  run_in_background: boolean;
  env_vars: string; // JSON string
}

export interface UpdateCommandDto {
  id: string;
  command_group_id: string;
  title: string;
  value: string;
  working_dir: string;
  timeout?: number;
  run_in_background: boolean;
  is_favourite: boolean;
  env_vars: string; // JSON string
}

export interface CommandResponse {
  id: string;
  command_group_id: string;
  title: string;
  value: string;
  working_dir: string;
  timeout?: number;
  run_in_background: boolean;
  is_favourite: boolean;
  env_vars: string; // JSON string
  created_at: string; // RFC3339 timestamp
  updated_at: string; // RFC3339 timestamp
}

// ============================================================================
// GROUP TYPES
// ============================================================================

export interface CreateGroupDto {
  title: string;
  parent_id?: string;
}

export interface UpdateGroupDto {
  id: string;
  title: string;
  parent_id?: string;
}

export interface GroupResponse {
  id: string;
  title: string;
  parent_id?: string;
  created_at: string; // RFC3339 timestamp
  updated_at: string; // RFC3339 timestamp
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface CreateScheduleDto {
  command_id: string;
  cron_expression: string;
  show_notification: boolean;
}

export interface UpdateScheduleDto {
  id: string;
  command_id: string;
  cron_expression: string;
  show_notification: boolean;
}

export interface ScheduleResponse {
  id: string;
  command_id: string;
  cron_expression: string;
  show_notification: boolean;
  created_at: string; // RFC3339 timestamp
  updated_at: string; // RFC3339 timestamp
}

// ============================================================================
// LOG TYPES
// ============================================================================

export type LogStatus =
  | "success"
  | "failed"
  | "timeout"
  | "cancelled"
  | "running";

export interface LogResponse {
  id: string;
  command_id: string;
  command_schedule_id?: string;
  status: LogStatus;
  exit_code?: number;
  output?: string;
  working_dir: string;
  run_in_background: boolean;
  timeout?: number;
  env_vars: string; // JSON string
  started_at: string; // RFC3339 timestamp
  finished_at?: string; // RFC3339 timestamp (null if running)
}

export interface LogStats {
  success: number;
  failed: number;
  timeout: number;
  cancelled: number;
  running: number;
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface ListCommandsParams {
  group_id?: string;
}

export interface SearchCommandsParams {
  query: string;
}

export interface ListSchedulesParams {
  command_id?: string;
}

export interface ListLogsParams {
  command_id?: string;
  status?: LogStatus;
}

export interface CleanupLogsParams {
  days: number;
}
