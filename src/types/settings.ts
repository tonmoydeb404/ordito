export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  auto_save: boolean;
  show_execution_time: boolean;
  default_shell: string;
  enable_notifications: boolean;
  max_output_lines: number;
  command_timeout: number;
}