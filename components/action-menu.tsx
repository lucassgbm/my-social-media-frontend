'use client';

import { useEffect, useRef, useState, type ComponentType } from "react";
import Button from "./button";
import EllipsisVerticalIcon from "./icons/ellipsis";

export type ActionMenuItem = {
    label: string;
    icon: ComponentType<{ className?: string }>;
    onClick: () => void;
    /** Ação destrutiva — sai em vermelho. */
    danger?: boolean;
};

type ActionMenuProps = {
    items: ActionMenuItem[];
    /** Descreve o menu para leitores de tela; o botão é só um ícone. */
    label?: string;
    className?: string;
};

/**
 * Menu de ações secundárias atrás dos três pontinhos.
 *
 * Existe porque uma barra de botões cresce até estourar a largura: no cabeçalho
 * da comunidade, o quarto botão saía cortado da tela. O que é principal fica
 * como botão à vista; o resto entra aqui.
 *
 * Fecha ao clicar fora, no Esc e ao escolher um item — mesmo comportamento do
 * menu da conta no cabeçalho.
 */
export default function ActionMenu({
    items,
    label = "Mais ações",
    className = "",
}: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    if (items.length === 0) return null;

    return (
        <div ref={containerRef} className={`relative shrink-0 ${className}`}>
            <Button
                variant="outline"
                // size="icon" (p-2 nos quatro lados) e não "md": com um ícone
                // só, o px-4 py-2 do md desenhava uma pílula, não um círculo.
                // O ícone size-5 + p-2 dá a mesma altura dos botões ao lado.
                size="icon"
                aria-label={label}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen(!open)}
            >
                <EllipsisVerticalIcon className="size-5" />
            </Button>

            {open && (
                /* alinhado à direita do botão: é o canto da tela onde ele fica,
                   e abrir para a esquerda é o que mantém o painel visível */
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-[220px] rounded-card border border-line
                        bg-surface p-2 text-content shadow-lg"
                >
                    <ul className="list-none">
                        {items.map(({ label: itemLabel, icon: Icon, onClick, danger }) => (
                            <li key={itemLabel}>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setOpen(false);
                                        onClick();
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-field p-2 text-left
                                        transition-colors cursor-pointer hover:bg-surface-2
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                        ${danger ? "text-danger" : "text-content"}`}
                                >
                                    <span className="flex items-center justify-center rounded-full bg-surface-3 p-2">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="text-sm font-semibold">{itemLabel}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
