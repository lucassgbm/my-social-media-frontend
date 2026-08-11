'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import PageHeader from "../../../../../components/page-header";
import StatChip from "../../../../../components/stat-chip";
import Skeleton from "../../../../../components/skeleton";
import SearchField from "../../../../../components/filters/search-field";
import CardUser from "../../../../../components/users/card-user";
import CommunityCard from "../../../../../components/communities/community-card";
import EventCard from "../../../../../components/communities/event-card";
import SearchIcon from "../../../../../components/icons/search";
import UsersIcon from "../../../../../components/icons/users";
import CommunityIcon from "../../../../../components/icons/community";
import TrophyIcon from "../../../../../components/icons/trophy";
import { get } from "@/api/services/request";
import type { FriendshipStatus } from "../../../../../utils/friendship";
import {
    EMPTY_SEARCH_RESULTS,
    MIN_SEARCH_LENGTH,
    searchApiUrl,
    searchPageHref,
    toSearchResults,
    type SearchResults,
    type SearchType,
} from "../../../../../utils/search";

/** Quantos itens de cada tipo a página carrega. */
const PAGE_LIMIT = 20;

/** Espera de digitação antes de trocar a URL e refazer a busca. */
const DEBOUNCE_MS = 350;

const PEOPLE_GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
const COMMUNITY_GRID = "grid grid-cols-1 sm:grid-cols-2 gap-3";
const EVENT_GRID = "grid grid-cols-1 xl:grid-cols-2 gap-4";

type Tab = "all" | SearchType;

/**
 * Resultados completos da busca global.
 *
 * A prévia do cabeçalho mostra poucos itens de cada tipo; aqui cabem todos,
 * com abas por tipo. O termo mora na URL para o resultado ser compartilhável e
 * para o botão "voltar" funcionar.
 */
