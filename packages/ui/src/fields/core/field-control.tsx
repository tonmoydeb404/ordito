import type { ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@packages/ui/components/field";

type FieldControlProps = Omit<
  React.ComponentProps<typeof Field>,
  "children"
> & {
  label?: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  invalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  children: ReactNode;
};

// Composes Field/FieldLabel/FieldContent/FieldDescription/FieldError so every
// Rhf* wrapper doesn't have to repeat this layout by hand.
function FieldControl({
  label,
  description,
  htmlFor,
  invalid,
  errors,
  orientation = "vertical",
  children,
  ...props
}: FieldControlProps) {
  const isHorizontal = orientation === "horizontal";
  const labelNode = label ? (
    <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
  ) : null;
  const descriptionNode = description ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null;

  return (
    <Field data-invalid={invalid} orientation={orientation} {...props}>
      {isHorizontal ? (
        <>
          {(labelNode || descriptionNode) && (
            <FieldContent>
              {labelNode}
              {descriptionNode}
            </FieldContent>
          )}
          {children}
        </>
      ) : (
        <>
          {labelNode}
          {children}
          {descriptionNode}
        </>
      )}
      {invalid ? <FieldError errors={errors} /> : null}
    </Field>
  );
}

export { FieldControl };
export type { FieldControlProps };

