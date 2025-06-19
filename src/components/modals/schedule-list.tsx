import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup, TCommmand, TSchedule } from "@/types/command";
import { Check, Edit2, Pause, Play, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<{ group?: TCommandGroup; command?: TCommmand }>;

export default function ListSchedulesModal({ close, isOpen, data }: Props) {
  const command = data?.command;
  const group = data?.group;

  const { schedules } = useScheduleContext();
  const {
    loading,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    clearError,
  } = useScheduleMutations();

  const [filtered, setFiltered] = useState<TSchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    recurrence: "once",
    customInterval: "60",
    maxExecutions: "",
  });

  useEffect(() => {
    if (isOpen) {
      clearError();
      let list = schedules;
      if (group?.id) list = list.filter((s) => s.group_id === group.id);
      if (command?.id) list = list.filter((s) => s.command_id === command.id);
      setFiltered(list);
    }
  }, [isOpen, schedules, group, command, clearError]);

  const startEdit = (sch: TSchedule) => {
    const dt = new Date(sch.scheduled_time);
    setForm({
      scheduledDate: dt.toISOString().split("T")[0],
      scheduledTime: dt.toISOString().split("T")[1].slice(0, 5),
      recurrence: sch.recurrence.startsWith("custom:")
        ? "custom"
        : sch.recurrence,
      customInterval: sch.recurrence.startsWith("custom:")
        ? sch.recurrence.split(":")[1]
        : "60",
      maxExecutions: sch.max_executions?.toString() ?? "",
    });
    setEditingId(sch.id);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      const {
        scheduledDate,
        scheduledTime,
        recurrence,
        customInterval,
        maxExecutions,
      } = form;
      const dt = new Date(`${scheduledDate}T${scheduledTime}`);
      if (dt <= new Date()) throw new Error("Time must be in the future");
      const iso = dt.toISOString();
      const finalRec =
        recurrence === "custom" ? `custom:${customInterval}` : recurrence;
      const maxExec = maxExecutions.trim()
        ? parseInt(maxExecutions)
        : undefined;
      await updateSchedule(id, {
        scheduled_time: iso,
        recurrence: finalRec,
        max_executions: maxExec,
      });
      toast.success("Schedule updated");
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="sm:max-w-6xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {group ? `Schedules for “${group.title}”` : "All Schedules"}
            {command ? ` - ${command.label}` : ""}
          </DialogTitle>
          <DialogDescription>
            Manage schedules: pause/play, edit, or delete.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-auto">
          <Table>
            <TableCaption>
              {group ? `${group.title} Schedules` : "All Schedules"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Next</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sch) => (
                <TableRow key={sch.id}>
                  {editingId === sch.id ? (
                    <>
                      <TableCell className="flex flex-col space-y-1">
                        <Input
                          type="date"
                          value={form.scheduledDate}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              scheduledDate: e.target.value,
                            }))
                          }
                          disabled={loading}
                        />
                        <Input
                          type="time"
                          value={form.scheduledTime}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              scheduledTime: e.target.value,
                            }))
                          }
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={form.recurrence}
                          onValueChange={(v) =>
                            setForm((f) => ({ ...f, recurrence: v }))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.recurrence === "custom" && (
                          <Input
                            type="number"
                            value={form.customInterval}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                customInterval: e.target.value,
                              }))
                            }
                            disabled={loading}
                          />
                        )}
                        <Input
                          type="number"
                          placeholder="Max Exec"
                          value={form.maxExecutions}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              maxExecutions: e.target.value,
                            }))
                          }
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="flex space-x-2">
                        <Button
                          size="icon"
                          onClick={() => saveEdit(sch.id)}
                          disabled={loading}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        {new Date(sch.scheduled_time).toLocaleString()}
                      </TableCell>
                      <TableCell>{sch.recurrence}</TableCell>
                      <TableCell>
                        {new Date(sch.next_execution).toLocaleString()}
                      </TableCell>
                      <TableCell>{sch.execution_count}</TableCell>
                      <TableCell className="flex space-x-2">
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
                          onClick={() => startEdit(sch)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={async () => {
                            await deleteSchedule(sch.id);
                            toast.success("Deleted schedule");
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
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
  );
}
