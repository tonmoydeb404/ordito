import { TCommandGroup, TCommmand, TSchedule } from "@/types/command";
import { invoke } from "@tauri-apps/api/core";

export class TauriAPI {
  // Group operations
  static async createGroup(title: string): Promise<string> {
    return await invoke("create_group", { title });
  }

  static async getGroups(): Promise<TCommandGroup[]> {
    return await invoke("get_groups");
  }

  static async deleteGroup(groupId: string): Promise<void> {
    return await invoke("delete_group", { groupId });
  }

  static async updateGroup(groupId: string, title: string): Promise<void> {
    return await invoke("update_group", { groupId, title });
  }

  // Command operations
  static async addCommandToGroup(
    groupId: string,
    data: Omit<TCommmand, "id">
  ): Promise<string> {
    const { cmd, is_detached, label } = data;
    return await invoke("add_command_to_group", {
      groupId,
      label,
      cmd,
      isDetached: is_detached,
    });
  }

  static async deleteCommandFromGroup(
    groupId: string,
    commandId: string
  ): Promise<void> {
    return await invoke("delete_command_from_group", { groupId, commandId });
  }

  static async updateCommand(
    groupId: string,
    commandId: string,
    data: Omit<TCommmand, "id">
  ): Promise<void> {
    const { cmd, is_detached, label } = data;
    return await invoke("update_command", {
      groupId,
      commandId,
      label,
      cmd,
      isDetached: is_detached,
    });
  }

  // Execution operations
  static async executeCommand(cmd: string): Promise<string> {
    return await invoke("execute_command", { cmd });
  }

  static async executeCommandDetached(cmd: string): Promise<string> {
    return await invoke("execute_command_detached", { cmd });
  }

  static async executeGroupCommands(
    groupId: string
  ): Promise<[string, string][]> {
    return await invoke("execute_group_commands", { groupId });
  }

  // Schedule operations
  static async createSchedule(data: {
    groupId: string;
    commandId: string;
    scheduledTime: string; // ISO 8601 string
    recurrence: string;
    maxExecutions?: number;
  }): Promise<string> {
    return await invoke("create_schedule", {
      groupId: data.groupId,
      commandId: data.commandId,
      scheduledTime: data.scheduledTime,
      recurrence: data.recurrence,
      maxExecutions: data.maxExecutions,
    });
  }

  static async getSchedules(): Promise<TSchedule[]> {
    return await invoke("get_schedules");
  }

  static async deleteSchedule(id: string): Promise<void> {
    return await invoke("delete_schedule", { id });
  }

  static async updateSchedule(
    id: string,
    data: {
      groupId: string;
      commandId: string;
      scheduledTime: string;
      recurrence: string;
      maxExecutions?: number;
    }
  ): Promise<void> {
    return await invoke("update_schedule", {
      id,
      groupId: data.groupId,
      commandId: data.commandId,
      scheduledTime: data.scheduledTime,
      recurrence: data.recurrence,
      maxExecutions: data.maxExecutions,
    });
  }

  static async toggleSchedule(id: string): Promise<boolean> {
    return await invoke("toggle_schedule", { id });
  }

  // Data operations
  static async exportData(): Promise<string> {
    return await invoke("export_data");
  }

  static async importData(): Promise<string> {
    return await invoke("import_data");
  }

  // Tray operations
  static async refreshTrayMenu(): Promise<void> {
    return await invoke("refresh_tray_menu");
  }

  // Startup operations
  static async isStartupEnabled(): Promise<boolean> {
    return await invoke("is_startup_enabled");
  }

  static async toggleStartup(): Promise<boolean> {
    return await invoke("toggle_startup");
  }
}
