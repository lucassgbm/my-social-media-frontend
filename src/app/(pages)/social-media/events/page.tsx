'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import SidebarFooter from "../../../../../components/sidebar-footer";
import EventCard from "../../../../../components/communities/event-card";
import Skeleton from "../../../../../components/skeleton";
import SearchIcon from "../../../../../components/icons/search";
import CloseIcon from "../../../../../components/icons/close";
import TrophyIcon from "../../../../../components/icons/trophy";
import ClockIcon from "../../../../../components/icons/clock";
import CalendarIcon from "../../../../../components/icons/calendar";
import CommunityIcon from "../../../../../components/icons/community";
import { get } from "@/api/services/request";
import { useToaster } from "../../../../../providers/toaster-provider";
import type { CommunityEvent, EventFilter } from "../../../../../utils/community";

const FILTERS: { id: EventFilter; label: string; icon: typeof TrophyIcon }[] = [
    { id: "upcoming", label: "Próximos", icon: CalendarIcon },
    { id: "past", label: "Encerrados", icon: ClockIcon },
    { id: "all", label: "Todos", icon: TrophyIcon },
];

const GRID = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4";

/**
 * Agenda pessoal: os eventos das comunidades de que o usuário participa.
 *
 * O corte entre próximo e encerrado é do backend (por `date_end`, para um
 * evento de vários dias não vencer no primeiro deles); aqui só se escolhe o
 * filtro. A busca por nome é local, sobre o que já veio.
 */
export default function EventsPage() {
    const { showToast } = useToaster();

    const [filter, setFilter] = useState<EventFilter>("upcoming");
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadEvents = useCallback(async () => {
        setLoading(true);

        const response = await get(`/social-media/events?filter=${filter}`);

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
    }, [filter, showToast]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (term === "") return events;

        return events.filter((event) =>
            [event.title, event.local, event.community?.name]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(term))
        );
    }, [events, search]);

    const filterClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    const emptyMessage =
        filter === "past"
            ? "Nenhum evento encerrado por aqui."
            : filter === "upcoming"
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
                            <span className="text-sm text-content-muted">
                                {loading
                                    ? "Carregando..."
                                    : `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`}
                            </span>
                        </div>

                        <p className="text-sm text-content-muted">
                            A agenda das comunidades de que você participa.
                        </p>

                        <div className="flex w-full items-center gap-2 rounded-full border border-line
                            bg-surface-2 px-4 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                            <SearchIcon className="size-5 shrink-0 text-content-muted" />
                            <input
                                type="search"
                                aria-label="Buscar eventos"
                                placeholder="Buscar por nome, local ou comunidade..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent text-sm text-content placeholder:text-content-subtle outline-none"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Limpar busca"
                                    className="rounded-full p-1 text-content-muted hover:bg-surface-3 hover:text-content
                                        cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    <CloseIcon className="size-3" />
                                </button>
                            )}
                        </div>

                        <div role="tablist" aria-label="Filtrar eventos" className="flex flex-wrap gap-2">
                            {FILTERS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={filter === id}
                                    onClick={() => setFilter(id)}
                                    className={filterClass(filter === id)}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
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
                                    {search ? "Nenhum resultado" : "Nada na agenda"}
                                </h2>
                                <p className="max-w-sm text-sm text-content-muted">
                                    {search ? `Não encontramos nada com "${search}".` : emptyMessage}
                                </p>

                                {!search && (
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
        </>
    );
}
