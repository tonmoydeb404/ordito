import { TCommandGroup, TCommmand } from "@/types/command";

export type AppContextType = {
  groups: TCommandGroup[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
  getGroupById: (groupId: string) => TCommandGroup | undefined;
  getCommandById: (groupId: string, commandId: string) => TCommmand | undefined;

  // Internal methods for mutation hooks
  _setGroups: (groups: TCommandGroup[]) => void;
  _addGroup: (group: TCommandGroup) => void;
  _updateGroup: (groupId: string, title: string) => void;
  _deleteGroup: (groupId: string) => void;
  _addCommand: (groupId: string, command: TCommmand) => void;
  _updateCommand: (
    groupId: string,
    commandId: string,
    commandData: Omit<TCommmand, "id">
  ) => void;
  _deleteCommand: (groupId: string, commandId: string) => void;
};
