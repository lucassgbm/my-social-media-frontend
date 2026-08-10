'use client';

import { useEffect, useMemo, useState } from "react";
import { get, post } from "@/api/services/request";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import CardUser from "../../../../../components/users/card-user";
import PeopleSuggestions from "../../../../../components/users/people-suggestions";
import RequestFriend from "../../../../../components/friends/request-friend";
import FilterBar, { type ActiveFilter } from "../../../../../components/filters/filter-bar";
import FilterModal from "../../../../../components/filters/filter-modal";
import Input from "../../../../../components/input";
import Select from "../../../../../components/select";
import Skeleton from "../../../../../components/skeleton";
import UsersIcon from "../../../../../components/icons/users";
import InboxIcon from "../../../../../components/icons/inbox";
import { useToaster } from "../../../../../providers/toaster-provider";
import type { Person } from "../../../../../utils/friendship";

type Tab = "friends" | "requests";

type Filters = {
    search: string;
    /** Sigla da UF, "" para todas. */
    uf: string;
    sort: "name" | "name_desc";
};

const EMPTY_FILTERS: Filters = { search: "", uf: "", sort: "name" };

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";

export default function Home() {
    const { showToast } = useToaster();

    const [tab, setTab] = useState<Tab>("friends");

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    // rascunho do modal: a lista só muda quando se aplica
    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
    const [modalOpen, setModalOpen] = useState(false);

    const [friends, setFriends] = useState<Person[]>([]);
    const [requests, setRequests] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setLoading(true);

        // get() engole o erro e devolve undefined — por isso o fallback [] aqui
        const [friendsResponse, requestsResponse] = await Promise.all([
            get("/social-media/friends"),
            get("/social-media/friends/requests"),
        ]);

        if (!friendsResponse || !requestsResponse) {
            showToast({
                title: "Amigos",
                message: "Não foi possível carregar a sua lista.",
                status: "error",
            });
        }

        setFriends(friendsResponse?.data ?? []);
        setRequests(requestsResponse?.data ?? []);
        setLoading(false);
    }

    async function acceptRequest(userId: number) {
        setAcceptingId(userId);

        const response = await post("/social-media/friends/accept", { user_id: userId });

        if (!response) {
            showToast({
                title: "Amigos",
                message: "Não foi possível aceitar a solicitação.",
                status: "error",
            });
            setAcceptingId(null);
            return;
        }

        const accepted = requests.find((person) => person.id === userId);

        setRequests((current) => current.filter((person) => person.id !== userId));
        if (accepted) {
            setFriends((current) => [{ ...accepted, friendship_status: "friends" }, ...current]);
        }

        showToast({
            title: "Amigos",
            message: `Agora vocês são amigos${accepted ? `, ${accepted.name}` : ""}!`,
            status: "success",
        });
        setAcceptingId(null);
    }

    async function declineRequest(userId: number) {
        setAcceptingId(userId);

        const response = await post("/social-media/friends/decline", { user_id: userId });

        setAcceptingId(null);

        if (!response) {
            showToast({
                title: "Amigos",
                message: "Não foi possível recusar a solicitação.",
                status: "error",
            });
            return;
        }

        setRequests((current) => current.filter((person) => person.id !== userId));
    }

    const list = tab === "friends" ? friends : requests;

    /** UFs presentes na lista — não adianta oferecer estado sem ninguém. */
    const availableUfs = useMemo(() => {
        const ufs = new Set(
            [...friends, ...requests].map((person) => person.uf).filter(Boolean) as string[]
        );

        return Array.from(ufs).sort();
    }, [friends, requests]);

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();

        const result = list.filter((person) => {
            const matchesTerm = term === "" || person.name?.toLowerCase().includes(term);
            const matchesUf = filters.uf === "" || person.uf === filters.uf;

            return matchesTerm && matchesUf;
        });

        return [...result].sort((a, b) => {
            const compared = (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");

            return filters.sort === "name_desc" ? -compared : compared;
        });
    }, [list, filters]);

    function openModal() {
        setDraft(filters);
        setModalOpen(true);
    }

    /** Chips do que está aplicado — o padrão fica de fora. */
    const activeFilters: ActiveFilter[] = [];

    if (filters.search.trim() !== "") {
        activeFilters.push({ id: "search", label: `Busca: ${filters.search}` });
    }
    if (filters.uf !== "") {
        activeFilters.push({ id: "uf", label: `UF: ${filters.uf}` });
    }
    if (filters.sort !== EMPTY_FILTERS.sort) {
        activeFilters.push({ id: "sort", label: "Nome (Z-A)" });
    }

    function removeFilter(id: string) {
        setFilters((current) => ({ ...current, [id]: EMPTY_FILTERS[id as keyof Filters] }));
    }

    const tabClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <div className="flex flex-col gap-4 border-b border-line p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h1 className="text-2xl font-semibold">Amigos</h1>
                            {/* a contagem do resultado fica na barra de filtros */}
                            <p className="text-sm text-content-muted">
                                {friends.length} {friends.length === 1 ? "amigo" : "amigos"} no total
                            </p>
                        </div>

                        {/* Os filtros vivem no modal; aqui ficam o acesso a ele e
                            o que estiver aplicado, em chips removíveis */}
                        <FilterBar
                            onOpen={openModal}
                            active={activeFilters}
                            onRemove={removeFilter}
                            onClearAll={() => setFilters(EMPTY_FILTERS)}
                            summary={
                                loading
                                    ? "Carregando..."
                                    : `${filtered.length} ${filtered.length === 1 ? "pessoa" : "pessoas"}`
                            }
                        />

                        <div role="tablist" aria-label="Listas de amigos" className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "friends"}
                                onClick={() => setTab("friends")}
                                className={tabClass(tab === "friends")}
                            >
                                <UsersIcon className="size-4" />
                                Meus amigos
                                <span className="text-xs opacity-80">{friends.length}</span>
                            </button>

                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "requests"}
                                onClick={() => setTab("requests")}
                                className={tabClass(tab === "requests")}
                            >
                                <InboxIcon className="size-4" />
                                Solicitações
                                {requests.length > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full
                                        bg-danger px-1.5 text-[11px] font-semibold text-white">
                                        {requests.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        {loading && (
                            <div className={GRID}>
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        width="w-full"
                                        rounded="card"
                                        className="aspect-square"
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filtered.length > 0 && (
                            <div className={GRID}>
                                {tab === "friends"
                                    ? filtered.map((person) => (
                                        <CardUser key={person.id} user={person} />
                                    ))
                                    : (
                                        <RequestFriend
                                            friends={filtered.map((person) => ({
                                                id: person.id,
                                                name: person.name,
                                                photo: person.photo ?? null,
                                            }))}
                                            acceptRequest={acceptRequest}
                                            declineRequest={declineRequest}
                                            pendingId={acceptingId}
                                        />
                                    )}
                            </div>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                {tab === "friends" ? (
                                    <UsersIcon className="size-10 text-content-subtle" />
                                ) : (
                                    <InboxIcon className="size-10 text-content-subtle" />
                                )}

                                <h2 className="text-base font-semibold">
                                    {activeFilters.length > 0
                                        ? "Nenhum resultado"
                                        : tab === "friends"
                                            ? "Você ainda não tem amigos por aqui"
                                            : "Nenhuma solicitação pendente"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {activeFilters.length > 0
                                        ? "Ninguém desta lista combina com os filtros aplicados."
                                        : tab === "friends"
                                            ? "Confira as sugestões ao lado e envie o primeiro convite."
                                            : "Quando alguém te enviar um convite, ele aparece aqui."}
                                </p>

                                {activeFilters.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                        className="mt-2 rounded-field px-3 py-1 text-sm font-semibold text-brand
                                            cursor-pointer hover:bg-surface-2 transition-colors
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside aria-label="Sugestões" className="w-full flex flex-col lg:w-[28%] gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <h2 className="text-lg font-semibold mb-4">Amigos sugeridos</h2>
                        <PeopleSuggestions limit={6} gridClassName="grid grid-cols-2 gap-4" />
                    </Container>
                </aside>
            </div>

            <FilterModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onApply={() => {
                    setFilters(draft);
                    setModalOpen(false);
                }}
                onClear={() => setDraft(EMPTY_FILTERS)}
                title="Filtrar pessoas"
            >
                <Input
                    label="Buscar"
                    type="search"
                    placeholder="Nome da pessoa"
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                />

                <Select
                    label="Estado"
                    value={draft.uf}
                    onChange={(e) => setDraft({ ...draft, uf: e.target.value })}
                    options={[
                        { value: "", label: "Todos os estados" },
                        ...availableUfs.map((uf) => ({ value: uf, label: uf })),
                    ]}
                />

                <Select
                    label="Ordenar por"
                    value={draft.sort}
                    onChange={(e) => setDraft({ ...draft, sort: e.target.value as Filters["sort"] })}
                    options={[
                        { value: "name", label: "Nome (A-Z)" },
                        { value: "name_desc", label: "Nome (Z-A)" },
                    ]}
                />
            </FilterModal>
        </>
    );
}
