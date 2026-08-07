import { ReactNode } from "react";
import Button from "./button";

/**
 * Wrapper de compatibilidade sobre <Button variant="outline">.
 * Em código novo prefira usar Button diretamente.
 */
type BorderButtonProps = {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export default function BorderButton({
  className = "",
  onClick,
  children,
  disabled,
  ...rest
}: BorderButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}
