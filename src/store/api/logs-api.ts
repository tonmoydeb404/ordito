/**
 * RTK Query API for Execution Logs
 * Handles log retrieval, filtering, cleanup, and statistics
 */

import type {
  CleanupLogsParams,
  ListLogsParams,
  LogResponse,
  LogStats,
} from "../types";
import { baseApi, tauriBaseQuery } from "./base-api";

export const logsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get a single log by ID
     * Enable polling for running executions to get real-time updates
     */
    getLog: builder.query<LogResponse | null, string>({
      queryFn: async (id) =>
        tauriBaseQuery<LogResponse | null>({
          command: "get_log",
          args: { id },
        }),
      providesTags: (result, _error, id) =>
        result ? [{ type: "Logs", id }] : [],
    }),

    /**
     * List logs with optional filtering by command and status
     */
    listLogs: builder.query<LogResponse[], ListLogsParams | void>({
      queryFn: async (params) =>
        tauriBaseQuery<LogResponse[]>({
          command: "list_logs",
          args: {
            commandId: params?.command_id,
            status: params?.status,
          },
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Logs" as const, id })),
              { type: "Logs", id: "LIST" },
            ]
          : [{ type: "Logs", id: "LIST" }],
    }),

    /**
     * Get all currently running executions
     * Useful for polling active command status
     */
    getRunningLogs: builder.query<LogResponse[], void>({
      queryFn: async () =>
        tauriBaseQuery<LogResponse[]>({
          command: "get_running_logs",
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Logs" as const, id })),
              { type: "Logs", id: "RUNNING" },
            ]
          : [{ type: "Logs", id: "RUNNING" }],
    }),

    /**
     * Get execution statistics grouped by status
     * Returns count of logs for each status (success, failed, etc.)
     */
    getLogStats: builder.query<LogStats, void>({
      queryFn: async () =>
        tauriBaseQuery<LogStats>({
          command: "get_log_stats",
        }),
      providesTags: [{ type: "Logs", id: "STATS" }],
    }),

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    /**
     * Cleanup old logs (delete logs older than N days)
     * Returns the number of logs deleted
     */
    cleanupOldLogs: builder.mutation<number, CleanupLogsParams>({
      queryFn: async ({ days }) =>
        tauriBaseQuery<number>({
          command: "cleanup_old_logs",
          args: { days },
        }),
      invalidatesTags: [
        { type: "Logs", id: "LIST" },
        { type: "Logs", id: "STATS" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetLogQuery,
  useListLogsQuery,
  useGetRunningLogsQuery,
  useGetLogStatsQuery,
  useCleanupOldLogsMutation,
} = logsApi;
