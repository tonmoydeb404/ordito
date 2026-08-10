"use client";

import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Textarea } from "@packages/ui/components/textarea";
import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof Textarea>,
    "name" | "defaultValue" | "form"
  >;

function RhfTextarea<
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
  ...textareaProps
}: RhfTextareaProps<TFieldValues, TName>) {
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
          <Textarea
            {...textareaProps}
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

export { RhfTextarea };
export type { RhfTextareaProps };

