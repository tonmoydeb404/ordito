import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { CommonFieldProps } from "./types";

export interface TextareaFieldProps extends CommonFieldProps<string> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextareaField({
  label,
  id,
  value,
  onChange,
  className = "",
  placeholder,
  rows,
  description,
  error,
  disabled = false,
  required = false,
  orientation = "vertical",
  encode = (v) => v,
  decode = (v) => v,
}: TextareaFieldProps) {
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
      <Textarea
        id={id}
        value={decode(value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
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
