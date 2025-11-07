/**
 * RTK Query API for Command Management
 * Handles CRUD operations, search, and favorites
 */

import type {
  CommandResponse,
  CreateCommandDto,
  ListCommandsParams,
  SearchCommandsParams,
  UpdateCommandDto,
} from "../types";
import { baseApi, tauriBaseQuery } from "./base-api";

export const commandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get a single command by ID
     */
    getCommand: builder.query<CommandResponse | null, string>({
      queryFn: async (id) =>
        tauriBaseQuery<CommandResponse | null>({
          command: "get_command",
          args: { id },
        }),
      providesTags: (result, _error, id) =>
        result ? [{ type: "Commands", id }] : [],
    }),

    /**
     * List all commands, optionally filtered by group
     */
    listCommands: builder.query<CommandResponse[], ListCommandsParams | void>({
      queryFn: async (params) =>
        tauriBaseQuery<CommandResponse[]>({
          command: "list_commands",
          args: { group_id: params?.group_id },
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Commands" as const, id })),
              { type: "Commands", id: "LIST" },
            ]
          : [{ type: "Commands", id: "LIST" }],
    }),

    /**
     * Search commands by title
     */
    searchCommands: builder.query<CommandResponse[], SearchCommandsParams>({
      queryFn: async ({ query }) =>
        tauriBaseQuery<CommandResponse[]>({
          command: "search_commands",
          args: { query },
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Commands" as const, id })),
              { type: "Commands", id: "SEARCH" },
            ]
          : [{ type: "Commands", id: "SEARCH" }],
    }),

    /**
     * Get all favorite commands
     */
    getFavourites: builder.query<CommandResponse[], void>({
      queryFn: async () =>
        tauriBaseQuery<CommandResponse[]>({
          command: "get_favourites",
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Commands" as const, id })),
              { type: "Commands", id: "FAVOURITES" },
            ]
          : [{ type: "Commands", id: "FAVOURITES" }],
    }),

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    /**
     * Create a new command
     * Returns the UUID of the created command
     */
    createCommand: builder.mutation<string, CreateCommandDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<string>({
          command: "create_command",
          args: { dto },
        }),
      invalidatesTags: [
        { type: "Commands", id: "LIST" },
        { type: "Commands", id: "SEARCH" },
      ],
    }),

    /**
     * Update an existing command
     */
    updateCommand: builder.mutation<void, UpdateCommandDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<void>({
          command: "update_command",
          args: { dto },
        }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Commands", id },
        { type: "Commands", id: "LIST" },
        { type: "Commands", id: "SEARCH" },
        { type: "Commands", id: "FAVOURITES" },
      ],
    }),

    /**
     * Delete a command
     */
    deleteCommand: builder.mutation<void, string>({
      queryFn: async (id) =>
        tauriBaseQuery<void>({
          command: "delete_command",
          args: { id },
        }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Commands", id },
        { type: "Commands", id: "LIST" },
        { type: "Commands", id: "SEARCH" },
        { type: "Commands", id: "FAVOURITES" },
      ],
    }),

    /**
     * Toggle favorite status of a command
     * Optimistically updates the cache
     */
    toggleFavourite: builder.mutation<void, string>({
      queryFn: async (id) =>
        tauriBaseQuery<void>({
          command: "toggle_favourite",
          args: { id },
        }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commandsApi.util.updateQueryData("getCommand", id, (draft) => {
            if (draft) {
              draft.is_favourite = !draft.is_favourite;
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
        { type: "Commands", id },
        { type: "Commands", id: "FAVOURITES" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCommandQuery,
  useListCommandsQuery,
  useSearchCommandsQuery,
  useGetFavouritesQuery,
  useCreateCommandMutation,
  useUpdateCommandMutation,
  useDeleteCommandMutation,
  useToggleFavouriteMutation,
} = commandsApi;
