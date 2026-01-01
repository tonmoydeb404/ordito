/**
 * Type definitions for the folder tree component
 */

import type { CommandResponse, GroupResponse } from "@/store/types";

export interface FolderTreeProps {
  searchQuery: string;
  selectedGroup: GroupResponse | null;
  onSelectGroup: (group: GroupResponse | null) => void;
}

export interface TreeItem {
  type: "folder" | "command";
  id: string;
  name: string;
  parentId?: string | null;
  children?: TreeItem[];
  data?: GroupResponse | CommandResponse;
}

export interface TreeItemProps {
  item: TreeItem;
  level?: number;
  selectedFolderId: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onSelectCommand: (commandId: string) => void;
}
