import { useMemo, useState } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@packages/ui/components/combobox";
import { Input } from "@packages/ui/components/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/tabs";

import {
  buildCronExpression,
  CRON_FIELD_CONFIGS,
  describeCron,
  parseCronExpression,
  type CronFieldConfig,
  type CronFieldState,
} from "@/lib/cron";
import { cn } from "@/lib/utils";

function fieldItems(config: CronFieldConfig): string[] {
  return [
    EVERY_LABEL,
    ...(config.names ??
      Array.from({ length: config.max - config.min + 1 }, (_, i) =>
        String(config.min + i),
      )),
  ];
}

function valueToLabel(value: number, config: CronFieldConfig): string {
  return config.names ? config.names[value - config.min] : String(value);
}

function labelToValue(label: string, config: CronFieldConfig): number {
  return config.names
    ? config.min + config.names.indexOf(label)
    : Number(label);
}

// sentinel option representing "*" so it can live inside the same combobox as specific values
const EVERY_LABEL = "Every";

function CronFieldRow({
  config,
  state,
  onChange,
}: {
  config: CronFieldConfig;
  state: CronFieldState;
  onChange: (state: CronFieldState) => void;
}) {
  const isEvery = state.type === "every";
  const selectedLabels = isEvery
    ? [EVERY_LABEL]
    : state.type === "list"
      ? state.values.map((v) => valueToLabel(v, config))
      : [];

  function handleValueChange(labels: string[]) {
    const hasEvery = labels.includes(EVERY_LABEL);
    const values = labels.filter((label) => label !== EVERY_LABEL);

    // selecting "Every" while other values are picked replaces them; picking a
    // specific value while "Every" was active drops it. Clearing everything falls back to "Every".
    if ((hasEvery && !isEvery) || values.length === 0) {
      onChange({ type: "every" });
    } else {
      onChange({
        type: "list",
        values: values.map((label) => labelToValue(label, config)),
      });
    }
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-[0.68rem] font-[760] text-faint">
        {config.label}
      </span>

      <Combobox
        items={fieldItems(config)}
        multiple
        value={selectedLabels}
        onValueChange={handleValueChange}
      >
        <ComboboxChips>
          <ComboboxValue>
            {(labels: string[]) =>
              labels.map((label) => (
                <ComboboxChip key={label}>{label}</ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Add value" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No matches.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {state.type === "custom" && (
        <span className="text-[0.68rem] text-faint">
          Custom value <span className="font-mono">{state.raw}</span> — edit in
          Advanced tab.
        </span>
      )}
    </div>
  );
}

export function CronEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed = useMemo(() => parseCronExpression(value), [value]);
  const [tab, setTab] = useState<"builder" | "advanced">(
    parsed ? "builder" : "advanced",
  );

  const description = useMemo(() => describeCron(value), [value]);

  function handleFieldChange(index: number, nextState: CronFieldState) {
    const base =
      parsed ??
      CRON_FIELD_CONFIGS.map((): CronFieldState => ({ type: "every" }));
    const next = [...base];
    next[index] = nextState;
    onChange(buildCronExpression(next));
  }

  function handleTabChange(next: string) {
    // switching to Builder can't display an expression it can't parse, so reset it
    if (next === "builder" && !parsed) {
      onChange(
        buildCronExpression(
          CRON_FIELD_CONFIGS.map((): CronFieldState => ({ type: "every" })),
        ),
      );
    }
    setTab(next as typeof tab);
  }

  return (
    <div className="grid gap-2">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="grid gap-3 pt-3">
          {parsed &&
            CRON_FIELD_CONFIGS.map((config, i) => (
              <CronFieldRow
                key={config.key}
                config={config}
                state={parsed[i]}
                onChange={(state) => handleFieldChange(i, state)}
              />
            ))}
        </TabsContent>

        <TabsContent value="advanced" className="pt-3">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono"
            placeholder="0 0 9 * * 1-5"
          />
        </TabsContent>
      </Tabs>

      <p
        className={cn(
          "text-[0.72rem]",
          description.ok ? "text-faint" : "text-destructive",
        )}
      >
        {description.ok ? description.text : "Invalid cron expression"}
      </p>
    </div>
  );
}
