/**
 * Base RTK Query API configuration for Ordito
 * Uses Tauri's invoke API as the base query mechanism
 */

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { invoke } from "@tauri-apps/api/core";

/**
 * Custom base query that wraps Tauri's invoke function
 * All API endpoints will use this to communicate with the Rust backend
 */
async function tauriBaseQuery<T>(command: {
  command: string;
  args?: Record<string, unknown>;
}): Promise<{ data: T } | { error: { status: string; data: string } }> {
  try {
    const result = await invoke<T>(command.command, command.args);
    return { data: result as T };
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Base API slice with tag-based cache invalidation
 * All domain-specific APIs will extend from this base
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Commands", "Groups", "Schedules", "Logs"],
  endpoints: () => ({}),
});

/**
 * Export the custom Tauri base query for use in API slices
 */
export { tauriBaseQuery };
