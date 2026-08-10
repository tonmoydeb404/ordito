"use client";

import {
    Controller,
    type ControllerFieldState,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { FieldControl } from "@packages/ui/fields/core";
import type { RhfFieldProps } from "@packages/ui/fields/rhf/types";

type RhfControlledProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RhfFieldProps<TFieldValues, TName> & {
  /** Escape hatch for controls that don't fit the other Rhf* wrappers (IconPicker, CronEditor, date pickers, ...). */
  render: (
    field: ControllerRenderProps<TFieldValues, TName>,
    fieldState: ControllerFieldState,
  ) => React.ReactNode;
};

function RhfControlled<
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
  render,
}: RhfControlledProps<TFieldValues, TName>) {
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
          {render(field, fieldState)}
        </FieldControl>
      )}
    />
  );
}

export { RhfControlled };
export type { RhfControlledProps };

