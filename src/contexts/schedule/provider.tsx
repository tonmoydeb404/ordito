import { TauriAPI } from "@/lib/tauri";
import { TSchedule } from "@/types/command";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ScheduleContext } from ".";
import { ScheduleContextType } from "./type";

interface Props {
  children: ReactNode;
}

const ScheduleProvider = ({ children }: Props) => {
  const [schedules, setSchedules] = useState<TSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSchedules = await TauriAPI.getSchedules();
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
  const _addSchedule = useCallback((schedule: TSchedule) => {
    setSchedules((prev) => [...prev, schedule]);
  }, []);

  const _updateSchedule = useCallback(
    (scheduleId: string, scheduleData: Partial<TSchedule>) => {
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
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};

export default ScheduleProvider;
