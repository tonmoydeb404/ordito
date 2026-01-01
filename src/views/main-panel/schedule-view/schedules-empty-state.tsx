import { ClockIcon } from "lucide-react";

interface SchedulesEmptyStateProps {
  hasSchedules: boolean;
}

export function SchedulesEmptyState({
  hasSchedules,
}: SchedulesEmptyStateProps) {
  if (hasSchedules) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No schedules found</p>
        <p className="text-xs mt-1">
          Create your first schedule to get started
        </p>
      </div>
    </div>
  );
}
