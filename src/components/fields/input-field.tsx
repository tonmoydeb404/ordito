import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputActionWrapper } from "./input-action-wrapper";
import { CommonFieldProps } from "./types";

export interface InputFieldProps extends CommonFieldProps<string> {
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function InputField({
  label,
  id,
  value,
  onChange,
  className = "",
  type = "text",
  placeholder,
  description,
  error,
  disabled = false,
  required = false,
  orientation = "vertical",
  encode = (v) => v,
  decode = (v) => v,
  leftAction,
  rightAction,
}: InputFieldProps) {
  const isInvalid = !!error;

  const handleChange = (newValue: string) => {
    onChange(encode(newValue));
  };

  return (
    <Field
      className={className}
      orientation={orientation}
      data-invalid={isInvalid}
      data-disabled={disabled}
    >
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      <InputActionWrapper leftAction={leftAction} rightAction={rightAction}>
        <Input
          id={id}
          type={type}
          value={decode(value)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={description ? `${id}-description` : undefined}
        />
      </InputActionWrapper>
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
