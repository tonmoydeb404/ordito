import { Icon } from "@iconify/react";
import { SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatIconLabel, searchIconifyIcons } from "@/lib/iconify-icons";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@packages/ui/components/combobox";

type IconPickerProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
};

export function IconPreview({
  iconKey,
  className = "size-5",
}: {
  iconKey: string | null | undefined;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [iconKey]);

  if (!iconKey) {
    return <SquareTerminal className={className} strokeWidth={1.75} />;
  }

  return (
    <span className={cn("relative inline-grid place-items-center", className)}>
      {/* shown until the icon data resolves (or forever if offline/uncached) */}
      {!loaded && (
        <SquareTerminal
          className={cn(className, "absolute inset-0")}
          strokeWidth={1.75}
        />
      )}
      <Icon
        icon={iconKey}
        className={className}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}

export function IconPicker({
  value,
  onValueChange,
  disabled,
}: IconPickerProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebouncedValue(inputValue.trim(), 300);
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    searchIconifyIcons(debouncedQuery, controller.signal)
      .then((icons) => {
        setResults(icons);
        setStatus("idle");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus("error");
        console.error(err);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <Combobox
      items={results}
      filteredItems={results}
      value={value}
      onValueChange={(next) => onValueChange((next as string | null) ?? null)}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringLabel={(key: string) => formatIconLabel(key)}
      disabled={disabled}
    >
      <div className="flex items-center gap-1">
        <ComboboxTrigger
          className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-input/30 px-3 text-sm text-ink data-placeholder:text-muted-foreground"
          disabled={disabled}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <IconPreview iconKey={value} className="size-4 shrink-0" />
            <span className="truncate">
              {value ? formatIconLabel(value) : "Choose icon"}
            </span>
          </span>
        </ComboboxTrigger>
        {value && <ComboboxClear aria-label="Clear icon" disabled={disabled} />}
      </div>
      <ComboboxContent>
        <ComboboxInput placeholder="Search icons…" showTrigger={false} />
        <ComboboxEmpty>
          {status === "loading"
            ? "Searching…"
            : status === "error"
              ? "Couldn't reach icon search — check your connection."
              : debouncedQuery
                ? "No matching icons."
                : "Type to search icons."}
        </ComboboxEmpty>
        <ComboboxList className="grid grid-cols-8 gap-1">
          <ComboboxCollection>
            {(key: string) => (
              <ComboboxItem
                key={key}
                value={key}
                title={formatIconLabel(key)}
                className="aspect-square w-auto flex-col gap-0 rounded-md p-1.5 pr-1.5 items-center justify-center"
              >
                <IconPreview iconKey={key} className="size-5" />
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
