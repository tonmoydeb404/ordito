import { TScheduleInfo } from "@/types/schedule";

export type ScheduleContextType = {
  schedules: TScheduleInfo[];
  loading: boolean;
  error: string | null;
  refreshSchedules: () => Promise<void>;
  getScheduleById: (scheduleId: string) => TScheduleInfo | undefined;
  getSchedulesByGroupId: (groupId: string) => TScheduleInfo[];
  getSchedulesByCommandId: (
    groupId: string,
    commandId: string
  ) => TScheduleInfo[];

  // Internal methods for mutation hooks
  _setSchedules: (schedules: TScheduleInfo[]) => void;
  _addSchedule: (schedule: TScheduleInfo) => void;
  _updateSchedule: (
    scheduleId: string,
    scheduleData: Partial<TScheduleInfo>
  ) => void;
  _deleteSchedule: (scheduleId: string) => void;
  _toggleSchedule: (scheduleId: string, isActive: boolean) => void;

  // Modal
  openModal: () => void;
  closeModal: () => void;
};
