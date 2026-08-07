import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children?: ReactNode;
  gradient?: boolean;
}

/** Superfície de nível 2 — usada dentro de um Container. */
export default function Card({ className = "", gradient, children }: CardProps) {
  return (
    <div
      className={`
            ${gradient
          ? "bg-gradient-to-br from-surface-2 to-surface-3"
          : "bg-surface-2"}
            text-content
            border border-line
            rounded-card
            p-2
            ${className}`}
    >
      {children}
    </div>
  );
}
