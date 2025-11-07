import { Button } from "@/components/ui/button";
import type { CommandResponse } from "@/store/types";
import { Clock, Edit, Play, Square, Star } from "lucide-react";

interface CommandCardProps {
  command: CommandResponse;
  isSelected: boolean;
  isRunning: boolean;
  onSelect: (commandId: string) => void;
  onExecute: (commandId: string) => void;
  onStop: (commandId: string) => void;
  getStatusBadge: (command: CommandResponse) => React.ReactNode;
}

export function CommandCard({
  command,
  isSelected,
  isRunning,
  onSelect,
  onExecute,
  onStop,
  getStatusBadge,
}: CommandCardProps) {
  return (
    <div
      key={command.id}
      className={`command-card p-3 rounded cursor-pointer border transition-all ${
        isSelected
          ? "bg-accent border-l-2 border-primary"
          : "bg-secondary hover:bg-accent border-border"
      }`}
      onClick={() => onSelect(command.id)}
      data-testid={`card-command-${command.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {command.is_favourite && <Star className="w-3 h-3 text-warning" />}
          <h3 className="font-medium text-sm">{command.title}</h3>
          {getStatusBadge(command)}
        </div>
        <div className="flex gap-1">
          {isRunning ? (
            <Button
              size="icon"
              variant="ghost"
              className="p-1 h-auto w-auto hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onStop(command.id);
              }}
              data-testid={`button-stop-${command.title
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <Square className="w-3 h-3 text-error" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="p-1 h-auto w-auto hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onExecute(command.id);
              }}
              data-testid={`button-play-${command.title
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <Play className="w-3 h-3 text-success" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="p-1 h-auto w-auto hover:bg-background"
            onClick={() => onSelect(command.id)}
          >
            <Edit className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        {command.value || "No command"}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span
          data-testid={`text-last-run-${command.title
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          Last run:{" "}
          {command.updated_at
            ? new Date(command.updated_at).toLocaleDateString()
            : "Never"}
        </span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>0.5s</span>
        </div>
      </div>
    </div>
  );
}
