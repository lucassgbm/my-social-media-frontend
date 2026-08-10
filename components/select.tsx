import { SelectHTMLAttributes, useId } from "react";

type Option = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  className?: string;
  /** Rótulo visível. Se omitido, informe aria-label. */
  label?: string;
  error?: string;
  options: Option[];
};

/**
 * Campo de seleção com a mesma moldura do <Input>.
 *
 * Antes cada tela repetia o <select> com as classes na mão — e elas já haviam
 * divergido entre a edição de perfil e os filtros.
 */
export default function Select({
  className = "",
  label,
  error,
  id,
  options,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={selectId} className="font-semibold text-xs mb-2">
          {label}
        </label>
      )}

      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full text-sm p-3 rounded-field cursor-pointer
          bg-surface text-content
          border ${error ? "border-danger" : "border-line"}
          focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
          ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
