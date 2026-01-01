import type { CommandResponse, ScheduleResponse } from "@/store/types";
import { ClockIcon } from "lucide-react";
import { ScheduleForm } from "./schedule-form";

interface ScheduleDetailProps {
  schedule: ScheduleResponse | null;
  commands: CommandResponse[];
  isCreating: boolean;
  onSave: (scheduleData: {
    command_id: string;
    cron_expression: string;
    show_notification: boolean;
  }) => void;
  onCancel: () => void;
}

export function ScheduleDetail({
  schedule,
  commands,
  isCreating,
  onSave,
  onCancel,
}: ScheduleDetailProps) {
  const isEditing = schedule !== null || isCreating;

  if (!isEditing) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a schedule to view details</p>
          <p className="text-xs mt-1">Or create a new schedule</p>
        </div>
      </div>
    );
  }

  return (
    <ScheduleForm
      schedule={schedule}
      commands={commands}
      isCreating={isCreating}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
