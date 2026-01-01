import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import * as React from "react";

interface FieldSelectorProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: number[];
}

export function FieldSelector({
  label,
  value,
  onChange,
  options,
}: FieldSelectorProps) {
  const [mode, setMode] = React.useState<"every" | "step" | "range" | "custom">(
    value === "*"
      ? "every"
      : value.includes("/")
      ? "step"
      : value.includes("-")
      ? "range"
      : "custom"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <Label className="text-sm font-semibold text-foreground/80">
          {label} Selection Mode
        </Label>
        <div className="inline-flex p-1 bg-muted/50 rounded-lg border shadow-sm">
          {["every", "step", "range", "custom"].map((m) => (
            <Button
              key={m}
              variant={mode === m ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setMode(m as any);
                if (m === "every") onChange("*");
              }}
              className={`capitalize text-[11px] h-7 px-3 rounded-md transition-all ${
                mode === m
                  ? "bg-background shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
        {mode === "every" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Expression will trigger{" "}
              <span className="font-bold text-primary">
                every {label.toLowerCase().slice(0, -1)}
              </span>{" "}
              without restriction.
            </p>
          </div>
        )}
        {mode === "step" && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
            <div className="space-y-1.5 flex-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Interval
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Every</span>
                <Input
                  type="number"
                  className="w-24 h-10 font-mono text-center text-lg focus-visible:ring-primary"
                  defaultValue={value.split("/")[1] || "1"}
                  min={1}
                  max={options[options.length - 1]}
                  onChange={(e) => onChange(`*/${e.target.value}`)}
                />
                <span className="text-sm font-medium">
                  {label.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        )}
        {mode === "range" && (
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Start {label}
              </Label>
              <Input
                type="number"
                className="h-10 font-mono text-lg focus-visible:ring-primary"
                placeholder="0"
                min={options[0]}
                max={options[options.length - 1]}
                onChange={(e) =>
                  onChange(
                    `${e.target.value}-${
                      value.split("-")[1] || options[options.length - 1]
                    }`
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                End {label}
              </Label>
              <Input
                type="number"
                className="h-10 font-mono text-lg focus-visible:ring-primary"
                placeholder={options[options.length - 1].toString()}
                min={options[0]}
                max={options[options.length - 1]}
                onChange={(e) =>
                  onChange(
                    `${value.split("-")[0] || options[0]}-${e.target.value}`
                  )
                }
              />
            </div>
          </div>
        )}
        {mode === "custom" && (
          <div className="space-y-2 p-4 rounded-xl bg-muted/30 border">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Expression Pattern
            </Label>
            <Input
              className="font-mono h-12 text-lg focus-visible:ring-primary tracking-widest"
              placeholder="e.g. 1,2,5 or 1-10/2"
              value={value === "*" ? "" : value}
              onChange={(e) => onChange(e.target.value || "*")}
            />
            <p className="text-[10px] text-muted-foreground">
              Use commas for lists, dashes for ranges, and slashes for steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
