"use client";

import {
  TextareaField,
  TextareaFieldProps,
} from "@/components/fields/textarea-field";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface FormTextareaFieldProps<T extends FieldValues>
  extends Omit<TextareaFieldProps, "value" | "onChange" | "id"> {
  name: FieldPath<T>;
}

export function FormTextareaField<T extends FieldValues>(
  props: FormTextareaFieldProps<T>
) {
  const { name, ...others } = props;
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextareaField
          id={name}
          value={field.value ?? ""}
          onChange={field.onChange}
          error={error?.message}
          {...others}
        />
      )}
    />
  );
}
