"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Combobox } from "@packages/ui/components/combobox";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfComboboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<React.ComponentProps<typeof Combobox>, "name" | "value" | "onValueChange"> & {
    /** Compose ComboboxTrigger/ComboboxContent/etc. yourself, like `IconPicker`. */
    children: React.ReactNode;
  };

function RhfCombobox<
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
  children,
  ...comboboxProps
}: RhfComboboxProps<TFieldValues, TName>) {
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
          invalid={fieldState.invalid}
          errors={[fieldState.error]}
        >
          <Combobox
            {...comboboxProps}
            value={field.value}
            onValueChange={field.onChange}
          >
            {children}
          </Combobox>
        </FieldControl>
      )}
    />
  );
}

export { RhfCombobox };
export type { RhfComboboxProps };

