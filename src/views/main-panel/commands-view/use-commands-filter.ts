import type { CommandResponse } from "@/store/types";
import { useMemo } from "react";

interface UseCommandsFilterProps {
  commands: CommandResponse[];
  sortBy: string;
  filterBy: string;
}

export function useCommandsFilter({
  commands,
  sortBy,
  filterBy,
}: UseCommandsFilterProps) {
  return useMemo(() => {
    return commands
      .filter((command) => {
        switch (filterBy) {
          case "favorite":
            return command.is_favourite;
          case "recent":
            return true; // TODO: Implement recent logic
          default:
            return true;
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.title.localeCompare(b.title);
          case "lastModified":
            const aTime = new Date(a.updated_at).getTime();
            const bTime = new Date(b.updated_at).getTime();
            return bTime - aTime;
          case "lastExecuted":
            return 0; // TODO: Implement last executed logic
          default:
            return 0;
        }
      });
  }, [commands, sortBy, filterBy]);
}
