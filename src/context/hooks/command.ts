import { useAppContext } from "@/context";
import { TauriAPI } from "@/lib/tauri";
import { TCommmand } from "@/types/command";
import { useCallback, useState } from "react";

export function useCommandMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _addCommand, _updateCommand, _deleteCommand } = useAppContext();

  const addCommand = useCallback(
    async (groupId: string, commandData: Omit<TCommmand, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const commandId = await TauriAPI.addCommandToGroup(
          groupId,
          commandData
        );

        // Update context immediately with optimistic update
        const newCommand: TCommmand = {
          id: commandId,
          ...commandData,
        };
        _addCommand(groupId, newCommand);

        return commandId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add command";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_addCommand]
  );

  const updateCommand = useCallback(
    async (
      groupId: string,
      commandId: string,
      commandData: Omit<TCommmand, "id">
    ) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.updateCommand(groupId, commandId, commandData);

        // Update context immediately
        _updateCommand(groupId, commandId, commandData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update command";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_updateCommand]
  );

  const deleteCommand = useCallback(
    async (groupId: string, commandId: string) => {
      try {
        setLoading(true);
        setError(null);
        await TauriAPI.deleteCommandFromGroup(groupId, commandId);

        // Update context immediately
        _deleteCommand(groupId, commandId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete command";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [_deleteCommand]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    addCommand,
    updateCommand,
    deleteCommand,
    clearError,
  };
}
