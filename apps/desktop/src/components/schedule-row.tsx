import { formatNextRun } from "../lib/format";
import type { ScheduleItem } from "../types";
import { Switch } from "@packages/ui/components/switch";

type ScheduleRowProps = {
  schedule: ScheduleItem;
  commandName?: string;
  enabled: boolean;
  selected: boolean;
  onToggle: (enabled: boolean) => void;
  onSelect: () => void;
};

export function ScheduleRow({
  schedule,
  commandName,
  enabled,
  selected,
  onToggle,
  onSelect,
}: ScheduleRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      className="group relative flex items-center gap-2.5 min-h-[56px] py-2.5 px-3 bg-row border-b border-separator last:border-b-0 cursor-pointer transition-colors duration-[120ms] hover:bg-row-hover"
    >
      {selected && (
        <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-accent" />
      )}
      <span
        className={`shrink-0 w-2 h-2 rounded-full ${enabled ? "bg-success" : "bg-faint"}`}
      />
      <div className="grid min-w-0 flex-1 gap-[3px]">
        <strong className="overflow-hidden text-ink text-[0.82rem] font-[700] truncate">
          {commandName ?? "Unknown"}
        </strong>
        <small className="overflow-hidden text-muted-foreground text-[0.7rem] truncate">
          {schedule.label}
        </small>
      </div>
      <span
        className={`text-[0.68rem] whitespace-nowrap ${
          enabled ? "text-muted-foreground" : "text-faint italic"
        }`}
      >
        {enabled ? formatNextRun(schedule.nextRunAt) : "Paused"}
      </span>
      <div onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${commandName}`}
        />
      </div>
    </div>
  );
}
