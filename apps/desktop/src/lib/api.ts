import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type {
  BackendCommand,
  BackendCommandInput,
  BackendGroup,
  BackendGroupInput,
  BackendRun,
  BackendSchedule,
  BackendScheduleInput,
  CommandStatus,
} from "../types";

export type StatusChangedPayload = {
  command_id: string;
  last_run_status: CommandStatus;
};

export type RunCompletedPayload = {
  run: BackendRun;
  command_id: string;
  last_run_status: CommandStatus;
};

export const api = {
  listGroups: () => invoke<BackendGroup[]>("list_groups"),
  createGroup: (input: BackendGroupInput) =>
    invoke<BackendGroup>("create_group", { input }),
  updateGroup: (id: string, input: BackendGroupInput) =>
    invoke<BackendGroup>("update_group", { id, input }),
  deleteGroup: (id: string) => invoke<void>("delete_group", { id }),

  listCommands: () => invoke<BackendCommand[]>("list_commands"),
  createCommand: (input: BackendCommandInput) =>
    invoke<BackendCommand>("create_command", { input }),
  updateCommand: (id: string, input: BackendCommandInput) =>
    invoke<BackendCommand>("update_command", { id, input }),
  deleteCommand: (id: string) => invoke<void>("delete_command", { id }),

  runCommand: (id: string) => invoke<BackendRun>("run_command", { id }),
  cancelRun: (runId: string) => invoke<void>("cancel_run", { runId }),
  listRuns: (status?: string) =>
    invoke<BackendRun[]>("list_runs", { status: status ?? null }),

  listSchedules: () => invoke<BackendSchedule[]>("list_schedules"),
  createSchedule: (input: BackendScheduleInput) =>
    invoke<BackendSchedule>("create_schedule", { input }),
  updateSchedule: (id: string, input: BackendScheduleInput) =>
    invoke<BackendSchedule>("update_schedule", { id, input }),
  toggleSchedule: (id: string) =>
    invoke<BackendSchedule>("toggle_schedule", { id }),
  deleteSchedule: (id: string) => invoke<void>("delete_schedule", { id }),

  getSettings: () => invoke<Record<string, string>>("get_settings"),
  setSetting: (key: string, value: string) =>
    invoke<void>("set_setting", { key, value }),

  exportConfig: () => invoke<string>("export_config"),
  importConfig: (json: string) => invoke<void>("import_config", { json }),

  runGroup: (groupId: string) => invoke<BackendRun[]>("run_group", { groupId }),

  enableAutostart: () => invoke<void>("enable_autostart"),
  disableAutostart: () => invoke<void>("disable_autostart"),
  isAutostartEnabled: () => invoke<boolean>("is_autostart_enabled"),
};

export function onStatusChanged(
  callback: (payload: StatusChangedPayload) => void,
): Promise<UnlistenFn> {
  return listen<StatusChangedPayload>("command://status-changed", (event) =>
    callback(event.payload),
  );
}

export function onRunCompleted(
  callback: (payload: RunCompletedPayload) => void,
): Promise<UnlistenFn> {
  return listen<RunCompletedPayload>("run://completed", (event) =>
    callback(event.payload),
  );
}
