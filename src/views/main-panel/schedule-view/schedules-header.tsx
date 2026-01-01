import { Button } from "@/components/ui/button";
import type { GroupResponse } from "@/store/types";
import { PlusIcon, RefreshCwIcon } from "lucide-react";

interface SchedulesHeaderProps {
  group: GroupResponse;
  onRefresh: () => void;
  onCreateSchedule: () => void;
}

export function SchedulesHeader({
  group,
  onRefresh,
  onCreateSchedule,
}: SchedulesHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold">Schedules</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCwIcon className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={onCreateSchedule}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>
    </div>
  );
}
