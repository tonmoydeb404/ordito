import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  showSelectAll?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  showSelectAll = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  // const handleRemove = (value: string) => {
  //   onChange(selected.filter((item) => item !== value));
  // };

  const selectedLabels = selected.map(
    (value) => options.find((option) => option.value === value)?.label || value
  );
  const isAllSelected = selected.length === options.length;

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
          asChild
        >
          <PopoverTrigger>
            <div className="flex flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : isAllSelected ? (
                <Badge variant="secondary" className="text-xs">
                  All Selected
                </Badge>
              ) : (
                <>
                  {selectedLabels.slice(0, 3).map((label, index) => (
                    <Badge
                      key={selected[index]}
                      variant="secondary"
                      className="text-xs"
                    >
                      {label}
                    </Badge>
                  ))}
                  {selected.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selected.length - 3} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
        </Button>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {showSelectAll && (
                  <>
                    <CommandItem onSelect={handleSelectAll}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isAllSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {isAllSelected ? "Deselect All" : "Select All"}
                    </CommandItem>
                    <CommandSeparator />
                  </>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
