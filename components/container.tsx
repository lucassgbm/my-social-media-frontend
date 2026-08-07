import { ReactNode } from "react";

interface ContainerProps {
    className?: string;
    children?: ReactNode;
    transparent?: boolean;
    padding?: string;
    /** Elemento HTML renderizado (ex.: "section", "aside"). Padrão: div. */
    as?: "div" | "section" | "aside" | "article";
}

/** Superfície de nível 1 — o bloco padrão de conteúdo da aplicação. */
export default function Container({
    className = "",
    children,
    padding,
    transparent,
    as: Tag = "div",
}: ContainerProps) {
    return (
        <Tag
            className={`
            ${transparent ? "bg-transparent" : "bg-surface border border-line shadow-sm"}
            text-content
            ${padding ?? "p-4"}
            ${className}`}
        >
            {children}
        </Tag>
    );
}
