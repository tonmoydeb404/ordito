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
            // Show commands executed in last 7 days
            if (!command.last_executed_at) return false;
            const executed = new Date(command.last_executed_at);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return executed > sevenDaysAgo;
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
            // Sort by last execution time (most recent first)
            const aExec = a.last_executed_at
              ? new Date(a.last_executed_at).getTime()
              : 0;
            const bExec = b.last_executed_at
              ? new Date(b.last_executed_at).getTime()
              : 0;
            return bExec - aExec;
          default:
            return 0;
        }
      });
  }, [commands, sortBy, filterBy]);
}
