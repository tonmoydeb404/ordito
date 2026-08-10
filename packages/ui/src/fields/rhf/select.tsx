"use client";

import type { ReactNode } from "react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfSelectOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

type RhfSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof Select>,
    "name" | "value" | "onValueChange" | "children"
  > & {
    placeholder?: string;
    triggerClassName?: string;
    options?: RhfSelectOption[];
    /** Custom `SelectValue` render-prop, e.g. to look up a label from the raw value. */
    renderValue?: (value: string) => ReactNode;
    /** Full override for `SelectContent` — takes precedence over `options`. */
    children?: ReactNode;
  };

function RhfSelect<
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
  placeholder,
  triggerClassName,
  options,
  renderValue,
  children,
  ...selectProps
}: RhfSelectProps<TFieldValues, TName>) {
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
          <Select
            {...selectProps}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={triggerClassName ?? "w-full"}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder={placeholder}>{renderValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {children ??
                options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FieldControl>
      )}
    />
  );
}

export { RhfSelect };
export type { RhfSelectOption, RhfSelectProps };
