import { CommandStatus } from './command';

export interface CommandExecution {
  id: string;
  command_id: string;
  command_name: string;
  status: CommandStatus;
  output: string;
  error_output?: string;
  start_time: Date;
  end_time?: Date;
  exit_code?: number;
}