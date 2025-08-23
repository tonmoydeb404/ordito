import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiService } from "../../services/api";
import {
  Command,
  CommandGroup,
  CreateCommandRequest,
  CreateGroupRequest,
  UpdateCommandRequest,
  UpdateGroupRequest,
} from "../../types";

export const commandsApi = createApi({
  reducerPath: "commandsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Command", "CommandGroup"],
  endpoints: (builder) => ({
    // Command endpoints
    getCommands: builder.query<Command[], void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getCommands();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Command"],
    }),

    createCommand: builder.mutation<Command, CreateCommandRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.createCommand(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Command"],
    }),

    updateCommand: builder.mutation<Command, UpdateCommandRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.updateCommand(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Command"],
    }),

    deleteCommand: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await ApiService.deleteCommand(id);
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Command"],
    }),

    executeCommand: builder.mutation<
      string,
      { id: string; detached?: boolean }
    >({
      queryFn: async ({ id, detached }) => {
        try {
          const data = await ApiService.executeCommand(id, detached);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Command"],
    }),

    searchCommands: builder.query<Command[], string>({
      queryFn: async (query) => {
        try {
          const data = await ApiService.searchCommands(query);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Command"],
    }),

    getFavoriteCommands: builder.query<Command[], void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getFavoriteCommands();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Command"],
    }),

    getCommandsByGroup: builder.query<Command[], string | undefined>({
      queryFn: async (groupId) => {
        try {
          const data = await ApiService.getCommandsByGroup(groupId);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Command"],
    }),

    // Command Group endpoints
    getCommandGroups: builder.query<CommandGroup[], void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getCommandGroups();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["CommandGroup"],
    }),

    createCommandGroup: builder.mutation<CommandGroup, CreateGroupRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.createCommandGroup(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["CommandGroup"],
    }),

    updateCommandGroup: builder.mutation<CommandGroup, UpdateGroupRequest>({
      queryFn: async (request) => {
        try {
          const data = await ApiService.updateCommandGroup(request);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["CommandGroup"],
    }),

    deleteCommandGroup: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await ApiService.deleteCommandGroup(id);
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["CommandGroup"],
    }),

    executeCommandGroup: builder.mutation<
      string[],
      { id: string; detached?: boolean }
    >({
      queryFn: async ({ id, detached }) => {
        try {
          const data = await ApiService.executeCommandGroup(id, detached);
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
    }),
  }),
});

export const {
  useGetCommandsQuery,
  useCreateCommandMutation,
  useUpdateCommandMutation,
  useDeleteCommandMutation,
  useExecuteCommandMutation,
  useSearchCommandsQuery,
  useGetFavoriteCommandsQuery,
  useGetCommandsByGroupQuery,
  useGetCommandGroupsQuery,
  useCreateCommandGroupMutation,
  useUpdateCommandGroupMutation,
  useDeleteCommandGroupMutation,
  useExecuteCommandGroupMutation,
} = commandsApi;
