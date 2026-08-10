import type { Control, FieldPath, FieldValues } from "react-hook-form";

type RhfOrientation = "vertical" | "horizontal" | "responsive";

// Shared prop shape for every Rhf* field wrapper.
type RhfFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  orientation?: RhfOrientation;
  fieldClassName?: string;
  disabled?: boolean;
};

export type { RhfFieldProps, RhfOrientation };
