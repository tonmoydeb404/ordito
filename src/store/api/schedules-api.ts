/**
 * RTK Query API for Schedule Management
 * Handles cron-based scheduling and notifications
 */

import type {
  CreateScheduleDto,
  ListSchedulesParams,
  ScheduleResponse,
  UpdateScheduleDto,
} from "../types";
import { baseApi, tauriBaseQuery } from "./base-api";

export const schedulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get a single schedule by ID
     */
    getSchedule: builder.query<ScheduleResponse | null, string>({
      queryFn: async (id) =>
        tauriBaseQuery<ScheduleResponse | null>({
          command: "get_schedule",
          args: { id },
        }),
      providesTags: (result, _error, id) =>
        result ? [{ type: "Schedules", id }] : [],
    }),

    /**
     * List all schedules, optionally filtered by command
     */
    listSchedules: builder.query<
      ScheduleResponse[],
      ListSchedulesParams | void
    >({
      queryFn: async (params) =>
        tauriBaseQuery<ScheduleResponse[]>({
          command: "list_schedules",
          args: { commandId: params?.command_id },
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Schedules" as const, id })),
              { type: "Schedules", id: "LIST" },
            ]
          : [{ type: "Schedules", id: "LIST" }],
    }),

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    /**
     * Create a new schedule
     * Returns the UUID of the created schedule
     */
    createSchedule: builder.mutation<string, CreateScheduleDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<string>({
          command: "create_schedule",
          args: { dto },
        }),
      invalidatesTags: [{ type: "Schedules", id: "LIST" }],
    }),

    /**
     * Update an existing schedule
     */
    updateSchedule: builder.mutation<void, UpdateScheduleDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<void>({
          command: "update_schedule",
          args: { dto },
        }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Schedules", id },
        { type: "Schedules", id: "LIST" },
      ],
    }),

    /**
     * Delete a schedule
     */
    deleteSchedule: builder.mutation<void, string>({
      queryFn: async (id) =>
        tauriBaseQuery<void>({
          command: "delete_schedule",
          args: { id },
        }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Schedules", id },
        { type: "Schedules", id: "LIST" },
      ],
    }),

    /**
     * Toggle notification setting for a schedule
     * Optimistically updates the cache
     */
    toggleNotification: builder.mutation<void, string>({
      queryFn: async (id) =>
        tauriBaseQuery<void>({
          command: "toggle_notification",
          args: { id },
        }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          schedulesApi.util.updateQueryData("getSchedule", id, (draft) => {
            if (draft) {
              draft.show_notification = !draft.show_notification;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: "Schedules", id },
        { type: "Schedules", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetScheduleQuery,
  useListSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useToggleNotificationMutation,
} = schedulesApi;