function SearchResultsPage() {
    const router = useRouter();
    const params = useSearchParams();
    const queryFromUrl = (params.get("q") ?? "").trim();

    const [term, setTerm] = useState(queryFromUrl);
    const [results, setResults] = useState<SearchResults>(EMPTY_SEARCH_RESULTS);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<Tab>("all");

    const ready = queryFromUrl.length >= MIN_SEARCH_LENGTH;

    /** A URL manda no campo: vale para o botão "voltar" e para a busca do cabeçalho. */
    useEffect(() => {
        setTerm((current) => (current.trim() === queryFromUrl ? current : queryFromUrl));
    }, [queryFromUrl]);

    /** Digitar reescreve a URL — replace, para não empilhar uma entrada por tecla. */
    useEffect(() => {
        const trimmed = term.trim();

        if (trimmed === queryFromUrl) return;

        const timer = setTimeout(() => {
            router.replace(searchPageHref(trimmed));
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [term, queryFromUrl, router]);

    /** A consulta segue a URL, não o campo: uma origem só para o resultado. */
    useEffect(() => {
        let current = true;

        // termo novo, recorte zerado: a aba escolhida pode nem existir no
        // resultado que está chegando
        setTab("all");

        if (!ready) {
            setResults({ ...EMPTY_SEARCH_RESULTS, query: queryFromUrl });
            setLoading(false);
            return;
        }

        setLoading(true);

        get(searchApiUrl(queryFromUrl, PAGE_LIMIT)).then((response: unknown) => {
            // a resposta de um termo antigo não pode sobrescrever a atual
            if (!current) return;

            setResults(toSearchResults(response, queryFromUrl));
            setLoading(false);
        });

        return () => {
            current = false;
        };
    }, [queryFromUrl, ready]);

    /** Adicionar amigo direto do resultado mantém o card em dia sem recarregar. */
    function handleFriendshipChange(personId: number, status: FriendshipStatus) {
        setResults((current) => ({
            ...current,
            people: current.people.map((person) =>
                person.id === personId ? { ...person, friendship_status: status } : person
            ),
        }));
    }

    const { counts } = results;

    /**
     * Enquanto o resultado em mãos não é o do termo da URL, a tela ainda está
     * buscando. Só `loading` não bastava: no primeiro quadro ele é `false` e o
     * "nenhum resultado" piscava antes de o pedido sair.
     */
    const busy = ready && (loading || results.query !== queryFromUrl);

    const showPeople = (tab === "all" || tab === "people") && results.people.length > 0;
    const showCommunities = (tab === "all" || tab === "communities") && results.communities.length > 0;
    const showEvents = (tab === "all" || tab === "events") && results.events.length > 0;
    const nothingToShow = !showPeople && !showCommunities && !showEvents;

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col gap-4">
                <Container className="w-full rounded-card min-w-0" padding="p-0">

                    <PageHeader
                        icon={SearchIcon}
                        title="Busca"
                        subtitle="Pessoas, comunidades e eventos num lugar só."
                    >
                        <SearchField
                            value={term}
                            onChange={setTerm}
                            label="Buscar pessoas, comunidades e eventos"
                            placeholder="O que você procura?"
                        />

                        {ready && !busy && counts.total > 0 && (
                            <div role="tablist" aria-label="Tipo de resultado"
                                className="flex flex-row flex-wrap items-center gap-2">
                                <StatChip
                                    role="tab"
                                    icon={SearchIcon}
                                    label="Tudo"
                                    value={counts.total}
                                    active={tab === "all"}
                                    onClick={() => setTab("all")}
                                />
                                {/* aba zerada levaria a uma tela vazia com
                                    resultado ao lado: só entra quem tem item */}
                                {counts.people > 0 && (
                                    <StatChip
                                        role="tab"
                                        icon={UsersIcon}
                                        label="pessoas"
                                        value={counts.people}
                                        active={tab === "people"}
                                        onClick={() => setTab("people")}
                                    />
                                )}
                                {counts.communities > 0 && (
                                    <StatChip
                                        role="tab"
                                        icon={CommunityIcon}
                                        label="comunidades"
                                        value={counts.communities}
                                        active={tab === "communities"}
                                        onClick={() => setTab("communities")}
                                    />
                                )}
                                {counts.events > 0 && (
                                    <StatChip
                                        role="tab"
                                        icon={TrophyIcon}
                                        label="eventos"
                                        value={counts.events}
                                        active={tab === "events"}
                                        onClick={() => setTab("events")}
                                    />
                                )}
                            </div>
                        )}
                    </PageHeader>

                    <div className="flex flex-col gap-8 p-4 sm:p-6">
                        {busy && (
                            <div className={PEOPLE_GRID}>
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <Skeleton key={index} className="aspect-square min-h-[170px]" rounded="card" />
                                ))}
                            </div>
                        )}

                        {!busy && showPeople && (
                            <Section
                                icon={UsersIcon}
                                title="Pessoas"
                                shown={results.people.length}
                                total={counts.people}
                            >
                                <div className={PEOPLE_GRID}>
                                    {results.people.map((person) => (
                                        <CardUser
                                            key={person.id}
                                            user={person}
                                            onStatusChange={handleFriendshipChange}
                                        />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {!busy && showCommunities && (
                            <Section
                                icon={CommunityIcon}
                                title="Comunidades"
                                shown={results.communities.length}
                                total={counts.communities}
                            >
                                <div className={COMMUNITY_GRID}>
                                    {results.communities.map((community) => (
                                        <CommunityCard key={community.id} community={community} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {!busy && showEvents && (
                            <Section
                                icon={TrophyIcon}
                                title="Eventos"
                                shown={results.events.length}
                                total={counts.events}
                            >
                                <div className={EVENT_GRID}>
                                    {results.events.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            href={`/social-media/events/${event.id}`}
                                            showCommunity
                                        />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {!busy && nothingToShow && (
                            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed
                                border-line px-6 py-14 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full
                                    bg-brand-subtle text-brand">
                                    <SearchIcon className="size-8" />
                                </span>

                                <h2 className="text-base font-semibold">
                                    {!ready ? "O que você procura?" : "Nenhum resultado"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {!ready
                                        ? `Digite ao menos ${MIN_SEARCH_LENGTH} caracteres para buscar pessoas, comunidades e eventos.`
                                        : `Nada encontrado para “${queryFromUrl}”. Tente outra palavra.`}
                                </p>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </>
    );
}

type SectionProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    /** Quantos couberam na tela. */
    shown: number;
    /** Quantos casam no total — a API limita o que devolve. */
    total: number;
    children: React.ReactNode;
};

/** Bloco de um tipo de resultado, com o aviso de quando há mais do que coube. */
function Section({ icon: Icon, title, shown, total, children }: SectionProps) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                    bg-brand-subtle text-brand">
                    <Icon className="size-4" />
                </span>

                <h2 className="text-base font-semibold">{title}</h2>

                <span className="text-xs text-content-muted">
                    {total > shown ? `${shown} de ${total}` : total}
                </span>
            </div>

            {children}

            {total > shown && (
                <p className="text-xs text-content-muted">
                    Refine a busca para ver os outros {total - shown}.
                </p>
            )}
        </section>
    );
}

/**
 * useSearchParams exige um limite de Suspense: sem ele o build reclama de
 * renderizar a rota inteira só no cliente.
 */
export default function Page() {
    return (
        <Suspense
            fallback={
                <>
                    <Sidebar />
                    <div className="flex flex-1 min-w-0 flex-col gap-4">
                        <Skeleton className="h-[220px]" rounded="card" />
                    </div>
                </>
            }
        >
            <SearchResultsPage />
        </Suspense>
    );
}
