'use client';

import type { ComponentType, ReactNode } from "react";

type StatChipProps = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    /** Número em destaque antes do rótulo. Omitido, o chip é só um atalho. */
    value?: number;
    active: boolean;
    onClick: () => void;
    /** Conteúdo extra à direita (ex.: badge de pendências). */
    badge?: ReactNode;
    /** Papel na árvore de acessibilidade — "tab" quando alterna listas. */
    role?: "tab";
};

/**
 * Atalho de recorte no cabeçalho das listagens.
 *
 * Os números do topo eram só decoração e a pessoa tinha que abrir o modal de
 * filtros para ver "as que participo". Aqui o resumo e o filtro são a mesma
 * coisa: o chip mostra a contagem e aplica o recorte.
 */
export default function StatChip({
    icon: Icon,
    label,
    value,
    active,
    onClick,
    badge,
    role,
}: StatChipProps) {
    return (
        <button
            type="button"
            role={role}
            onClick={onClick}
            // aria-selected é o estado certo para uma aba; fora dela, aria-pressed
            {...(role === "tab" ? { "aria-selected": active } : { "aria-pressed": active })}
            className={`flex flex-row items-center gap-2 rounded-full border px-3 py-1.5 text-xs
                cursor-pointer transition-colors
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                ${active
                    ? "border-brand bg-brand-subtle text-brand"
                    : "border-line bg-surface text-content-muted hover:border-line-strong hover:text-content"}`}
        >
            <Icon className="size-3.5 shrink-0" />

            {/* o número herda a cor de marca quando o chip está ativo */}
            {value !== undefined && (
                <span className={`font-semibold ${active ? "" : "text-content"}`}>{value}</span>
            )}

            {label}
            {badge}
        </button>
    );
}
