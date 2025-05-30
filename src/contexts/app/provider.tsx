import { TauriAPI } from "@/lib/tauri";
import { TCommandGroup, TCommmand } from "@/types/command";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { AppContext } from ".";
import { AppContextType } from "./type";

interface Props {
  children: ReactNode;
}

const AppProvider = ({ children }: Props) => {
  const [groups, setGroups] = useState<TCommandGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGroups = await TauriAPI.getGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const getGroupById = useCallback(
    (groupId: string) => {
      return groups.find((group) => group.id === groupId);
    },
    [groups]
  );

  const getCommandById = useCallback(
    (groupId: string, commandId: string): TCommmand | undefined => {
      const group = getGroupById(groupId);
      return group?.commands.find((cmd) => cmd.id === commandId);
    },
    [getGroupById]
  );

  // Internal methods for mutation hooks to update context directly
  const _addGroup = useCallback((group: TCommandGroup) => {
    setGroups((prev) => [...prev, group]);
  }, []);

  const _updateGroup = useCallback((groupId: string, title: string) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, title } : group))
    );
  }, []);

  const _deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
  }, []);

  const _addCommand = useCallback((groupId: string, command: TCommmand) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, commands: [...group.commands, command] }
          : group
      )
    );
  }, []);

  const _updateCommand = useCallback(
    (
      groupId: string,
      commandId: string,
      commandData: Omit<TCommmand, "id">
    ) => {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                commands: group.commands.map((cmd) =>
                  cmd.id === commandId ? { ...cmd, ...commandData } : cmd
                ),
              }
            : group
        )
      );
    },
    []
  );

  const _deleteCommand = useCallback((groupId: string, commandId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              commands: group.commands.filter((cmd) => cmd.id !== commandId),
            }
          : group
      )
    );
  }, []);

  // Load groups on mount
  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  const contextValue: AppContextType = {
    groups,
    loading,
    error,
    refreshGroups,
    getGroupById,
    getCommandById,
    _setGroups: setGroups,
    _addGroup,
    _updateGroup,
    _deleteGroup,
    _addCommand,
    _updateCommand,
    _deleteCommand,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
