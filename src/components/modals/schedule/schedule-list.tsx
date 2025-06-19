import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { useScheduleContext } from "@/contexts/schedule";
import { TModalProps, useModal } from "@/hooks/use-modal";
import { TSchedule } from "@/types/schedule";
import { Clock, Edit2, Info, Pause, Play, Trash2 } from "lucide-react";
import React from "react";
import { ScheduleDeleteModal } from "./schedule-delete";
import { ScheduleUpdateModal } from "./schedule-update";

export default function ListSchedulesModal({
  isOpen,
  close,
  data,
}: TModalProps<{ group?: any; command?: any }>) {
  // Modal hooks inside component
  const updateModal = useModal<TSchedule>();
  const deleteModal = useModal<TSchedule>();

  const { schedules } = useScheduleContext();
  const { loading, toggleSchedule } = useScheduleMutations();

  console.log({ schedules });

  // Filter based on optional group and command
  const filtered = React.useMemo(() => {
    let list = schedules;
    if (data?.group?.id)
      list = list.filter((s) => s.group_id === data.group.id);
    if (data?.command?.id)
      list = list.filter((s) => s.command_id === data.command.id);
    return list;
  }, [schedules, data]);

  // Helper function to get human-readable cron description
  const getCronDescription = (cronExpression: string): string => {
    const descriptions: Record<string, string> = {
      "* * * * *": "Every minute",
      "0 * * * *": "Every hour",
      "0 9 * * *": "Daily at 9:00 AM",
      "0 9 * * 1-5": "Weekdays at 9:00 AM",
      "0 9 * * 1": "Every Monday at 9:00 AM",
      "*/15 * * * *": "Every 15 minutes",
      "*/30 * * * *": "Every 30 minutes",
      "0 */2 * * *": "Every 2 hours",
      "0 0 * * *": "Daily at midnight",
      "0 12 * * *": "Daily at noon",
    };

    return descriptions[cronExpression] || cronExpression;
  };

  // Helper function to format relative time
  const getRelativeTime = (date: string): string => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs < 0) {
      return "Overdue";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
    } else {
      return "very soon";
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
        <DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {data?.group
                ? `Schedules for "${data.group.title}"`
                : "All Schedules"}
              {data?.command ? ` - ${data.command.label}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex-1 overflow-auto">
            <Table>
              <TableCaption>
                {filtered.length > 0
                  ? `${filtered.length} schedule${
                      filtered.length !== 1 ? "s" : ""
                    } found`
                  : "No schedules found"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Cron Expression</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sch) => (
                    <TableRow
                      key={sch.id}
                      className={!sch.is_active ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Badge
                          variant={sch.is_active ? "default" : "secondary"}
                          className={
                            sch.is_active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : ""
                          }
                        >
                          {sch.is_active ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sch.cron_expression}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <span className="text-sm">
                                {getCronDescription(sch.cron_expression)}
                              </span>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cron: {sch.cron_expression}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getRelativeTime(sch.next_execution)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sch.next_execution).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {sch.execution_count}
                          </span>
                          {sch.max_executions && (
                            <>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-muted-foreground">
                                {sch.max_executions}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sch.last_execution ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                sch.last_execution
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                sch.last_execution
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Never
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleSchedule(sch.id)}
                                disabled={loading}
                                className="h-8 w-8"
                              >
                                {sch.is_active ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {sch.is_active
                                ? "Pause schedule"
                                : "Resume schedule"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateModal.open(sch)}
                                disabled={loading}
                                className="h-8 w-8"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit schedule</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteModal.open(sch)}
                                disabled={loading}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete schedule</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => !loading && close()}
              disabled={loading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals triggered via useModal */}
      <ScheduleUpdateModal {...updateModal} />
      <ScheduleDeleteModal {...deleteModal} />
    </TooltipProvider>
  );
}
