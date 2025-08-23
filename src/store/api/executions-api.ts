import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiService } from "../../services/api";
import { CommandExecution } from "../../types";

export const executionsApi = createApi({
  reducerPath: "executionsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["RunningExecutions", "ExecutionHistory", "ExecutionStatus"],
  endpoints: (builder) => ({
    // Execution endpoints
    getRunningExecutions: builder.query<CommandExecution[], void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getRunningExecutions();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["RunningExecutions"],
      // Enable polling for running executions
      keepUnusedDataFor: 0, // Don't cache stale data
    }),

    getExecutionHistory: builder.query<CommandExecution[], number | undefined>({
      queryFn: async (limit) => {
        try {
          const data = await ApiService.getExecutionHistory(limit);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["ExecutionHistory"],
    }),

    getExecutionStatus: builder.query<CommandExecution | null, string>({
      queryFn: async (executionId) => {
        try {
          const data = await ApiService.getExecutionStatus(executionId);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: (result, error, executionId) => [
        { type: "ExecutionStatus", id: executionId },
      ],
    }),

    killExecution: builder.mutation<void, string>({
      queryFn: async (executionId) => {
        try {
          await ApiService.killExecution(executionId);
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: (result, error, executionId) => [
        "RunningExecutions",
        "ExecutionHistory",
        { type: "ExecutionStatus", id: executionId },
      ],
    }),
  }),
});

export const {
  useGetRunningExecutionsQuery,
  useGetExecutionHistoryQuery,
  useGetExecutionStatusQuery,
  useLazyGetExecutionStatusQuery,
  useKillExecutionMutation,
} = executionsApi;