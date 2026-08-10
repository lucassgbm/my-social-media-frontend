'use client';

import Button from "../button";
import FilterIcon from "../icons/filter";
import CloseIcon from "../icons/close";

/** Um filtro ativo, do jeito que aparece no chip. */
export type ActiveFilter = {
    /** Identifica o campo para a remoção individual. */
    id: string;
    /** Texto do chip, já formatado (ex.: "Categoria: Carros"). */
    label: string;
};

type FilterBarProps = {
    onOpen: () => void;
    /** Filtros aplicados — viram chips removíveis. */
    active: ActiveFilter[];
    /** Remove um filtro específico direto do chip. */
    onRemove: (id: string) => void;
    onClearAll: () => void;
    /** Texto à direita do botão (ex.: "12 eventos"). */
    summary?: string;
};

/**
 * Botão de filtros com o resumo do que está aplicado.
 *
 * Guardar os filtros num modal esconde o estado da lista, então os aplicados
 * voltam como chips: dá para ver e remover um a um sem reabrir o modal.
 */
export default function FilterBar({
    onOpen,
    active,
    onRemove,
    onClearAll,
    summary,
}: FilterBarProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-row flex-wrap items-center gap-2">
                <Button variant="secondary" size="md" onClick={onOpen} className="shrink-0">
                    <FilterIcon className="size-4 shrink-0" />
                    Filtros
                    {active.length > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full
                            bg-brand px-1.5 text-[11px] font-semibold text-on-brand">
                            {active.length}
                        </span>
                    )}
                </Button>

                {summary && (
                    <span className="text-sm text-content-muted ml-auto">{summary}</span>
                )}
            </div>

            {active.length > 0 && (
                <div className="flex flex-row flex-wrap items-center gap-2">
                    {active.map((filter) => (
                        <span
                            key={filter.id}
                            className="flex flex-row items-center gap-1 rounded-full border border-line
                                bg-surface-2 py-1 pl-3 pr-1 text-xs text-content"
                        >
                            {filter.label}
                            <button
                                type="button"
                                onClick={() => onRemove(filter.id)}
                                aria-label={`Remover filtro ${filter.label}`}
                                className="rounded-full p-1 text-content-muted cursor-pointer
                                    hover:bg-surface-3 hover:text-content
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <CloseIcon className="size-3" />
                            </button>
                        </span>
                    ))}

                    <button
                        type="button"
                        onClick={onClearAll}
                        className="rounded-field px-2 py-1 text-xs font-semibold text-brand cursor-pointer
                            hover:bg-surface-2 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        Limpar tudo
                    </button>
                </div>
            )}
        </div>
    );
}
