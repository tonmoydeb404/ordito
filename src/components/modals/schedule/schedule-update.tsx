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
import { Label } from "@/components/ui/label";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TSchedule } from "@/types/command";
import { useState } from "react";
import { toast } from "sonner";
import ScheduleDateTimePicker from "./date-field";
import ScheduleRecurrenceField from "./recurrence-field";

export default function ScheduleUpdateModal({
  isOpen,
  close,
  data,
}: TModalProps<TSchedule>) {
  if (!data) return null;
  const { updateSchedule, loading } = useScheduleMutations();

  // Initialize state
  const initialDate = new Date(data.scheduled_time);
  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState<string>(
    initialDate.toISOString().slice(11, 16)
  );
  const [recurrence, setRecurrence] = useState<string>(
    data.recurrence.startsWith("custom:") ? "custom" : data.recurrence
  );
  const [customInterval, setCustomInterval] = useState<string>(
    data.recurrence.startsWith("custom:") ? data.recurrence.split(":")[1] : "60"
  );
  const [maxExecutions, setMaxExecutions] = useState<string>(
    data.max_executions?.toString() || ""
  );

  const handleSave = async () => {
    try {
      const [hours, minutes] = time.split(":");
      const dt = new Date(date);
      dt.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      if (dt <= new Date()) throw new Error("Time must be in the future");
      const iso = dt.toISOString();
      const finalRec =
        recurrence === "custom" ? `custom:${customInterval}` : recurrence;
      const maxExec = maxExecutions.trim()
        ? parseInt(maxExecutions, 10)
        : undefined;
      await updateSchedule(data.id, {
        scheduled_time: iso,
        recurrence: finalRec,
        max_executions: maxExec,
      });
      toast.success("Schedule updated");
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Adjust the schedule details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Date & Time */}
          <ScheduleDateTimePicker
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            disabled={loading}
          />
          {/* Recurrence + interval */}
          <ScheduleRecurrenceField
            recurrence={recurrence}
            customInterval={customInterval}
            onRecurrenceChange={setRecurrence}
            onIntervalChange={setCustomInterval}
            disabled={loading}
          />
          {/* Max Executions */}
          <div className="flex flex-col space-y-2">
            <Label>Max Executions</Label>
            <Input
              type="number"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              placeholder="Leave empty for unlimited"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
