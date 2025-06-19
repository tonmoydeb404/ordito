import { Button as Btn } from "@/components/ui/button";
import {
  Dialog as D,
  DialogContent as DC,
  DialogDescription as DD,
  DialogFooter as DF,
  DialogHeader as DH,
  DialogTitle as DT,
} from "@/components/ui/dialog";
import { Input as Inp } from "@/components/ui/input";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TSchedule } from "@/types/command";
import { useState } from "react";
import { toast as Toast } from "sonner";
import ScheduleDateTimePicker from "./date-field";
import ScheduleRecurrenceField from "./recurrence-field";

export function ScheduleUpdateModal({
  isOpen,
  close,
  data,
}: TModalProps<TSchedule>) {
  if (!data) return null;
  const { updateSchedule, loading } = useScheduleMutations();
  const initDate = new Date(data.scheduled_time);
  const [date, setDate] = useState(initDate);
  const [time, setTime] = useState(initDate.toISOString().slice(11, 16));
  const [recurrence, setRecurrence] = useState(
    data.recurrence.startsWith("custom:") ? "custom" : data.recurrence
  );
  const [customInterval, setCustomInterval] = useState(
    data.recurrence.startsWith("custom:") ? data.recurrence.split(":")[1] : "60"
  );
  const [maxExecutions, setMaxExecutions] = useState(
    data.max_executions?.toString() || ""
  );

  const handleSave = async () => {
    try {
      const [h, m] = time.split(":");
      const dt = new Date(date);
      dt.setHours(+h, +m);
      if (dt <= new Date()) throw new Error("Time must be in the future");
      const iso = dt.toISOString();
      const finalRec =
        recurrence === "custom" ? `custom:${customInterval}` : recurrence;
      const maxExec = maxExecutions.trim() ? +maxExecutions : undefined;
      await updateSchedule(data.id, {
        group_id: data.group_id,
        command_id: data.command_id ?? null,
        scheduled_time: iso,
        recurrence: finalRec,
        max_executions: maxExec,
      });
      Toast.success("Schedule updated");
      close();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <D open={isOpen} onOpenChange={() => !loading && close()}>
      <DC className="max-w-md">
        <DH>
          <DT>Edit Schedule</DT>
          <DD>Adjust schedule details.</DD>
        </DH>
        <div className="grid gap-4">
          <ScheduleDateTimePicker
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            disabled={loading}
          />
          <ScheduleRecurrenceField
            recurrence={recurrence}
            customInterval={customInterval}
            onRecurrenceChange={setRecurrence}
            onIntervalChange={setCustomInterval}
            disabled={loading}
          />
          <label className="flex flex-col space-y-1">
            <span>Max Executions</span>
            <Inp
              type="number"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
        <DF className="space-x-2">
          <Btn variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} disabled={loading}>
            Save
          </Btn>
        </DF>
      </DC>
    </D>
  );
}
