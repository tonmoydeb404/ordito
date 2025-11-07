/**
 * Central export point for all RTK Query APIs
 * Re-exports all hooks and endpoints for easy importing throughout the app
 */

// Export base API
export { baseApi } from "./base-api";

// Export all hooks from Commands API
export {
  useCreateCommandMutation,
  useDeleteCommandMutation,
  useGetCommandQuery,
  useGetFavouritesQuery,
  useListCommandsQuery,
  useSearchCommandsQuery,
  useToggleFavouriteMutation,
  useUpdateCommandMutation,
} from "./commands-api";

// Export all hooks from Groups API
export {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useGetChildrenQuery,
  useGetGroupQuery,
  useGetRootGroupsQuery,
  useListGroupsQuery,
  useUpdateGroupMutation,
} from "./groups-api";

// Export all hooks from Schedules API
export {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useGetScheduleQuery,
  useListSchedulesQuery,
  useToggleNotificationMutation,
  useUpdateScheduleMutation,
} from "./schedules-api";

// Export all hooks from Execution API
export {
  useCancelExecutionMutation,
  useExecuteCommandMutation,
} from "./execution-api";

// Export all hooks from Logs API
export {
  useCleanupOldLogsMutation,
  useGetLogQuery,
  useGetLogStatsQuery,
  useGetRunningLogsQuery,
  useListLogsQuery,
} from "./logs-api";
