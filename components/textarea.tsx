import { TextareaHTMLAttributes, useId } from "react";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  className?: string;
  label?: string;
  error?: string;
  /** Exibe contador de caracteres quando maxLength é informado. */
  showCount?: boolean;
};

export default function Textarea({
  className = "",
  label,
  error,
  id,
  showCount,
  maxLength,
  value,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={fieldId} className="font-semibold text-xs mb-2">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full text-sm p-3 rounded-field resize-y
          bg-surface text-content placeholder:text-content-subtle
          border ${error ? "border-danger" : "border-line"}
          focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
          ${className}`}
        {...rest}
      />
      <div className="flex justify-between gap-2 mt-1">
        {error ? (
          <span id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </span>
        ) : (
          <span />
        )}
        {showCount && maxLength ? (
          <span className="text-xs opacity-70">
            {`${String(value ?? "").length}/${maxLength}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}
