export interface TSchedule {
  id: string;
  group_id: string;
  command_id: string | null;
  cron_expression: string; // Cron expression like "0 9 * * *"
  is_active: boolean;
  created_at: string;
  last_execution?: string;
  next_execution: string;
  execution_count: number;
  max_executions?: number;
}

// Enhanced schedule info returned by get_schedules_with_info
export interface TScheduleInfo {
  id: string;
  display_name: string; // Human-readable name like "Group: Build Tools (0 9 * * *)"
  schedule_type: "group" | "command";
  group_id: string;
  command_id: string | null;
  cron_expression: string;
  is_active: boolean;
  next_execution: string;
  last_execution?: string;
  execution_count: number;
  max_executions?: number;
}

// Cron validation result
export interface TCronValidationResult {
  is_valid: boolean;
  error_message?: string;
  next_executions: string[]; // Array of ISO 8601 datetime strings
}

// Cron preset for UI convenience
export interface TCronPreset {
  name: string;
  expression: string;
}
