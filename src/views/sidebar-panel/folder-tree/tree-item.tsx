/**
 * TreeItem component for rendering individual tree nodes
 */

import type { CommandResponse } from "@/store/types";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  Star,
  Terminal,
} from "lucide-react";
import type { TreeItemProps } from "./types";

export function TreeItemComponent({
  item,
  level = 0,
  selectedFolderId,
  expandedFolders,
  onToggleFolder,
  onSelectFolder,
  onSelectCommand,
}: TreeItemProps) {
  const isExpanded = expandedFolders.has(item.id);
  const isSelected =
    item.type === "folder" ? selectedFolderId === item.id : false;
  const indentation = level * 24;

  const handleClick = () => {
    if (item.type === "folder") {
      onToggleFolder(item.id);
      onSelectFolder(item.id);
    } else {
      onSelectCommand(item.id);
    }
  };

  return (
    <div key={item.id}>
      <div
        className={`flex items-center py-1.5 px-2 hover:bg-accent rounded cursor-pointer ${
          isSelected ? "bg-accent text-primary" : ""
        }`}
        style={{ paddingLeft: `${8 + indentation}px` }}
        onClick={handleClick}
        data-testid={`${item.type}-${item.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
      >
        {item.type === "folder" && (
          <div className="w-4 mr-2 flex justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        )}

        {item.type === "command" && <div className="w-4 mr-2" />}

        <div className="flex items-center flex-1">
          {item.type === "folder" ? (
            <>
              {isExpanded ? (
                <FolderOpen className="w-3 h-3 text-warning mr-2" />
              ) : (
                <FolderIcon className="w-3 h-3 text-warning mr-2" />
              )}
              <span className="text-xs">{item.name}</span>
            </>
          ) : (
            <>
              <Terminal className="w-3 h-3 mr-2" />
              <span className="text-xs">{item.name}</span>
              {(item.data as CommandResponse)?.is_favourite && (
                <Star className="w-3 h-3 ml-1 text-warning" />
              )}
            </>
          )}
        </div>
      </div>

      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onSelectFolder={onSelectFolder}
              onSelectCommand={onSelectCommand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
