import { invoke } from "@tauri-apps/api/core";
import {
  AppInfo,
  Command,
  CommandExecution,
  CommandGroup,
  CreateCommandRequest,
  CreateGroupRequest,
  CreateScheduleRequest,
  Schedule,
  UpdateCommandRequest,
  UpdateGroupRequest,
  UpdateScheduleRequest,
} from "../types";

export class ApiService {
  // Command operations
  static async getCommands(): Promise<Command[]> {
    return invoke("get_commands");
  }

  static async createCommand(request: CreateCommandRequest): Promise<Command> {
    return invoke("create_command", { request });
  }

  static async updateCommand(request: UpdateCommandRequest): Promise<Command> {
    return invoke("update_command", { request });
  }

  static async deleteCommand(id: string): Promise<void> {
    return invoke("delete_command", { id });
  }

  static async executeCommand(id: string, detached?: boolean): Promise<string> {
    return invoke("execute_command", { id, detached });
  }

  static async searchCommands(query: string): Promise<Command[]> {
    return invoke("search_commands", { query });
  }

  static async getFavoriteCommands(): Promise<Command[]> {
    return invoke("get_favorite_commands");
  }

  static async getCommandsByGroup(groupId?: string): Promise<Command[]> {
    return invoke("get_commands_by_group", { groupId });
  }

  // Command Group operations
  static async getCommandGroups(): Promise<CommandGroup[]> {
    return invoke("get_command_groups");
  }

  static async createCommandGroup(
    request: CreateGroupRequest
  ): Promise<CommandGroup> {
    return invoke("create_command_group", { request });
  }

  static async updateCommandGroup(
    request: UpdateGroupRequest
  ): Promise<CommandGroup> {
    return invoke("update_command_group", { request });
  }

  static async deleteCommandGroup(id: string): Promise<void> {
    return invoke("delete_command_group", { id });
  }

  static async executeCommandGroup(
    id: string,
    detached?: boolean
  ): Promise<string[]> {
    return invoke("execute_command_group", { id, detached });
  }

  // Schedule operations
  static async getSchedules(): Promise<Schedule[]> {
    return invoke("get_schedules");
  }

  static async createSchedule(
    request: CreateScheduleRequest
  ): Promise<Schedule> {
    return invoke("create_schedule", { request });
  }

  static async updateSchedule(
    request: UpdateScheduleRequest
  ): Promise<Schedule> {
    return invoke("update_schedule", { request });
  }

  static async deleteSchedule(id: string): Promise<void> {
    return invoke("delete_schedule", { id });
  }

  static async toggleSchedule(id: string): Promise<Schedule> {
    return invoke("toggle_schedule", { id });
  }

  static async getNextScheduledExecutions(
    limit?: number
  ): Promise<Array<{ id: string; next_execution: string }>> {
    return invoke("get_next_scheduled_executions", { limit });
  }

  // Execution operations
  static async getExecutionStatus(
    executionId: string
  ): Promise<CommandExecution | null> {
    return invoke("get_execution_status", { executionId });
  }

  static async getRunningExecutions(): Promise<CommandExecution[]> {
    return invoke("get_running_executions");
  }

  static async getExecutionHistory(
    limit?: number
  ): Promise<CommandExecution[]> {
    return invoke("get_execution_history", { limit });
  }

  static async killExecution(executionId: string): Promise<void> {
    return invoke("kill_execution", { executionId });
  }

  // Configuration operations
  static async importConfig(configJson: string): Promise<void> {
    return invoke("import_config", { configJson });
  }

  static async exportConfig(): Promise<string> {
    return invoke("export_config");
  }

  // Utility operations
  static async validateCronExpression(expression: string): Promise<boolean> {
    return invoke("validate_cron_expression", { expression });
  }

  static async getAppInfo(): Promise<AppInfo> {
    return invoke("get_app_info");
  }

  // Notification operations
  static async sendTestNotification(
    title: string,
    body: string
  ): Promise<void> {
    return invoke("send_test_notification", { title, body });
  }

  static async checkNotificationPermission(): Promise<boolean> {
    return invoke("check_notification_permission");
  }

  static async requestNotificationPermission(): Promise<void> {
    return invoke("request_notification_permission");
  }
}
