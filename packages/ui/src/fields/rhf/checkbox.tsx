"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Checkbox } from "@packages/ui/components/checkbox";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfCheckboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof Checkbox>,
    "name" | "checked" | "onCheckedChange"
  >;

function RhfCheckbox<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  orientation = "horizontal",
  fieldClassName,
  disabled,
  id,
  ...checkboxProps
}: RhfCheckboxProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FieldControl
          label={label}
          description={description}
          orientation={orientation}
          className={fieldClassName}
          htmlFor={id ?? name}
          invalid={fieldState.invalid}
          errors={[fieldState.error]}
        >
          <Checkbox
            {...checkboxProps}
            id={id ?? name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            aria-invalid={fieldState.invalid}
          />
        </FieldControl>
      )}
    />
  );
}

export { RhfCheckbox };
export type { RhfCheckboxProps };

