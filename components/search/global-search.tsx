'use client';

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "../remote-image";
import SearchIcon from "../icons/search";
import CloseIcon from "../icons/close";
import UsersIcon from "../icons/users";
import CommunityIcon from "../icons/community";
import TrophyIcon from "../icons/trophy";
import CalendarIcon from "../icons/calendar";
import PinIcon from "../icons/pin";
import LoadingSpinner from "../loading-spinner";
import { get } from "@/api/services/request";
import { formatDate } from "../../utils/community";
import { locationOf } from "../../utils/friendship";
import {
    EMPTY_SEARCH_RESULTS,
    MIN_SEARCH_LENGTH,
    searchApiUrl,
    searchPageHref,
    toSearchResults,
    type SearchResults,
} from "../../utils/search";

/** Quantos itens de cada tipo cabem na prévia — o resto fica na página. */
const PREVIEW_LIMIT = 4;

/** Espera de digitação: um pedido por tecla afogaria a API sem necessidade. */
const DEBOUNCE_MS = 300;

type GlobalSearchProps = {
    /** Classes do invólucro — quem chama decide largura e visibilidade. */
    className?: string;
    /** Fecha o menu mobile depois de escolher um resultado. */
    onNavigate?: () => void;
};

/** Uma linha da prévia, já achatada para a navegação por teclado. */
type Option = {
    key: string;
    href: string;
    title: string;
    subtitle?: string | null;
    photo?: string | null;
    /** Formato do avatar: pessoas e comunidades são redondos, eventos não. */
    round: boolean;
    icon: React.ComponentType<{ className?: string }>;
    /** Ícone do detalhe da segunda linha (local, data). */
    subtitleIcon?: React.ComponentType<{ className?: string }>;
};

/** Cabeçalho de seção e onde ela começa na lista achatada. */
type Section = {
    label: string;
    total: number;
    options: Option[];
    offset: number;
};

/**
 * Busca global do cabeçalho: pessoas, comunidades e eventos num campo só.
 *
 * O input do Header não fazia nada e cada tela tinha a própria busca, que
 * filtrava no navegador uma lista já carregada — achar alguém dependia de a
 * pessoa já estar na sua lista de amigos. Aqui o filtro é do banco.
 *
 * A prévia mostra poucos itens de cada tipo; a página de resultados
 * (/social-media/search) é que lista tudo.
 */
