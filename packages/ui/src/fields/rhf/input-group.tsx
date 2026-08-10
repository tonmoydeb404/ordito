"use client";

import type { ReactNode } from "react";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@packages/ui/components/input-group";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfInputGroupProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "name" | "defaultValue" | "form"
  > & {
    startAddon?: ReactNode;
    endAddon?: ReactNode;
  };

function RhfInputGroup<
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
  startAddon,
  endAddon,
  ...inputProps
}: RhfInputGroupProps<TFieldValues, TName>) {
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
          <InputGroup>
            {startAddon ? (
              <InputGroupAddon align="inline-start">
                {startAddon}
              </InputGroupAddon>
            ) : null}
            <InputGroupInput
              {...inputProps}
              {...field}
              id={id ?? name}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
            />
            {endAddon ? (
              <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon>
            ) : null}
          </InputGroup>
        </FieldControl>
      )}
    />
  );
}

export { RhfInputGroup };
export type { RhfInputGroupProps };

