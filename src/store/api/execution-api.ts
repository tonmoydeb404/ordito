/**
 * RTK Query API for Command Execution
 * Handles executing and cancelling commands
 */

import { baseApi, tauriBaseQuery } from "./base-api";

export const executionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // MUTATIONS
    // ========================================================================

    /**
     * Execute a command
     * Returns the log UUID for tracking the execution
     */
    executeCommand: builder.mutation<string, string>({
      queryFn: async (commandId) =>
        tauriBaseQuery<string>({
          command: "execute_command",
          args: { commandId },
        }),
      // Invalidate logs list to show new running execution
      invalidatesTags: [
        { type: "Logs", id: "LIST" },
        { type: "Logs", id: "RUNNING" },
      ],
    }),

    /**
     * Cancel a running execution
     */
    cancelExecution: builder.mutation<void, string>({
      queryFn: async (logId) =>
        tauriBaseQuery<void>({
          command: "cancel_execution",
          args: { logId },
        }),
      // Invalidate the specific log and running logs list
      invalidatesTags: (_result, _error, logId) => [
        { type: "Logs", id: logId },
        { type: "Logs", id: "RUNNING" },
        { type: "Logs", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const { useExecuteCommandMutation, useCancelExecutionMutation } =
  executionApi;
