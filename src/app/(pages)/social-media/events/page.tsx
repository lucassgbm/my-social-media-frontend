'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import SidebarFooter from "../../../../../components/sidebar-footer";
import PageHeader from "../../../../../components/page-header";
import StatChip from "../../../../../components/stat-chip";
import Button from "../../../../../components/button";
import EventCard from "../../../../../components/communities/event-card";
import FilterBar, { type ActiveFilter } from "../../../../../components/filters/filter-bar";
import FilterModal from "../../../../../components/filters/filter-modal";
import SearchField from "../../../../../components/filters/search-field";
import Select from "../../../../../components/select";
import Skeleton from "../../../../../components/skeleton";
import TrophyIcon from "../../../../../components/icons/trophy";
import CommunityIcon from "../../../../../components/icons/community";
import CalendarIcon from "../../../../../components/icons/calendar";
import ClockIcon from "../../../../../components/icons/clock";
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
    all: "Todos",
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
        // busca e período são dos controles do cabeçalho: o modal não os toca
        setFilters((current) => ({
            ...draft,
            search: current.search,
            period: current.period,
        }));
        setModalOpen(false);
    }

    /**
     * Chips do que está aplicado — o padrão fica de fora. Busca e período não
     * viram chip: os dois têm controle próprio à vista no cabeçalho.
     */
    const activeFilters: ActiveFilter[] = [];

    if (filters.communityId !== "") {
        const name = communities.find(
            (community) => String(community.id) === filters.communityId
        )?.name;

        activeFilters.push({ id: "communityId", label: `Comunidade: ${name ?? filters.communityId}` });
    }
    if (filters.sort !== EMPTY_FILTERS.sort) {
        activeFilters.push({ id: "sort", label: "Mais distantes primeiro" });
    }

    /**
     * A busca fica fora dos chips, então entra à parte no estado vazio. O período
     * não entra: ele escolhe *qual* agenda se está vendo, e o `emptyMessage`
     * abaixo já tem o texto certo para cada uma.
     */
    const hasFilters = activeFilters.length > 0 || filters.search.trim() !== "";

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

                    <PageHeader
                        icon={TrophyIcon}
                        title="Eventos"
                        subtitle="A agenda das comunidades de que você participa."
                    >
                        <SearchField
                            value={filters.search}
                            onChange={(search) => setFilters({ ...filters, search })}
                            label="Buscar eventos"
                            placeholder="Buscar por nome, local ou comunidade"
                        />

                        {/* o período recorta a agenda inteira (a API refaz a busca),
                            então vale um atalho à vista em vez de só no modal */}
                        <div className="flex flex-row flex-wrap items-center gap-2">
                            <StatChip
                                icon={CalendarIcon}
                                label={PERIOD_LABELS.upcoming}
                                active={filters.period === "upcoming"}
                                onClick={() => setFilters({ ...filters, period: "upcoming" })}
                            />
                            <StatChip
                                icon={ClockIcon}
                                label={PERIOD_LABELS.past}
                                active={filters.period === "past"}
                                onClick={() => setFilters({ ...filters, period: "past" })}
                            />
                            <StatChip
                                icon={TrophyIcon}
                                label={PERIOD_LABELS.all}
                                active={filters.period === "all"}
                                onClick={() => setFilters({ ...filters, period: "all" })}
                            />
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
                    </PageHeader>

                    <div className="p-4 sm:p-6">
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
                            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed
                                border-line px-6 py-14 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full
                                    bg-brand-subtle text-brand">
                                    <TrophyIcon className="size-8" />
                                </span>

                                <h2 className="text-base font-semibold">
                                    {hasFilters ? "Nenhum resultado" : "Nada na agenda"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {hasFilters
                                        ? "Nenhum evento combina com a busca e os filtros aplicados."
                                        : emptyMessage}
                                </p>

                                {hasFilters ? (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                        className="mt-1 font-semibold"
                                    >
                                        Limpar filtros
                                    </Button>
                                ) : (
                                    <Link
                                        href="/social-media/communities"
                                        className="mt-1 inline-flex items-center justify-center rounded-full
                                            border-2 border-brand px-4 py-2 text-sm font-semibold text-brand
                                            transition-colors hover:bg-brand-subtle
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Ver comunidades
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside
                    aria-label="Sobre a agenda"
                    className="w-full lg:w-[28%] flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start"
                >
                    <Container className="rounded-card" padding="p-4">
                        <div className="mb-4 flex flex-row items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                                bg-brand-subtle text-brand">
                                <CommunityIcon className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <h2 className="text-base font-semibold leading-tight">Como funciona</h2>
                                <p className="text-xs text-content-muted">De onde vêm os eventos</p>
                            </div>
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
                onClear={() => setDraft({ ...EMPTY_FILTERS, search: draft.search, period: draft.period })}
                title="Filtrar eventos"
            >
                {/* busca e período têm controle próprio no cabeçalho */}
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
