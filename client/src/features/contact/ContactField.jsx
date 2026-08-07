import { cn } from "../../lib/cn";

const FIELD_CLASSES =
  "w-full min-h-11 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-(--color-text-primary) placeholder:text-(--color-text-muted)";

/**
 * A labeled contact-form field (input or textarea) with an always-visible
 * label and an accessible, field-level error message.
 * @param {{
 *   id: string,
 *   label: string,
 *   as?: "input" | "textarea",
 *   type?: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: string,
 *   required?: boolean,
 *   rows?: number,
 *   maxLength?: number,
 *   autoComplete?: string,
 * }} props
 */
export function ContactField({
  id,
  label,
  as = "input",
  type = "text",
  value,
  onChange,
  error,
  required = true,
  rows,
  maxLength,
  autoComplete,
}) {
  const errorId = `${id}-error`;
  const Field = as;

  return (
    <div>
      <label htmlFor={id} className="label block text-(--color-text-muted)">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <Field
        id={id}
        name={id}
        type={as === "input" ? type : undefined}
        rows={as === "textarea" ? (rows ?? 6) : undefined}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          FIELD_CLASSES,
          "mt-2",
          error && "border-(--color-danger)",
        )}
      />
      {error ? (
        <p id={errorId} className="body-sm mt-1.5 text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  );
}
