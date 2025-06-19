import { TSchedule } from "@/types/command";

export type ScheduleContextType = {
  schedules: TSchedule[];
  loading: boolean;
  error: string | null;
  refreshSchedules: () => Promise<void>;
  getScheduleById: (scheduleId: string) => TSchedule | undefined;
  getSchedulesByGroupId: (groupId: string) => TSchedule[];
  getSchedulesByCommandId: (groupId: string, commandId: string) => TSchedule[];

  // Internal methods for mutation hooks
  _setSchedules: (schedules: TSchedule[]) => void;
  _addSchedule: (schedule: TSchedule) => void;
  _updateSchedule: (
    scheduleId: string,
    scheduleData: Partial<TSchedule>
  ) => void;
  _deleteSchedule: (scheduleId: string) => void;
  _toggleSchedule: (scheduleId: string, isActive: boolean) => void;
};
