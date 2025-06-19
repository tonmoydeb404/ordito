import { useScheduleContext } from "@/contexts/schedule";
import { TauriAPI } from "@/lib/tauri";
import { TSchedule } from "@/types/command";
import { useCallback, useState } from "react";

export function useScheduleMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _addSchedule, _updateSchedule, _deleteSchedule, _toggleSchedule } =
    useScheduleContext();

  const addSchedule = useCallback(
    async (
      groupId: string,
      commandId: string | null,
      scheduleData: Omit<
        TSchedule,
        | "id"
        | "group_id"
        | "command_id"
        | "is_active"
        | "created_at"
        | "last_execution"
        | "next_execution"
        | "execution_count"
      >
    ) => {
      try {
        setLoading(true);
        setError(null);
        const scheduleId = await TauriAPI.createSchedule({
          groupId,
          commandId,
          scheduledTime: scheduleData.scheduled_time,
          recurrence: scheduleData.recurrence,
          maxExecutions: scheduleData.max_executions,
        });
        _addSchedule({
          id: scheduleId,
          group_id: groupId,
          command_id: commandId,
          scheduled_time: scheduleData.scheduled_time,
          recurrence: scheduleData.recurrence,
          max_executions: scheduleData.max_executions,
          is_active: true,
        } as TSchedule);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add schedule");
      } finally {
        setLoading(false);
      }
    },
    [_addSchedule]
  );

  const updateSchedule = useCallback(
    async (scheduleId: string, data: Partial<Omit<TSchedule, "id">>) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.updateSchedule(scheduleId, {
          groupId: data.group_id!,
          commandId: data.command_id!,
          scheduledTime: data.scheduled_time!,
          recurrence: data.recurrence!,
          maxExecutions: data.max_executions,
        });
        _updateSchedule(scheduleId, data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update schedule"
        );
      } finally {
        setLoading(false);
      }
    },
    [_updateSchedule]
  );

  const deleteSchedule = useCallback(
    async (scheduleId: string) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.deleteSchedule(scheduleId);
        _deleteSchedule(scheduleId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete schedule"
        );
      } finally {
        setLoading(false);
      }
    },
    [_deleteSchedule]
  );

  const toggleSchedule = useCallback(
    async (scheduleId: string) => {
      try {
        setLoading(true);
        setError(null);
        const isActive = await TauriAPI.toggleSchedule(scheduleId);
        _toggleSchedule(scheduleId, isActive);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to toggle schedule"
        );
      } finally {
        setLoading(false);
      }
    },
    [_toggleSchedule]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    clearError,
  };
}
