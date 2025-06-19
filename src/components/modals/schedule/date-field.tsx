import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface Props {
  date: Date;
  time: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export default function ScheduleDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
}: Props) {
  return (
    <>
      <div className="flex flex-col space-y-2">
        <Label>Date</Label>
        <Popover>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            data-empty={!date}
            disabled={disabled}
            asChild
          >
            <PopoverTrigger>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </PopoverTrigger>
          </Button>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              required
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col space-y-2">
        <Label>Time</Label>
        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  );
}
