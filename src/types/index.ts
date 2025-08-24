export interface EnvironmentVariable {
  key: string;
  value: string;
}

export interface Command {
  id: string;
  name: string;
  command: string;
  working_directory?: string;
  environment_variables: EnvironmentVariable[];
  group_id?: string;
  created_at: string;
  updated_at: string;
  last_executed?: string;
  execution_count: number;
  is_favorite: boolean;
  tags: string[];
}

export interface CommandGroup {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface CommandGroupWithCount {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  commands_count: number;
}

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  cron_expression: string;
  command_id?: string;
  group_id?: string;
  is_enabled: boolean;
  max_executions?: number;
  execution_count: number;
  created_at: string;
  updated_at: string;
  last_executed?: string;
  next_execution?: string;
}

export interface CommandExecution {
  id: string;
  command_id: string;
  started_at: string;
  finished_at?: string;
  exit_code?: number;
  stdout: string;
  stderr: string;
  is_running: boolean;
}

export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
  System = 'System',
}

export enum LogLevel {
  Error = 'Error',
  Warn = 'Warn',
  Info = 'Info',
  Debug = 'Debug',
  Trace = 'Trace',
}

export interface NotificationSettings {
  schedule_success: boolean;
  schedule_failure: boolean;
  schedule_warnings: boolean;
  execution_success: boolean;
  execution_failure: boolean;
  system_alerts: boolean;
}

export interface AppSettings {
  auto_start: boolean;
  minimize_to_tray: boolean;
  show_notifications: boolean;
  notification_settings: NotificationSettings;
  theme: Theme;
  log_level: LogLevel;
}

export interface AppConfig {
  commands: Command[];
  groups: CommandGroup[];
  schedules: Schedule[];
  settings: AppSettings;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface AppInfo {
  version: string;
  name: string;
  description: string;
}

// Request types
export interface CreateCommandRequest {
  name: string;
  command: string;
  working_directory?: string;
  environment_variables: EnvironmentVariable[];
  group_id?: string;
  tags: string[];
}

export interface UpdateCommandRequest {
  id: string;
  name?: string;
  command?: string;
  working_directory?: string;
  environment_variables?: EnvironmentVariable[];
  group_id?: string;
  is_favorite?: boolean;
  tags?: string[];
}

export interface CreateGroupRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateGroupRequest {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  is_favorite?: boolean;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  cron_expression: string;
  command_id?: string;
  group_id?: string;
  max_executions?: number;
}

export interface UpdateScheduleRequest {
  id: string;
  name?: string;
  description?: string;
  cron_expression?: string;
  command_id?: string;
  group_id?: string;
  is_enabled?: boolean;
  max_executions?: number;
}

// Store state types
export interface CommandsState {
  commands: Command[];
  groups: CommandGroup[];
  selectedCommand?: Command;
  selectedGroup?: CommandGroup;
  searchQuery: string;
  isLoading: boolean;
  error?: string;
}

export interface SchedulesState {
  schedules: Schedule[];
  selectedSchedule?: Schedule;
  nextExecutions: Array<{ id: string; next_execution: string }>;
  isLoading: boolean;
  error?: string;
}

export interface ExecutionsState {
  runningExecutions: CommandExecution[];
  executionHistory: CommandExecution[];
  selectedExecution?: CommandExecution;
  isLoading: boolean;
  error?: string;
}

export interface AppState {
  config: AppConfig;
  settings: AppSettings;
  appInfo?: AppInfo;
  isLoading: boolean;
  error?: string;
}