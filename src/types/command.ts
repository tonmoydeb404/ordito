export interface Command {
  id: string;
  name: string;
  description?: string;
  script: string;
  folder_path: string;
  status: CommandStatus;
  created_at: Date;
  updated_at: Date;
  last_executed?: Date;
  execution_count: number;
  tags?: string[];
}

export enum CommandStatus {
  IDLE = "idle",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed"
}

export type CreateCommandInput = Omit<Command, 'id' | 'created_at' | 'updated_at' | 'status' | 'execution_count'>;