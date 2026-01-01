/**
 * FolderTree Component
 * Displays a simple list of folders/groups
 */

import StateWrapper from "@/components/common/state-wrapper";
import { CreateGroupDialog } from "@/components/dialogs/group/create-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useListGroupsQuery } from "@/store/api/groups-api";
import type { GroupResponse } from "@/store/types";
import { Folder } from "lucide-react";
import { useMemo } from "react";
import type { FolderTreeProps } from "./types";

export default function FolderTree(props: FolderTreeProps) {
  const { searchQuery, selectedGroup, onSelectGroup } = props;

  const groupsQuery = useListGroupsQuery();
  const groups = groupsQuery.data ?? [];

  // Helper function to extract error message
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "error" in error) {
      return String(error.error);
    }
    return "Unknown error";
  };

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    return groups.filter((group) =>
      group.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  return (
    <div className="p-3">
      <StateWrapper
        isLoading={groupsQuery.isLoading}
        isError={groupsQuery.isError}
        isSuccess={groupsQuery.isSuccess}
        isEmpty={filteredGroups.length === 0}
        data={filteredGroups}
        errorMessage={
          groupsQuery.error
            ? `Failed to load folders: ${getErrorMessage(groupsQuery.error)}`
            : "Failed to load folders"
        }
        loadingMessage="Loading folders..."
        emptyMessage={
          searchQuery
            ? "No folders match your search"
            : "No folders yet. Create your first folder to get started!"
        }
        loadingComponent={
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
        emptyComponent={
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Folder className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm text-center">
              {searchQuery ? "No folders match your search" : "No folders yet"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-center mt-1">
                Create your first folder to get started!
              </p>
            )}
          </div>
        }
        render={(groups: GroupResponse[]) => (
          <div className="space-y-1 mb-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md
                  text-sm text-left transition-colors
                  ${
                    selectedGroup?.id === group.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }
                `}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">{group.title}</span>
              </button>
            ))}
          </div>
        )}
      />

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <CreateGroupDialog groups={groups} />
      </div>
    </div>
  );
}
