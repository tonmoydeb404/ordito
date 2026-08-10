"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Input } from "@packages/ui/components/input";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue" | "form">;

function RhfInput<
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
  id,
  ...inputProps
}: RhfInputProps<TFieldValues, TName>) {
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
          <Input
            {...inputProps}
            {...field}
            id={id ?? name}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
        </FieldControl>
      )}
    />
  );
}

export { RhfInput };
export type { RhfInputProps };

