"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Switch } from "@packages/ui/components/switch";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfSwitchProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof Switch>,
    "name" | "checked" | "onCheckedChange"
  >;

function RhfSwitch<
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
  ...switchProps
}: RhfSwitchProps<TFieldValues, TName>) {
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
          <Switch
            {...switchProps}
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

export { RhfSwitch };
export type { RhfSwitchProps };

