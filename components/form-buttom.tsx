import Button from "./button";
import LoadingSpinner from "./loading-spinner";

/**
 * Botão de formulário. Wrapper de compatibilidade sobre <Button variant="primary">.
 * Em código novo prefira usar Button diretamente.
 */
interface FormButtomProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type: "submit" | "button";
  /** Desabilita o botão e exibe spinner — evita duplo submit. */
  loading?: boolean;
  disabled?: boolean;
}

export default function FormButtom({
  className = "",
  onClick,
  label,
  type,
  loading = false,
  disabled = false,
}: FormButtomProps) {
  return (
    <Button
      type={type}
      variant="primary"
      size="md"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`rounded-field font-semibold ${className}`}
    >
      {loading && <LoadingSpinner />}
      {label}
    </Button>
  );
}
