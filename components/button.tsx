import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Obrigatório quando o botão tem apenas ícone: descreve a ação para leitores de tela. */
  "aria-label"?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "bg-surface-3 text-content hover:bg-line-strong",
  ghost: "bg-transparent text-content hover:bg-surface-3",
  outline:
    "bg-transparent text-brand border-2 border-brand hover:bg-brand-subtle",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
};

export default function Button({
  className = "",
  variant = "secondary",
  size = "icon",
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // type explícito evita submit acidental quando o botão está dentro de <form>
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-medium
        transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
