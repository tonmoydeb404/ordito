import ListSchedulesModal from "@/components/modals/schedule/schedule-list";
import { useModal } from "@/hooks/use-modal";
import { TauriAPI } from "@/lib/tauri";
import { TScheduleInfo } from "@/types/schedule";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ScheduleContext } from ".";
import { ScheduleContextType } from "./type";

interface Props {
  children: ReactNode;
}

const ScheduleProvider = ({ children }: Props) => {
  const [schedules, setSchedules] = useState<TScheduleInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modal = useModal<void>();

  const refreshSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSchedules = await TauriAPI.getSchedulesWithInfo();
      console.log(fetchedSchedules);

      setSchedules(fetchedSchedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  const getScheduleById = useCallback(
    (scheduleId: string) => {
      return schedules.find((schedule) => schedule.id === scheduleId);
    },
    [schedules]
  );

  const getSchedulesByGroupId = useCallback(
    (groupId: string) => {
      return schedules.filter((schedule) => schedule.group_id === groupId);
    },
    [schedules]
  );

  const getSchedulesByCommandId = useCallback(
    (groupId: string, commandId: string) => {
      return schedules.filter(
        (schedule) =>
          schedule.group_id === groupId && schedule.command_id === commandId
      );
    },
    [schedules]
  );

  // Internal methods for mutation hooks to update context directly
  const _addSchedule = useCallback((schedule: TScheduleInfo) => {
    setSchedules((prev) => [...prev, schedule]);
  }, []);

  const _updateSchedule = useCallback(
    (scheduleId: string, scheduleData: Partial<TScheduleInfo>) => {
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, ...scheduleData }
            : schedule
        )
      );
    },
    []
  );

  const _deleteSchedule = useCallback((scheduleId: string) => {
    setSchedules((prev) =>
      prev.filter((schedule) => schedule.id !== scheduleId)
    );
  }, []);

  const _toggleSchedule = useCallback(
    (scheduleId: string, isActive: boolean) => {
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, is_active: isActive }
            : schedule
        )
      );
    },
    []
  );

  // Load schedules on mount
  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  const contextValue: ScheduleContextType = {
    schedules,
    loading,
    error,
    refreshSchedules,
    getScheduleById,
    getSchedulesByGroupId,
    getSchedulesByCommandId,
    _setSchedules: setSchedules,
    _addSchedule,
    _updateSchedule,
    _deleteSchedule,
    _toggleSchedule,
    closeModal: modal.close,
    openModal: modal.open,
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
      <ListSchedulesModal {...modal} />
    </ScheduleContext.Provider>
  );
};

export default ScheduleProvider;
