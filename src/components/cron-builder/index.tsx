"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, Copy } from "lucide-react";

import * as React from "react";

import { Label } from "../ui/label";
import { FieldSelector } from "./field-selector";
import { MultiSelectField } from "./multi-select-field";
import {
  CronBuilderProps,
  DAYS_OF_MONTH,
  DAYS_OF_WEEK,
  HOURS,
  MINUTES,
  MONTHS,
  SECONDS,
} from "./types";

export function CronBuilder({
  defaultValue = "0 0 * * * *",
  onChange,
}: CronBuilderProps) {
  const [fields, setFields] = React.useState({
    seconds: "0",
    minute: "0",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  });
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const [seconds, minute, hour, dayOfMonth, month, dayOfWeek] = defaultValue
      .trim()
      .split(" ");
    setFields({
      seconds: seconds || "0",
      minute: minute || "0",
      hour: hour || "*",
      dayOfMonth: dayOfMonth || "*",
      month: month || "*",
      dayOfWeek: dayOfWeek || "*",
    });
  }, [defaultValue]);

  const cronString = React.useMemo(() => {
    return `${fields.seconds} ${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;
  }, [fields]);

  React.useEffect(() => {
    try {
      setError(null);
      onChange?.(cronString);
    } catch (err: any) {
      setError(err.message);
    }
  }, [cronString]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (field: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 border-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Expression</AlertTitle>
          <AlertDescription className="text-xs font-mono">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg">Schedule Configuration</CardTitle>
          <CardDescription>
            Select the frequency for each component.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="minute" className="w-full">
            <TabsList className="grid grid-cols-6 w-full bg-secondary/50">
              <TabsTrigger value="seconds">Second</TabsTrigger>
              <TabsTrigger value="minute">Minute</TabsTrigger>
              <TabsTrigger value="hour">Hour</TabsTrigger>
              <TabsTrigger value="dayOfMonth">Day</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="dayOfWeek">Weekday</TabsTrigger>
            </TabsList>

            <TabsContent value="seconds" className="space-y-4 pt-4">
              <FieldSelector
                label="Seconds"
                value={fields.seconds}
                onChange={(val) => updateField("seconds", val)}
                options={SECONDS}
              />
            </TabsContent>
            <TabsContent value="minute" className="space-y-4 pt-4">
              <FieldSelector
                label="Minutes"
                value={fields.minute}
                onChange={(val) => updateField("minute", val)}
                options={MINUTES}
              />
            </TabsContent>
            <TabsContent value="hour" className="space-y-4 pt-4">
              <FieldSelector
                label="Hours"
                value={fields.hour}
                onChange={(val) => updateField("hour", val)}
                options={HOURS}
              />
            </TabsContent>
            <TabsContent value="dayOfMonth" className="space-y-4 pt-4">
              <FieldSelector
                label="Day of Month"
                value={fields.dayOfMonth}
                onChange={(val) => updateField("dayOfMonth", val)}
                options={DAYS_OF_MONTH}
              />
            </TabsContent>
            <TabsContent value="month" className="space-y-4 pt-4">
              <MultiSelectField
                label="Months"
                value={fields.month}
                onChange={(val) => updateField("month", val)}
                options={MONTHS}
              />
            </TabsContent>
            <TabsContent value="dayOfWeek" className="space-y-4 pt-4">
              <MultiSelectField
                label="Days of Week"
                value={fields.dayOfWeek}
                onChange={(val) => updateField("dayOfWeek", val)}
                options={DAYS_OF_WEEK}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20 overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <Label className="text-xs uppercase font-bold text-muted-foreground">
              Generated Cron String
            </Label>
            <div className="flex items-center justify-between bg-background border rounded-lg p-4 font-mono text-2xl text-primary">
              <span className="truncate">{cronString}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
