import { EmptyState } from "@/components/empty-state";
import { ScheduleRow } from "@/components/schedule-row";
import { SectionLabel } from "@/components/section-label";
import { useOrdito } from "@/context/ordito-context";
import { Button } from "@packages/ui/components/button";
import { CalendarClock, Plus } from "lucide-react";

export function SchedulesScreen() {
  const {
    commands,
    activeSchedules,
    pausedSchedules,
    selectedSchedule,
    selectSchedule,
    startCreateSchedule,
    toggleSchedule,
  } = useOrdito();

  const totalSchedules = activeSchedules.length + pausedSchedules.length;

  if (totalSchedules === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={24} />}
        title="No schedules yet"
        description="Pick a command and set a recurrence to automate it."
        action={
          <Button onClick={startCreateSchedule}>
            <Plus size={14} />
            New schedule
          </Button>
        }
        className="w-full h-full"
      />
    );
  }

  function getCommandName(commandId: string) {
    return commands.find((command) => command.id === commandId)?.name;
  }

  return (
    <div className="h-full overflow-auto scrollbar-thin p-4">
      <div className="overflow-hidden rounded-xl border border-border bg-inset">
        <div className="flex items-center justify-end border-b border-separator bg-inset px-3 py-1.75">
          <Button variant="outline" size="sm" onClick={startCreateSchedule}>
            <Plus size={13} />
            New
          </Button>
        </div>
        {activeSchedules.length > 0 && (
          <section>
            <SectionLabel label="Active" count={activeSchedules.length} />
            {activeSchedules.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                commandName={getCommandName(schedule.commandId)}
                enabled={schedule.enabled}
                selected={schedule.id === selectedSchedule?.id}
                onToggle={() => toggleSchedule(schedule.id)}
                onSelect={() => selectSchedule(schedule.id)}
              />
            ))}
          </section>
        )}

        {pausedSchedules.length > 0 && (
          <section>
            <SectionLabel label="Paused" count={pausedSchedules.length} />
            {pausedSchedules.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                commandName={getCommandName(schedule.commandId)}
                enabled={schedule.enabled}
                selected={schedule.id === selectedSchedule?.id}
                onToggle={() => toggleSchedule(schedule.id)}
                onSelect={() => selectSchedule(schedule.id)}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
