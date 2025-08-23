import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiService } from "../../services/api";
import {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from "../../types";

export const schedulesApi = createApi({
  reducerPath: "schedulesApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Schedule", "NextExecutions"],
  endpoints: (builder) => ({
    // Schedule endpoints
    getSchedules: builder.query<Schedule[], void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getSchedules();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Schedule"],
    }),

    createSchedule: builder.mutation<Schedule, CreateScheduleRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.createSchedule(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Schedule", "NextExecutions"],
    }),

    updateSchedule: builder.mutation<Schedule, UpdateScheduleRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.updateSchedule(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Schedule", "NextExecutions"],
    }),

    deleteSchedule: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await ApiService.deleteSchedule(id);
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Schedule", "NextExecutions"],
    }),

    toggleSchedule: builder.mutation<Schedule, string>({
      queryFn: async (id) => {
        try {
          const data = await ApiService.toggleSchedule(id);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Schedule", "NextExecutions"],
    }),

    getNextScheduledExecutions: builder.query<
      Array<{ id: string; next_execution: string }>,
      number | undefined
    >({
      queryFn: async (limit) => {
        try {
          const data = await ApiService.getNextScheduledExecutions(limit);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["NextExecutions"],
    }),

    // Utility endpoints
    validateCronExpression: builder.query<boolean, string>({
      queryFn: async (expression) => {
        try {
          const data = await ApiService.validateCronExpression(expression);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useToggleScheduleMutation,
  useGetNextScheduledExecutionsQuery,
  useValidateCronExpressionQuery,
  useLazyValidateCronExpressionQuery,
} = schedulesApi;