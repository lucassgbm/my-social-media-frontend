'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import SidebarFooter from "../../../../../components/sidebar-footer";
import EventCard from "../../../../../components/communities/event-card";
import FilterBar, { type ActiveFilter } from "../../../../../components/filters/filter-bar";
import FilterModal from "../../../../../components/filters/filter-modal";
import Input from "../../../../../components/input";
import Select from "../../../../../components/select";
import Skeleton from "../../../../../components/skeleton";
import TrophyIcon from "../../../../../components/icons/trophy";
import CommunityIcon from "../../../../../components/icons/community";
import { get } from "@/api/services/request";
import { useToaster } from "../../../../../providers/toaster-provider";
import type { Community, CommunityEvent, EventFilter } from "../../../../../utils/community";

type Filters = {
    search: string;
    period: EventFilter;
    /** Id da comunidade, "" para todas. */
    communityId: string;
    sort: "closest" | "farthest";
};

const EMPTY_FILTERS: Filters = {
    search: "",
    period: "upcoming",
    communityId: "",
    sort: "closest",
};

const PERIOD_LABELS: Record<EventFilter, string> = {
    upcoming: "Próximos",
    past: "Encerrados",
    all: "Todos os períodos",
};

const GRID = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4";

/**
 * Agenda pessoal: os eventos das comunidades de que o usuário participa.
 *
 * O período é filtrado pela API (o corte usa `date_end`, para um evento de
 * vários dias não vencer no primeiro deles); busca, comunidade e ordenação são
 * aplicados sobre o que já veio.
 */
