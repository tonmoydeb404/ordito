import type { CommandResponse, ScheduleResponse } from "@/store/types";
import { ScheduleCard } from "./schedule-card";
import { SchedulesEmptyState } from "./schedules-empty-state";

interface SchedulesListProps {
  schedules: ScheduleResponse[];
  commands: CommandResponse[];
  selectedSchedule: ScheduleResponse | null;
  onSelectSchedule: (schedule: ScheduleResponse | null) => void;
  onToggleNotification: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export function SchedulesList({
  schedules,
  commands,
  selectedSchedule,
  onSelectSchedule,
  onToggleNotification,
  onDeleteSchedule,
}: SchedulesListProps) {
  // Create a map for faster command lookup
  const commandMap = new Map(commands.map((cmd) => [cmd.id, cmd]));

  return (
    <div className="space-y-2 p-4">
      {schedules.map((schedule) => {
        const command = commandMap.get(schedule.command_id);
        const isSelected = selectedSchedule?.id === schedule.id;

        return (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            command={command}
            isSelected={isSelected}
            onSelect={() => onSelectSchedule(schedule)}
            onToggleNotification={() => onToggleNotification(schedule.id)}
            onDelete={() => onDeleteSchedule(schedule.id)}
          />
        );
      })}

      <SchedulesEmptyState hasSchedules={schedules.length > 0} />
    </div>
  );
}
