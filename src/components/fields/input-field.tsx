import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CommonFieldProps } from "./types";

export interface InputFieldProps extends CommonFieldProps<string> {
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
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
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
