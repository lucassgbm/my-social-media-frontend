'use client';

import SearchIcon from "../icons/search";
import CloseIcon from "../icons/close";

type SearchFieldProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Descreve o campo — ele não tem rótulo visível. */
    label: string;
};

/**
 * Campo de busca em pílula, para o cabeçalho das listagens.
 *
 * Antes o termo só existia dentro do modal de filtros e voltava como chip: era
 * preciso abrir o modal para digitar e outro clique para corrigir. Aqui ele
 * fica à vista, com botão próprio para limpar — por isso a busca não vira chip
 * nas telas que usam este campo.
 */
export default function SearchField({
    value,
    onChange,
    placeholder,
    label,
}: SearchFieldProps) {
    return (
        <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4
                -translate-y-1/2 text-content-subtle" />

            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                placeholder={placeholder}
                className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-10
                    text-sm text-content placeholder:text-content-subtle shadow-sm
                    transition-colors hover:border-line-strong
                    focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
                    [&::-webkit-search-cancel-button]:appearance-none"
            />

            {value !== "" && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5
                        text-content-muted cursor-pointer transition-colors
                        hover:bg-surface-2 hover:text-content
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                >
                    <CloseIcon className="size-3.5" />
                </button>
            )}
        </div>
    );
}
