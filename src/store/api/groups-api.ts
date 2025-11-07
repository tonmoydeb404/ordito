/**
 * RTK Query API for Group Management
 * Handles hierarchical group operations and navigation
 */

import type { CreateGroupDto, GroupResponse, UpdateGroupDto } from "../types";
import { baseApi, tauriBaseQuery } from "./base-api";

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get a single group by ID
     */
    getGroup: builder.query<GroupResponse | null, string>({
      queryFn: async (id) =>
        tauriBaseQuery<GroupResponse | null>({
          command: "get_group",
          args: { id },
        }),
      providesTags: (result, _error, id) =>
        result ? [{ type: "Groups", id }] : [],
    }),

    /**
     * List all groups
     */
    listGroups: builder.query<GroupResponse[], void>({
      queryFn: async () =>
        tauriBaseQuery<GroupResponse[]>({
          command: "list_groups",
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Groups" as const, id })),
              { type: "Groups", id: "LIST" },
            ]
          : [{ type: "Groups", id: "LIST" }],
    }),

    /**
     * Get root-level groups (no parent)
     */
    getRootGroups: builder.query<GroupResponse[], void>({
      queryFn: async () =>
        tauriBaseQuery<GroupResponse[]>({
          command: "get_root_groups",
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Groups" as const, id })),
              { type: "Groups", id: "ROOT" },
            ]
          : [{ type: "Groups", id: "ROOT" }],
    }),

    /**
     * Get child groups of a parent group
     */
    getChildren: builder.query<GroupResponse[], string>({
      queryFn: async (parentId) =>
        tauriBaseQuery<GroupResponse[]>({
          command: "get_children",
          args: { parentId },
        }),
      providesTags: (result, _error, parentId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Groups" as const, id })),
              { type: "Groups", id: `CHILDREN_${parentId}` },
            ]
          : [{ type: "Groups", id: `CHILDREN_${parentId}` }],
    }),

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    /**
     * Create a new group
     * Returns the UUID of the created group
     */
    createGroup: builder.mutation<string, CreateGroupDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<string>({
          command: "create_group",
          args: { dto },
        }),
      invalidatesTags: [
        { type: "Groups", id: "LIST" },
        { type: "Groups", id: "ROOT" },
      ],
    }),

    /**
     * Update an existing group
     */
    updateGroup: builder.mutation<void, UpdateGroupDto>({
      queryFn: async (dto) =>
        tauriBaseQuery<void>({
          command: "update_group",
          args: { dto },
        }),
      invalidatesTags: (_result, _error, { id, parent_id }) => [
        { type: "Groups", id },
        { type: "Groups", id: "LIST" },
        { type: "Groups", id: "ROOT" },
        ...(parent_id
          ? [{ type: "Groups" as const, id: `CHILDREN_${parent_id}` }]
          : []),
        // Also invalidate commands since group changes affect command listings
        { type: "Commands", id: "LIST" },
      ],
    }),

    /**
     * Delete a group
     * Cascades to delete all commands in the group
     */
    deleteGroup: builder.mutation<void, string>({
      queryFn: async (id) =>
        tauriBaseQuery<void>({
          command: "delete_group",
          args: { id },
        }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Groups", id },
        { type: "Groups", id: "LIST" },
        { type: "Groups", id: "ROOT" },
        // Invalidate all commands since group deletion cascades
        { type: "Commands", id: "LIST" },
        { type: "Commands", id: "SEARCH" },
        { type: "Commands", id: "FAVOURITES" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetGroupQuery,
  useListGroupsQuery,
  useGetRootGroupsQuery,
  useGetChildrenQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupsApi;