export default function EventsPage() {
    const { showToast } = useToaster();

    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    // rascunho do modal: a lista só muda quando se aplica
    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
    const [modalOpen, setModalOpen] = useState(false);

    const loadEvents = useCallback(async () => {
        setLoading(true);

        const response = await get(`/social-media/events?filter=${filters.period}`);

        // get() engole o erro e devolve undefined
        if (!response) {
            showToast({
                title: "Eventos",
                message: "Não foi possível carregar a sua agenda.",
                status: "error",
            });
        }

        setEvents(response?.data ?? []);
        setLoading(false);
    }, [filters.period, showToast]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // as comunidades do filtro não podem sair dos eventos carregados: mudar o
    // período esvaziaria a lista de opções junto
    useEffect(() => {
        get("/social-media/community").then((response) => {
            const all: Community[] = response?.data ?? [];

            setCommunities(all.filter((community) => community.viewer_role !== "none"));
        });
    }, []);

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();

        const result = events.filter((event) => {
            const matchesTerm =
                term === "" ||
                [event.title, event.local, event.community?.name]
                    .filter(Boolean)
                    .some((field) => String(field).toLowerCase().includes(term));

            const matchesCommunity =
                filters.communityId === "" ||
                String(event.community?.id ?? "") === filters.communityId;

            return matchesTerm && matchesCommunity;
        });

        // a API já ordena por data; aqui só se inverte quando pedido
        return filters.sort === "farthest" ? [...result].reverse() : result;
    }, [events, filters]);

    function openModal() {
        setDraft(filters);
        setModalOpen(true);
    }

    function applyFilters() {
        setFilters(draft);
        setModalOpen(false);
    }

    /** Chips do que está aplicado — o padrão fica de fora. */
    const activeFilters: ActiveFilter[] = [];

    if (filters.search.trim() !== "") {
        activeFilters.push({ id: "search", label: `Busca: ${filters.search}` });
    }
    if (filters.period !== EMPTY_FILTERS.period) {
        activeFilters.push({ id: "period", label: PERIOD_LABELS[filters.period] });
    }
    if (filters.communityId !== "") {
        const name = communities.find(
            (community) => String(community.id) === filters.communityId
        )?.name;

        activeFilters.push({ id: "communityId", label: `Comunidade: ${name ?? filters.communityId}` });
    }
    if (filters.sort !== EMPTY_FILTERS.sort) {
        activeFilters.push({ id: "sort", label: "Mais distantes primeiro" });
    }

    function removeFilter(id: string) {
        setFilters((current) => ({ ...current, [id]: EMPTY_FILTERS[id as keyof Filters] }));
    }

    const emptyMessage =
        filters.period === "past"
            ? "Nenhum evento encerrado por aqui."
            : filters.period === "upcoming"
                ? "Nenhum evento marcado nas suas comunidades."
                : "As suas comunidades ainda não têm eventos.";

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <div className="flex flex-col gap-4 border-b border-line p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h1 className="text-2xl font-semibold">Eventos</h1>
                            <p className="text-sm text-content-muted">
                                A agenda das comunidades de que você participa.
                            </p>
                        </div>

                        <FilterBar
                            onOpen={openModal}
                            active={activeFilters}
                            onRemove={removeFilter}
                            onClearAll={() => setFilters(EMPTY_FILTERS)}
                            summary={
                                loading
                                    ? "Carregando..."
                                    : `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`
                            }
                        />
                    </div>

                    <div className="p-4">
                        {loading && (
                            <div className={GRID}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton key={index} className="h-[150px]" rounded="card" />
                                ))}
                            </div>
                        )}

                        {!loading && filtered.length > 0 && (
                            <div className={GRID}>
                                {filtered.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        href={`/social-media/events/${event.id}`}
                                        showCommunity
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <TrophyIcon className="size-10 text-content-subtle" />
                                <h2 className="text-base font-semibold">
                                    {activeFilters.length > 0 ? "Nenhum resultado" : "Nada na agenda"}
                                </h2>
                                <p className="max-w-sm text-sm text-content-muted">
                                    {activeFilters.length > 0
                                        ? "Nenhum evento combina com os filtros aplicados."
                                        : emptyMessage}
                                </p>

                                {activeFilters.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                        className="mt-2 rounded-field px-3 py-1 text-sm font-semibold text-brand
                                            cursor-pointer hover:bg-surface-2 transition-colors
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Limpar filtros
                                    </button>
                                ) : (
                                    <Link
                                        href="/social-media/communities"
                                        className="mt-2 rounded-field px-3 py-1 text-sm font-semibold text-brand
                                            hover:bg-surface-2 transition-colors
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Ver comunidades
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside aria-label="Sobre a agenda" className="w-full lg:w-[28%] flex flex-col gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Como funciona</h2>
                            <CommunityIcon className="size-5 text-content-muted" />
                        </div>

                        <p className="text-sm text-content-muted">
                            Só aparecem eventos das comunidades de que você participa. Entre em uma
                            comunidade para acompanhar a agenda dela por aqui.
                        </p>
                    </Container>

                    <SidebarFooter />
                </aside>
            </div>

            <FilterModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onApply={applyFilters}
                onClear={() => setDraft(EMPTY_FILTERS)}
                title="Filtrar eventos"
            >
                <Input
                    label="Buscar"
                    type="search"
                    placeholder="Nome, local ou comunidade"
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                />

                <Select
                    label="Período"
                    value={draft.period}
                    onChange={(e) => setDraft({ ...draft, period: e.target.value as EventFilter })}
                    options={[
                        { value: "upcoming", label: "Próximos" },
                        { value: "past", label: "Encerrados" },
                        { value: "all", label: "Todos" },
                    ]}
                />

                <Select
                    label="Comunidade"
                    value={draft.communityId}
                    onChange={(e) => setDraft({ ...draft, communityId: e.target.value })}
                    options={[
                        { value: "", label: "Todas as comunidades" },
                        ...communities.map((community) => ({
                            value: String(community.id),
                            label: community.name,
                        })),
                    ]}
                />

                <Select
                    label="Ordenar por"
                    value={draft.sort}
                    onChange={(e) => setDraft({ ...draft, sort: e.target.value as Filters["sort"] })}
                    options={[
                        { value: "closest", label: "Mais próximos primeiro" },
                        { value: "farthest", label: "Mais distantes primeiro" },
                    ]}
                />
            </FilterModal>
        </>
    );
}
