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
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { useScheduleContext } from "@/contexts/schedule";
import { TModalProps, useModal } from "@/hooks/use-modal";
import { TSchedule } from "@/types/command";
import { Edit2, Pause, Play, Trash2 } from "lucide-react";
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

  // Filter based on optional group and command
  const filtered = React.useMemo(() => {
    let list = schedules;
    if (data?.group?.id)
      list = list.filter((s) => s.group_id === data.group.id);
    if (data?.command?.id)
      list = list.filter((s) => s.command_id === data.command.id);
    return list;
  }, [schedules, data]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
        <DialogContent className="sm:max-w-6xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {data?.group
                ? `Schedules for “${data.group.title}”`
                : "All Schedules"}
              {data?.command ? ` - ${data.command.label}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex-1 overflow-auto">
            <Table>
              <TableCaption>
                {data?.group
                  ? `${data.group.title} Schedules`
                  : "All Schedules"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Next</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sch) => (
                  <TableRow key={sch.id}>
                    <TableCell>
                      {new Date(sch.scheduled_time).toLocaleString()}
                    </TableCell>
                    <TableCell>{sch.recurrence}</TableCell>
                    <TableCell>
                      {new Date(sch.next_execution).toLocaleString()}
                    </TableCell>
                    <TableCell>{sch.execution_count}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSchedule(sch.id)}
                        disabled={loading}
                      >
                        {sch.is_active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateModal.open(sch)}
                        disabled={loading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteModal.open(sch)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
    </>
  );
}
