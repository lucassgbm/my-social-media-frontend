'use client';

import type { ReactNode } from "react";

type OverlayButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Tamanho do círculo. O padrão serve para as ações do canto. */
    size?: "sm" | "md";
    children: ReactNode;
};

/**
 * Botão redondo sobre uma foto — usado no visualizador e no compositor.
 *
 * Não reaproveita o `Button` de propósito: ele traz um `bg-*` do variant, e
 * sobrepor outro `bg-*` pela className depende da ordem em que o Tailwind
 * gerou as regras, não da ordem em que elas aparecem no atributo. Aqui a cor é
 * a única declarada, então não há disputa.
 *
 * `pointer-events-auto` porque as barras que hospedam estes botões ignoram o
 * ponteiro, para o toque alcançar as zonas de navegação atrás delas.
 */
export default function OverlayButton({
    label,
    onClick,
    disabled,
    size = "sm",
    children,
}: OverlayButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`pointer-events-auto flex shrink-0 items-center justify-center rounded-full
                bg-black/40 text-white cursor-pointer transition-colors hover:bg-black/70
                disabled:pointer-events-none disabled:opacity-40
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                ${size === "sm" ? "size-8" : "size-12"}`}
        >
            {children}
        </button>
    );
}
