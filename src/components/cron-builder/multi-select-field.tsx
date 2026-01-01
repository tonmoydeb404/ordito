import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultiSelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
}

export function MultiSelectField({
  label,
  value,
  onChange,
  options,
}: MultiSelectFieldProps) {
  const selected =
    value === "*"
      ? options.map((o) => o.value)
      : value.split(",").map((v) => Number.parseInt(v));

  const toggle = (val: number) => {
    let newSelected: number[];
    if (selected.includes(val)) {
      newSelected = selected.filter((v) => v !== val);
    } else {
      newSelected = [...selected, val].sort((a, b) => a - b);
    }

    if (newSelected.length === 0 || newSelected.length === options.length) {
      onChange("*");
    } else {
      onChange(newSelected.join(","));
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {options.map((opt) => (
        <div
          key={opt.value}
          className="flex items-center space-x-2 border p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => toggle(opt.value)}
        >
          <Checkbox checked={selected.includes(opt.value)} />
          <Label className="text-xs cursor-pointer">{opt.label}</Label>
        </div>
      ))}
    </div>
  );
}
