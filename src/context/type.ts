import { TCommandGroup, TCommmand } from "@/types/command";

export type AppContextType = {
  groups: TCommandGroup[];
  loading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
  getGroupById: (groupId: string) => TCommandGroup | undefined;
  getCommandById: (groupId: string, commandId: string) => TCommmand | undefined;

  // Simplified execution state
  results: Record<string, [string, string][]>;
  showResultsModal: string | null;

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

  // Simplified execution methods
  setResults: (groupId: string, results: [string, string][]) => void;
  setShowResultsModal: (groupId: string | null) => void;
};
