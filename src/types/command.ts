export type TCommandGroup = {
  id: string; // uuid
  title: string;
  commands: TCommmand[];
};

export type TCommmand = {
  id: string; // uuid
  label: string;
  cmd: string;
  is_detached?: boolean;
};

export interface TSchedule {
  id: string;
  group_id: string;
  command_id: string | null;
  scheduled_time: string; // ISO 8601 string
  recurrence: "once" | "daily" | "weekly" | "monthly" | string; // string for custom:X
  is_active: boolean;
  created_at: string;
  last_execution?: string;
  next_execution: string;
  execution_count: number;
  max_executions?: number;
}
