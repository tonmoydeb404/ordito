import { useAppContext } from "@/contexts/app";
import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";

export function useGroupMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _addGroup, _updateGroup, _deleteGroup } = useAppContext();

  const createGroup = useCallback(
    async (title: string) => {
      try {
        setLoading(true);
        setError(null);
        const groupId = await TauriAPI.createGroup(title);

        // Update context immediately with optimistic update
        _addGroup({
          id: groupId,
          title,
          commands: [],
        });

        return groupId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create group";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_addGroup]
  );

  const updateGroup = useCallback(
    async (groupId: string, title: string) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.updateGroup(groupId, title);

        // Update context immediately
        _updateGroup(groupId, title);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update group";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_updateGroup]
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.deleteGroup(groupId);

        // Update context immediately
        _deleteGroup(groupId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete group";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_deleteGroup]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    clearError,
  };
}
