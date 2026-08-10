"use client";

import type { ReactNode } from "react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import {
    RadioGroup,
    RadioGroupItem,
} from "@packages/ui/components/radio-group";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfRadioGroupOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

type RhfRadioGroupProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof RadioGroup>,
    "name" | "value" | "onValueChange"
  > & {
    options?: RhfRadioGroupOption[];
  };

function RhfRadioGroup<
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
  options,
  children,
  ...radioGroupProps
}: RhfRadioGroupProps<TFieldValues, TName>) {
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
          <RadioGroup
            {...radioGroupProps}
            value={field.value}
            onValueChange={field.onChange}
            aria-invalid={fieldState.invalid}
          >
            {children ??
              options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <RadioGroupItem
                    value={option.value}
                    disabled={option.disabled}
                  />
                  {option.label}
                </label>
              ))}
          </RadioGroup>
        </FieldControl>
      )}
    />
  );
}

export { RhfRadioGroup };
export type { RhfRadioGroupOption, RhfRadioGroupProps };

