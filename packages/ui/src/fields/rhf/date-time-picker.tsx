"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Button } from "@packages/ui/components/button";
import { Calendar } from "@packages/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/popover";
import { ScrollArea, ScrollBar } from "@packages/ui/components/scroll-area";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";
import { cn } from "@packages/ui/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => 12 - i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type RhfDateTimePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> & {
  placeholder?: string;
  buttonClassName?: string;
  fromDate?: Date;
  toDate?: Date;
};

// Stores/reads the field as an ISO 8601 string, matching how the rest of the app persists dates.
function RhfDateTimePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  orientation,
  fieldClassName,
  disabled,
  placeholder = "Pick a date & time",
  buttonClassName,
  fromDate,
  toDate,
}: RhfDateTimePickerProps<TFieldValues, TName>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const value: Date | undefined = field.value
          ? new Date(field.value)
          : undefined;

        const commit = (next: Date) => field.onChange(next.toISOString());

        const handleDateSelect = (selected: Date | undefined) => {
          if (!selected) return;
          const next = value ? new Date(value) : new Date();
          next.setFullYear(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate(),
          );
          commit(next);
        };

        const handleTimeChange = (
          type: "hour" | "minute" | "ampm",
          timeValue: string,
        ) => {
          const next = value ? new Date(value) : new Date();
          if (type === "hour") {
            const hours = parseInt(timeValue, 10) % 12;
            next.setHours(hours + (next.getHours() >= 12 ? 12 : 0));
          } else if (type === "minute") {
            next.setMinutes(parseInt(timeValue, 10));
          } else {
            const hours = next.getHours() % 12;
            next.setHours(timeValue === "PM" ? hours + 12 : hours);
          }
          commit(next);
        };

        return (
          <FieldControl
            label={label}
            description={description}
            orientation={orientation}
            className={fieldClassName}
            invalid={fieldState.invalid}
            errors={[fieldState.error]}
          >
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value && "text-muted-foreground",
                      buttonClassName,
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 size-4" />
                {value ? formatDateTime(value) : placeholder}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                  <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleDateSelect}
                    startMonth={fromDate}
                    endMonth={toDate}
                    disabled={[
                      ...(fromDate ? [{ before: fromDate }] : []),
                      ...(toDate ? [{ after: toDate }] : []),
                    ]}
                  />
                  <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex p-2 sm:flex-col">
                        {HOURS.map((hour) => (
                          <Button
                            key={hour}
                            type="button"
                            size="icon"
                            variant={
                              value && value.getHours() % 12 === hour % 12
                                ? "default"
                                : "ghost"
                            }
                            className="aspect-square shrink-0 sm:w-full"
                            onClick={() =>
                              handleTimeChange("hour", hour.toString())
                            }
                          >
                            {hour}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex p-2 sm:flex-col">
                        {MINUTES.map((minute) => (
                          <Button
                            key={minute}
                            type="button"
                            size="icon"
                            variant={
                              value && value.getMinutes() === minute
                                ? "default"
                                : "ghost"
                            }
                            className="aspect-square shrink-0 sm:w-full"
                            onClick={() =>
                              handleTimeChange("minute", minute.toString())
                            }
                          >
                            {minute}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>
                    <ScrollArea>
                      <div className="flex p-2 sm:flex-col">
                        {(["AM", "PM"] as const).map((ampm) => (
                          <Button
                            key={ampm}
                            type="button"
                            size="icon"
                            variant={
                              value &&
                              ((ampm === "AM" && value.getHours() < 12) ||
                                (ampm === "PM" && value.getHours() >= 12))
                                ? "default"
                                : "ghost"
                            }
                            className="aspect-square shrink-0 sm:w-full"
                            onClick={() => handleTimeChange("ampm", ampm)}
                          >
                            {ampm}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </FieldControl>
        );
      }}
    />
  );
}

export { RhfDateTimePicker };
export type { RhfDateTimePickerProps };
