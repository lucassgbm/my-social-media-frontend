import { ReactNode } from "react";
import Button from "./button";

/**
 * Wrapper de compatibilidade sobre <Button variant="primary">.
 * Em código novo prefira usar Button diretamente.
 */
type ColorButtonProps = {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Classe de background customizada (ex.: "bg-red-500"). */
  bgColor?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
};

export default function ColorButton({
  className = "",
  onClick,
  children,
  bgColor,
  disabled,
  type = "button",
  ...rest
}: ColorButtonProps) {
  return (
    <Button
      variant="primary"
      size="icon"
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${bgColor ?? ""} ${className}`}
      {...rest}
    >
      {children}
    </Button>
  );
}
