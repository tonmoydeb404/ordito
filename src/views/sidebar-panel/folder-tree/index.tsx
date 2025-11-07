/**
 * FolderTree Component
 * Main component for displaying and managing the hierarchical folder/command tree
 */

import { CreateCommandDialog } from "@/components/dialogs/command/create-dialog";
import { CreateGroupDialog } from "@/components/dialogs/group/create-dialog";
import { useListCommandsQuery } from "@/store/api/commands-api";
import { useListGroupsQuery } from "@/store/api/groups-api";
import { useMemo, useState } from "react";
import { TreeItemComponent } from "./tree-item";
import type { FolderTreeProps } from "./types";
import { buildTree, filterTree } from "./utils";

export default function FolderTree({
  searchQuery,
  selectedFolderId,
  onSelectFolder,
  onSelectCommand,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const { data: groups = [], ...others } = useListGroupsQuery();
  const { data: commands = [] } = useListCommandsQuery();

  console.log({ groups, ...others });

  const builtTree = useMemo(() => {
    return buildTree(groups, commands);
  }, [groups, commands]);

  const filteredTree = useMemo(() => {
    return filterTree(
      builtTree,
      searchQuery,
      expandedFolders,
      setExpandedFolders
    );
  }, [builtTree, searchQuery, expandedFolders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-3">
      <div className="space-y-1 mb-4">
        {filteredTree.map((item) => (
          <TreeItemComponent
            key={item.id}
            item={item}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onSelectFolder={onSelectFolder}
            onSelectCommand={onSelectCommand}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <CreateCommandDialog groups={groups} />
        <CreateGroupDialog groups={groups} />
      </div>
    </div>
  );
}
