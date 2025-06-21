import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  recurrence: string;
  customInterval: string;
  onRecurrenceChange: (value: string) => void;
  onIntervalChange: (value: string) => void;
  disabled?: boolean;
}

export default function ScheduleRecurrenceField({
  recurrence,
  customInterval,
  onRecurrenceChange,
  onIntervalChange,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col space-y-2">
      <Label>Recurrence</Label>
      <Select
        value={recurrence}
        onValueChange={onRecurrenceChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recurrence" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="once">Once</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="custom">Custom Interval</SelectItem>
        </SelectContent>
      </Select>
      {recurrence === "custom" && (
        <Input
          type="number"
          value={customInterval}
          onChange={(e) => onIntervalChange(e.target.value)}
          placeholder="Interval (minutes)"
          disabled={disabled}
        />
      )}
    </div>
  );
}