export default function GlobalSearch({ className = "", onNavigate }: GlobalSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const listboxId = useId();

    const [term, setTerm] = useState("");
    const [results, setResults] = useState<SearchResults>(EMPTY_SEARCH_RESULTS);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    /** Índice na lista achatada; -1 quando nada está destacado. */
    const [highlighted, setHighlighted] = useState(-1);

    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    /**
     * Sequência do último pedido disparado. Sem ela, uma resposta lenta de um
     * termo antigo chega depois e sobrescreve a do termo atual.
     */
    const requestId = useRef(0);

    const trimmed = term.trim();
    const ready = trimmed.length >= MIN_SEARCH_LENGTH;

    // --- Consulta ----------------------------------------------------------

    useEffect(() => {
        if (!ready) {
            // o pedido em voo perde a validade: sem isto ele ainda preencheria
            // a lista depois de a pessoa apagar o que digitou
            requestId.current += 1;
            setResults(EMPTY_SEARCH_RESULTS);
            setLoading(false);
            return;
        }

        const id = ++requestId.current;
        setLoading(true);

        const timer = setTimeout(async () => {
            const response = await get(searchApiUrl(trimmed, PREVIEW_LIMIT));

            if (id !== requestId.current) return;

            setResults(toSearchResults(response, trimmed));
            setLoading(false);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [trimmed, ready]);

    // --- Fechar ------------------------------------------------------------

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);

        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    /** Trocou de tela: a prévia da busca anterior não faz mais sentido. */
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // --- Lista achatada ----------------------------------------------------

    const sections = useMemo<Section[]>(() => {
        const people: Option[] = results.people.map((person) => {
            const location = locationOf(person);

            return {
                key: `person-${person.id}`,
                href: `/social-media/profile/${person.id}`,
                title: person.name,
                subtitle: location || person.autodescription,
                photo: person.photo,
                round: true,
                icon: UsersIcon,
                // o alfinete só faz sentido quando a linha é mesmo o lugar
                subtitleIcon: location ? PinIcon : undefined,
            };
        });

        const communities: Option[] = results.communities.map((community) => ({
            key: `community-${community.id}`,
            href: `/social-media/communities/${community.id}`,
            title: community.name,
            subtitle: community.description,
            photo: community.photo,
            round: true,
            icon: CommunityIcon,
        }));

        const events: Option[] = results.events.map((event) => ({
            key: `event-${event.id}`,
            href: `/social-media/events/${event.id}`,
            title: event.title,
            // data primeiro: é o que diferencia dois eventos de mesmo nome
            subtitle: [formatDate(event.date_start), event.local].filter(Boolean).join(" · "),
            photo: event.photo,
            round: false,
            icon: TrophyIcon,
            subtitleIcon: CalendarIcon,
        }));

        const built: Section[] = [
            { label: "Pessoas", total: results.counts.people, options: people, offset: 0 },
            { label: "Comunidades", total: results.counts.communities, options: communities, offset: 0 },
            { label: "Eventos", total: results.counts.events, options: events, offset: 0 },
        ].filter((section) => section.options.length > 0);

        // o deslocamento é o que liga cada linha ao índice do teclado
        let offset = 0;
        built.forEach((section) => {
            section.offset = offset;
            offset += section.options.length;
        });

        return built;
    }, [results]);

    const options = useMemo(
        () => sections.flatMap((section) => section.options),
        [sections]
    );

    /** A linha "ver todos" também é navegável, então vai no fim da lista. */
    const seeAllIndex = options.length;
    const hasResults = options.length > 0;

    // um termo novo invalida o destaque anterior
    useEffect(() => {
        setHighlighted(-1);
    }, [trimmed]);

    /** A prévia só aparece com algo digitado — focar o campo vazio não abre nada. */
    const showPanel = open && trimmed.length > 0;

    // --- Navegação ---------------------------------------------------------

    function go(href: string) {
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.blur();
        onNavigate?.();
        router.push(href);
    }

    function submit() {
        if (!ready) return;

        go(searchPageHref(trimmed));
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            // o Header também escuta Esc para fechar o menu mobile; com a
            // prévia aberta, o primeiro Esc é dela
            if (showPanel) event.stopPropagation();

            setOpen(false);
            setHighlighted(-1);
            return;
        }

        if (event.key === "Tab") {
            setOpen(false);
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (!hasResults) return;

            event.preventDefault();
            setOpen(true);

            // o "ver todos" entra na roda, por isso o total é +1
            const size = seeAllIndex + 1;
            const step = event.key === "ArrowDown" ? 1 : -1;

            setHighlighted((current) => {
                const next = current + step;

                // dá a volta nas duas pontas; de -1 (nada destacado) para cima
                // o destino é o último item
                if (next < 0) return size - 1;
                if (next >= size) return 0;

                return next;
            });
            return;
        }

        if (event.key === "Enter") {
            if (highlighted >= 0 && highlighted < options.length) {
                event.preventDefault();
                go(options[highlighted].href);
                return;
            }

            if (highlighted === seeAllIndex) {
                event.preventDefault();
                submit();
            }
        }
    }

    function clear() {
        setTerm("");
        setResults(EMPTY_SEARCH_RESULTS);
        setHighlighted(-1);
        inputRef.current?.focus();
    }

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <form
                role="search"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
                className="flex w-full items-center gap-2 rounded-full border border-line bg-surface-2
                    px-5 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring"
            >
                {loading ? (
                    <span className="flex size-5 shrink-0 items-center justify-center">
                        <LoadingSpinner />
                    </span>
                ) : (
                    <SearchIcon className="size-5 shrink-0 text-content-muted" />
                )}

                <input
                    ref={inputRef}
                    // type="search" traz o "x" nativo do navegador, que não
                    // avisa o React e deixaria a prévia com o termo antigo
                    type="text"
                    value={term}
                    onChange={(event) => {
                        setTerm(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    aria-label="Buscar pessoas, comunidades e eventos"
                    placeholder="Buscar pessoas, comunidades, eventos.."
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showPanel}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        highlighted >= 0 ? `${listboxId}-option-${highlighted}` : undefined
                    }
                    className="w-full bg-transparent text-sm text-content placeholder:text-content-subtle outline-none"
                />

                {term !== "" && (
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Limpar busca"
                        className="shrink-0 rounded-full p-1 text-content-muted cursor-pointer
                            transition-colors hover:bg-surface-3 hover:text-content
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        <CloseIcon className="size-3.5" />
                    </button>
                )}
            </form>

            {showPanel && (
                <div
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto
                        rounded-card border border-line bg-surface p-2 shadow-lg"
                >
                    <ul id={listboxId} role="listbox" aria-label="Resultados da busca" className="list-none">
                        {!ready && (
                            <li className="px-3 py-4 text-center text-xs text-content-muted">
                                Digite ao menos {MIN_SEARCH_LENGTH} caracteres para buscar.
                            </li>
                        )}

                        {ready && loading && !hasResults && (
                            <li className="px-3 py-4 text-center text-xs text-content-muted">
                                Buscando...
                            </li>
                        )}

                        {ready && !loading && !hasResults && (
                            <li className="flex flex-col items-center gap-1 px-3 py-6 text-center">
                                <SearchIcon className="size-6 text-content-subtle" />
                                <span className="text-sm font-semibold">Nenhum resultado</span>
                                <span className="text-xs text-content-muted">
                                    Nada encontrado para “{trimmed}”.
                                </span>
                            </li>
                        )}

                        {sections.map((section) => (
                            <li key={section.label}>
                                <div className="flex flex-row items-center justify-between px-3 pb-1 pt-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-content-subtle">
                                        {section.label}
                                    </span>

                                    {/* a prévia corta em PREVIEW_LIMIT: o número
                                        avisa que há mais na página de resultados */}
                                    {section.total > section.options.length && (
                                        <span className="text-[11px] text-content-subtle">
                                            {section.total}
                                        </span>
                                    )}
                                </div>

                                <ul className="list-none">
                                    {section.options.map((option, index) => {
                                        const position = section.offset + index;

                                        return (
                                            <ResultRow
                                                key={option.key}
                                                id={`${listboxId}-option-${position}`}
                                                option={option}
                                                active={highlighted === position}
                                                onHover={() => setHighlighted(position)}
                                                onSelect={() => {
                                                    setOpen(false);
                                                    onNavigate?.();
                                                }}
                                            />
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}

                        {hasResults && (
                            <li className="mt-1 border-t border-line pt-1">
                                <Link
                                    id={`${listboxId}-option-${seeAllIndex}`}
                                    role="option"
                                    aria-selected={highlighted === seeAllIndex}
                                    href={searchPageHref(trimmed)}
                                    onMouseEnter={() => setHighlighted(seeAllIndex)}
                                    onClick={() => {
                                        setOpen(false);
                                        onNavigate?.();
                                    }}
                                    className={`flex flex-row items-center justify-center gap-2 rounded-field
                                        px-3 py-2.5 text-xs font-semibold text-brand transition-colors
                                        focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-ring
                                        ${highlighted === seeAllIndex ? "bg-brand-subtle" : "hover:bg-surface-2"}`}
                                >
                                    Ver todos os {results.counts.total} resultados
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

type ResultRowProps = {
    id: string;
    option: Option;
    active: boolean;
    onHover: () => void;
    onSelect: () => void;
};

/**
 * Linha da prévia.
 *
 * É um Link, e não um botão com router.push, para que abrir em nova aba
 * (ctrl+clique, clique do meio) continue funcionando.
 */
function ResultRow({ id, option, active, onHover, onSelect }: ResultRowProps) {
    const Icon = option.icon;
    const SubtitleIcon = option.subtitleIcon;

    return (
        <li>
            <Link
                id={id}
                role="option"
                aria-selected={active}
                href={option.href}
                onMouseEnter={onHover}
                onClick={onSelect}
                className={`flex flex-row items-center gap-3 rounded-field px-3 py-2 transition-colors
                    focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-ring
                    ${active ? "bg-surface-2" : "hover:bg-surface-2"}`}
            >
                <Image
                    src={option.photo || "/imgs/placeholder.png"}
                    alt=""
                    width={36}
                    height={36}
                    sizes="36px"
                    className={`w-9 aspect-square shrink-0 bg-surface-3 object-cover
                        ${option.round ? "rounded-full" : "rounded-field"}`}
                />

                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-content">{option.title}</span>

                    {option.subtitle && (
                        <span className="flex flex-row items-center gap-1 truncate text-xs text-content-muted">
                            {SubtitleIcon && <SubtitleIcon className="size-3 shrink-0" />}
                            <span className="truncate">{option.subtitle}</span>
                        </span>
                    )}
                </span>

                <Icon className="size-4 shrink-0 text-content-subtle" />
            </Link>
        </li>
    );
}
