/**
 * Utility functions for building and filtering the folder tree
 */

import type { CommandResponse, GroupResponse } from "@/store/types";
import type { TreeItem } from "./types";

/**
 * Builds a hierarchical tree structure from flat groups and commands arrays
 */
export function buildTree(
  groups: GroupResponse[],
  commands: CommandResponse[]
): TreeItem[] {
  const tree: TreeItem[] = [];
  const folderMap = new Map<string, TreeItem>();

  // Create folder items
  groups.forEach((group) => {
    const item: TreeItem = {
      type: "folder",
      id: group.id,
      name: group.title,
      parentId: group.parent_id,
      children: [],
      data: group,
    };
    folderMap.set(group.id, item);
  });

  // Build folder hierarchy
  folderMap.forEach((item) => {
    if (item.parentId) {
      const parent = folderMap.get(item.parentId);
      if (parent) {
        parent.children!.push(item);
      }
    } else {
      tree.push(item);
    }
  });

  // Add commands to folders
  commands.forEach((command) => {
    const commandItem: TreeItem = {
      type: "command",
      id: command.id,
      name: command.title,
      parentId: command.command_group_id,
      data: command,
    };

    if (command.command_group_id) {
      const folder = folderMap.get(command.command_group_id);
      if (folder) {
        folder.children!.push(commandItem);
      }
    } else {
      tree.push(commandItem);
    }
  });

  return tree;
}

/**
 * Filters a tree based on a search query
 * Returns a new tree containing only items that match the search or have matching children
 */
export function filterTree(
  items: TreeItem[],
  searchQuery: string,
  expandedFolders: Set<string>,
  setExpandedFolders: (folders: Set<string>) => void
): TreeItem[] {
  if (!searchQuery) return items;

  const filterTreeRecursive = (items: TreeItem[]): TreeItem[] => {
    return items.reduce<TreeItem[]>((acc, item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const children = item.children ? filterTreeRecursive(item.children) : [];

      if (matchesSearch || children.length > 0) {
        acc.push({
          ...item,
          children,
        });

        // Auto-expand folders that contain matching items
        if (item.type === "folder" && children.length > 0) {
          setExpandedFolders(new Set([...Array.from(expandedFolders), item.id]));
        }
      }

      return acc;
    }, []);
  };

  return filterTreeRecursive(items);
}
