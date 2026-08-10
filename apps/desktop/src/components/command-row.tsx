import { MoreVertical, Pencil, Play, Trash2 } from "lucide-react";
import { useOrdito } from "../context/ordito-context";
import { formatTimestamp } from "../lib/format";
import {
  scheduledBadgeClass,
  scheduledLabel,
  statusBadgeClass,
  statusLabels,
} from "../lib/status";
import type { CommandItem } from "../types";
import { IconPreview } from "./icon-picker";
import { Badge } from "@packages/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";

type CommandRowProps = {
  command: CommandItem;
  selected: boolean;
  onSelect: () => void;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function CommandRow({
  command,
  selected,
  onSelect,
  onRun,
  onEdit,
  onDelete,
}: CommandRowProps) {
  const { activeSchedules } = useOrdito();
  const isScheduled =
    command.status === "idle" &&
    activeSchedules.some((s) => s.commandId === command.id);

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onRun}
      className={`group relative flex cursor-pointer items-center gap-2.5 border-b border-separator px-3 py-2.75 transition-colors duration-120 last:border-b-0 bg-background`}
    >
      {selected && (
        <span className="absolute inset-y-2.5 left-0 w-0.75 rounded-r-full bg-accent" />
      )}
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-control text-muted-foreground">
        <IconPreview iconKey={command.icon} className="size-4" />
      </span>
      <div className="grid min-w-0 flex-1 gap-0.75">
        <span className="truncate text-[0.86rem] font-[720] text-ink">
          {command.name}
        </span>
        <code className="block min-w-0 truncate font-mono text-[0.71rem] text-muted-foreground">
          {command.command}
        </code>
      </div>
      <Badge
        className={`shrink-0 ${
          isScheduled ? scheduledBadgeClass : statusBadgeClass[command.status]
        }`}
      >
        {isScheduled ? scheduledLabel : statusLabels[command.status]}
      </Badge>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-faint text-[0.66rem] whitespace-nowrap">
          {formatTimestamp(command.lastRunAt)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRun();
          }}
          className={`grid size-[26px] place-items-center rounded-[7px] bg-accent text-accent-foreground transition-all duration-[140ms] ease-out hover:brightness-110 active:scale-95 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={`Run ${command.name}`}
        >
          <Play size={13} fill="currentColor" strokeWidth={0} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className={`grid size-[26px] place-items-center rounded-[7px] text-muted-foreground transition-all duration-[120ms] hover:bg-control-hover hover:text-ink ${
                  selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                aria-label={`Actions for ${command.name}`}
              />
            }
          >
            <MoreVertical size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onRun}>
              <Play size={14} />
              Run now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil size={14} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
