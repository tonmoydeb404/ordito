"use client";

import { InputField, InputFieldProps } from "@/components/fields/input-field";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

interface FormInputFieldProps<T extends FieldValues>
  extends Omit<InputFieldProps, "value" | "onChange" | "id"> {
  name: FieldPath<T>;
}

export function FormInputField<T extends FieldValues>(
  props: FormInputFieldProps<T>
) {
  const { name, ...others } = props;
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputField
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
