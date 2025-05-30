import { useAppContext } from "@/context";
import { TauriAPI } from "@/lib/tauri";
import { TCommmand } from "@/types/command";
import { useCallback, useState } from "react";

// Hook for group mutations
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

// Hook for command mutations
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

// Hook for command execution
export function useCommandExecution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, [string, string][]>>(
    {}
  );

  const executeCommand = useCallback(async (cmd: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await TauriAPI.executeCommand(cmd);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to execute command";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const executeCommandDetached = useCallback(async (cmd: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await TauriAPI.executeCommandDetached(cmd);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to execute detached command";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const executeGroupCommands = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const groupResults = await TauriAPI.executeGroupCommands(groupId);
      setResults((prev) => ({ ...prev, [groupId]: groupResults }));
      setLoading(false);
      return groupResults;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to execute group commands";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const getExecutionResults = useCallback(
    (groupId: string) => {
      return results[groupId] || [];
    },
    [results]
  );

  const clearResults = useCallback((groupId?: string) => {
    if (groupId) {
      setResults((prev) => ({ ...prev, [groupId]: [] }));
    } else {
      setResults({});
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeCommand,
    executeCommandDetached,
    executeGroupCommands,
    getExecutionResults,
    clearResults,
    clearError,
  };
}

// Hook for data operations (import/export)
export function useDataOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _setGroups } = useAppContext();

  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await TauriAPI.exportData();
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to export data";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const importData = useCallback(
    async (data: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await TauriAPI.importData(data);

        // Refresh groups data after successful import
        const updatedGroups = await TauriAPI.getGroups();
        _setGroups(updatedGroups);

        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to import data";
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    [_setGroups]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    exportData,
    importData,
    clearError,
  };
}
