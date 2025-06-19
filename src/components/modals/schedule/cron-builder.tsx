import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { useCallback, useMemo } from "react";
import { MultiSelect } from "./multi-select";

interface CronBuilderProps {
  value?: string;
  onChange?: (cronString: string) => void;
  className?: string;
  resetValue?: string;
}

const MINUTES = Array.from({ length: 12 }, (_, i) => ({
  value: (i * 5).toString(),
  label: `${i * 5}`.padStart(2, "0"),
}));

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: `${i}:00 (${i === 0 ? "12" : i > 12 ? i - 12 : i}${
    i < 12 ? "AM" : "PM"
  })`,
}));

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function CronBuilder({
  value = "* * * * *",
  onChange,
  className,
  resetValue,
}: CronBuilderProps) {
  // Parse the cron value into component parts using useMemo
  const cronParts = useMemo(() => {
    const parts = value.split(" ");
    if (parts.length !== 5) {
      return {
        minute: "",
        hour: "",
        days: [] as string[],
        months: [] as string[],
        weekdays: [] as string[],
      };
    }

    return {
      minute: parts[0] === "*" ? "" : parts[0],
      hour: parts[1] === "*" ? "" : parts[1],
      // For multiselects: * means ALL options selected
      days: parts[2] === "*" ? DAYS.map((d) => d.value) : parts[2].split(","),
      months:
        parts[3] === "*" ? MONTHS.map((m) => m.value) : parts[3].split(","),
      weekdays:
        parts[4] === "*" ? WEEKDAYS.map((w) => w.value) : parts[4].split(","),
    };
  }, [value]);

  // Helper function to build cron string from individual parts
  const buildCronString = useCallback(
    (
      minute: string,
      hour: string,
      days: string[],
      months: string[],
      weekdays: string[]
    ) => {
      const minutePart = minute || "*";
      const hourPart = hour || "*";

      // For multiselects:
      // - Empty array = nothing specific selected (this would be invalid cron, so use *)
      // - All items = * (everything)
      // - Some items = comma-separated list
      const dayPart =
        days.length === 0
          ? "*" // Nothing selected = all (*)
          : days.length === DAYS.length
          ? "*" // Everything selected = all (*)
          : days.sort((a, b) => Number(a) - Number(b)).join(",");

      const monthPart =
        months.length === 0
          ? "*"
          : months.length === MONTHS.length
          ? "*"
          : months.sort((a, b) => Number(a) - Number(b)).join(",");

      const weekdayPart =
        weekdays.length === 0
          ? "*"
          : weekdays.length === WEEKDAYS.length
          ? "*"
          : weekdays.sort((a, b) => Number(a) - Number(b)).join(",");

      return `${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekdayPart}`;
    },
    []
  );

  // Update functions that directly call onChange with new cron string - memoized with useCallback
  const updateMinute = useCallback(
    (newMinute: string) => {
      const newCron = buildCronString(
        newMinute,
        cronParts.hour,
        cronParts.days,
        cronParts.months,
        cronParts.weekdays
      );
      onChange?.(newCron);
    },
    [
      buildCronString,
      cronParts.hour,
      cronParts.days,
      cronParts.months,
      cronParts.weekdays,
      onChange,
    ]
  );

  const updateHour = useCallback(
    (newHour: string) => {
      const newCron = buildCronString(
        cronParts.minute,
        newHour,
        cronParts.days,
        cronParts.months,
        cronParts.weekdays
      );
      onChange?.(newCron);
    },
    [
      buildCronString,
      cronParts.minute,
      cronParts.days,
      cronParts.months,
      cronParts.weekdays,
      onChange,
    ]
  );

  const updateDays = useCallback(
    (newDays: string[]) => {
      const newCron = buildCronString(
        cronParts.minute,
        cronParts.hour,
        newDays,
        cronParts.months,
        cronParts.weekdays
      );
      onChange?.(newCron);
    },
    [
      buildCronString,
      cronParts.minute,
      cronParts.hour,
      cronParts.months,
      cronParts.weekdays,
      onChange,
    ]
  );

  const updateMonths = useCallback(
    (newMonths: string[]) => {
      const newCron = buildCronString(
        cronParts.minute,
        cronParts.hour,
        cronParts.days,
        newMonths,
        cronParts.weekdays
      );
      onChange?.(newCron);
    },
    [
      buildCronString,
      cronParts.minute,
      cronParts.hour,
      cronParts.days,
      cronParts.weekdays,
      onChange,
    ]
  );

  const updateWeekdays = useCallback(
    (newWeekdays: string[]) => {
      const newCron = buildCronString(
        cronParts.minute,
        cronParts.hour,
        cronParts.days,
        cronParts.months,
        newWeekdays
      );
      onChange?.(newCron);
    },
    [
      buildCronString,
      cronParts.minute,
      cronParts.hour,
      cronParts.days,
      cronParts.months,
      onChange,
    ]
  );

  const reset = useCallback(() => {
    if (resetValue && onChange) {
      onChange(resetValue);
    } else {
      onChange?.("* * * * *");
    }
  }, [resetValue, onChange]);

  // Memoized description based on current cron parts
  const cronDescription = useMemo(() => {
    const parts = [];

    if (cronParts.minute) {
      parts.push(`at minute ${cronParts.minute}`);
    }

    if (cronParts.hour) {
      const hour = Number.parseInt(cronParts.hour);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      parts.push(`at ${displayHour}${ampm}`);
    }

    if (cronParts.days.length > 0) {
      if (cronParts.days.length === DAYS.length) {
        parts.push("every day of the month");
      } else {
        parts.push(`on day(s) ${cronParts.days.join(", ")}`);
      }
    }

    if (cronParts.months.length > 0) {
      if (cronParts.months.length === MONTHS.length) {
        parts.push("every month");
      } else {
        const monthLabels = cronParts.months
          .map((m) => MONTHS.find((month) => month.value === m)?.label)
          .filter(Boolean);
        parts.push(`in ${monthLabels.join(", ")}`);
      }
    }

    if (cronParts.weekdays.length > 0) {
      if (cronParts.weekdays.length === WEEKDAYS.length) {
        parts.push("every day of the week");
      } else {
        const weekdayLabels = cronParts.weekdays
          .map((w) => WEEKDAYS.find((weekday) => weekday.value === w)?.label)
          .filter(Boolean);
        parts.push(`on ${weekdayLabels.join(", ")}`);
      }
    }

    if (parts.length === 0) {
      return "Runs every minute";
    }

    return `Runs ${parts.join(" ")}`;
  }, [cronParts]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cron Expression Builder
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Select specific values for each time unit. Leave empty for "any" (*)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Minutes (5-minute intervals)</Label>
            <Select value={cronParts.minute} onValueChange={updateMinute}>
              <SelectTrigger>
                <SelectValue placeholder="Select minute..." />
              </SelectTrigger>
              <SelectContent>
                {MINUTES.map((minute) => (
                  <SelectItem key={minute.value} value={minute.value}>
                    {minute.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hours (0-23)</Label>
            <Select value={cronParts.hour} onValueChange={updateHour}>
              <SelectTrigger>
                <SelectValue placeholder="Select hour..." />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Days of Month (1-31)</Label>
            <MultiSelect
              options={DAYS}
              selected={cronParts.days}
              onChange={updateDays}
              placeholder="Select days..."
              showSelectAll={true}
            />
          </div>

          <div className="space-y-2">
            <Label>Months</Label>
            <MultiSelect
              options={MONTHS}
              selected={cronParts.months}
              onChange={updateMonths}
              placeholder="Select months..."
              showSelectAll={true}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Days of Week</Label>
            <MultiSelect
              options={WEEKDAYS}
              selected={cronParts.weekdays}
              onChange={updateWeekdays}
              placeholder="Select weekdays..."
              showSelectAll={true}
            />
          </div>
        </div>

        {/* Description */}
        <div className="pt-4 border-t">
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Description:</strong> {cronDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
