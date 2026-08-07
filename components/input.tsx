import { InputHTMLAttributes, useId } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
  /** Rótulo visível. Se omitido, informe aria-label. */
  label?: string;
  /** Mensagem de erro exibida abaixo do campo e anunciada por leitores de tela. */
  error?: string;
};

export default function Input({
  className = "",
  label,
  error,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col w-full">
      {/* label sem cor própria: herda do contexto (superfície clara ou painel escuro do login) */}
      {label && (
        <label htmlFor={inputId} className="font-semibold text-xs mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full text-sm p-3 rounded-field
          bg-surface text-content placeholder:text-content-subtle
          border ${error ? "border-danger" : "border-line"}
          focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
          ${className}`}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
