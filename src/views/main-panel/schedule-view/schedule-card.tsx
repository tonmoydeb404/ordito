import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CommandResponse, ScheduleResponse } from "@/store/types";
import { BellIcon, BellOffIcon, Trash2Icon } from "lucide-react";

interface ScheduleCardProps {
  schedule: ScheduleResponse;
  command: CommandResponse | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onToggleNotification: () => void;
  onDelete: () => void;
}

export function ScheduleCard({
  schedule,
  command,
  isSelected,
  onSelect,
  onToggleNotification,
  onDelete,
}: ScheduleCardProps) {
  const formatCronExpression = (cronExpression: string) => {
    // Simple cron expression formatter
    const parts = cronExpression.split(" ");
    if (parts.length !== 6) return cronExpression;

    const [second, minute, hour, day, month, dayOfWeek] = parts;

    // Common patterns
    if (
      minute === "0" &&
      hour === "*" &&
      day === "*" &&
      month === "*" &&
      dayOfWeek === "*"
    ) {
      return `Every hour at :${second}`;
    }
    if (
      second === "0" &&
      hour === "*" &&
      day === "*" &&
      month === "*" &&
      dayOfWeek === "*"
    ) {
      return `Every hour at ${minute} minutes`;
    }
    if (
      second === "0" &&
      minute === "0" &&
      day === "*" &&
      month === "*" &&
      dayOfWeek === "*"
    ) {
      return `Daily at ${hour}:00`;
    }
    if (
      second === "0" &&
      minute === "0" &&
      hour === "0" &&
      month === "*" &&
      dayOfWeek === "*"
    ) {
      return `Monthly on day ${day}`;
    }

    return cronExpression;
  };

  const formatLastRun = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleString();
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent/50 p-0 rounded-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {command?.title || "Unknown Command"}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {formatCronExpression(schedule.cron_expression)}
              </code>
              <span className="text-xs text-muted-foreground">
                Created: {formatLastRun(schedule.created_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNotification();
              }}
            >
              {schedule.show_notification ? (
                <BellIcon className="w-4 h-4" />
              ) : (
                <BellOffIcon className="w-4 h-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this schedule? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
