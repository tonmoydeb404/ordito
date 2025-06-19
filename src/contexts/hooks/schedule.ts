import { useScheduleContext } from "@/contexts/schedule";
import { TauriAPI } from "@/lib/tauri";
import { TCronValidationResult, TSchedule } from "@/types/schedule";
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
      scheduleData: {
        cron_expression: string;
        max_executions?: number;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const scheduleId = await TauriAPI.createSchedule({
          groupId,
          commandId,
          cronExpression: scheduleData.cron_expression,
          maxExecutions: scheduleData.max_executions,
        });
        _addSchedule({
          id: scheduleId,
          group_id: groupId,
          command_id: commandId,
          cron_expression: scheduleData.cron_expression,
          max_executions: scheduleData.max_executions,
          is_active: true,
          created_at: new Date().toISOString(),
          next_execution: new Date().toISOString(), // Will be calculated by backend
          execution_count: 0,
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
          cronExpression: data.cron_expression!,
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

  // NEW: Validate cron expression
  const validateCronExpression = useCallback(
    async (cronExpression: string): Promise<TCronValidationResult> => {
      try {
        return await TauriAPI.validateCronExpression(cronExpression);
      } catch (err) {
        return {
          is_valid: false,
          error_message:
            err instanceof Error ? err.message : "Validation failed",
          next_executions: [],
        };
      }
    },
    []
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
    validateCronExpression, // NEW
    clearError,
  };
}
