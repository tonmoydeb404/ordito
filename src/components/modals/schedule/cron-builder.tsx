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
import {
  DAYS,
  getCronDescription,
  HOURS,
  MINUTES,
  MONTHS,
  WEEKDAYS,
} from "./helpers";
import { MultiSelect } from "./multi-select";

interface CronBuilderProps {
  value?: string;
  onChange?: (cronString: string) => void;
  className?: string;
  resetValue?: string;
}

export function CronBuilder({
  value = "0 0 0 * * *",
  onChange,
  className,
  resetValue,
}: CronBuilderProps) {
  // Parse the cron value into component parts using useMemo
  const cronParts = useMemo(() => {
    const parts = value.split(" ");
    if (parts.length !== 6) {
      return {
        second: "",
        minute: "",
        hour: "",
        days: [] as string[],
        months: [] as string[],
        weekdays: [] as string[],
      };
    }

    return {
      second: parts[0] === "*" ? "" : parts[0],
      minute: parts[1] === "*" ? "" : parts[1],
      hour: parts[2] === "*" ? "" : parts[2],
      // For multiselects: * means ALL options selected
      days: parts[3] === "*" ? DAYS.map((d) => d.value) : parts[3].split(","),
      months:
        parts[4] === "*" ? MONTHS.map((m) => m.value) : parts[4].split(","),
      weekdays:
        parts[5] === "*" ? WEEKDAYS.map((w) => w.value) : parts[5].split(","),
    };
  }, [value]);

  // Helper function to build cron string from individual parts
  const buildCronString = useCallback(
    (
      second: string,
      minute: string,
      hour: string,
      days: string[],
      months: string[],
      weekdays: string[]
    ) => {
      const secondPart = second || "0";
      const minutePart = minute || "0";
      const hourPart = hour || "0";

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

      return `${secondPart} ${minutePart} ${hourPart} ${dayPart} ${monthPart} ${weekdayPart}`;
    },
    []
  );

  // Update functions that directly call onChange with new cron string - memoized with useCallback
  const updateMinute = useCallback(
    (newMinute: string) => {
      const newCron = buildCronString(
        cronParts.second,
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
      cronParts.second,
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
        cronParts.second,
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
      cronParts.second,
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
        cronParts.second,
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
      cronParts.second,
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
        cronParts.second,
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
      cronParts.second,
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
        cronParts.second,
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
      cronParts.second,
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
      onChange?.("0 0 0 * * *");
    }
  }, [resetValue, onChange]);

  // Memoized description based on current cron parts
  const cronDescription = useMemo(() => {
    return getCronDescription(value);
  }, [value]);

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
