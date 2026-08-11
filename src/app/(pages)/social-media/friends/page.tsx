'use client';

import { useEffect, useMemo, useState } from "react";
import { get, post } from "@/api/services/request";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import PageHeader from "../../../../../components/page-header";
import StatChip from "../../../../../components/stat-chip";
import Button from "../../../../../components/button";
import CardUser from "../../../../../components/users/card-user";
import PeopleSuggestions from "../../../../../components/users/people-suggestions";
import RequestFriend from "../../../../../components/friends/request-friend";
import FilterBar, { type ActiveFilter } from "../../../../../components/filters/filter-bar";
import FilterModal from "../../../../../components/filters/filter-modal";
import SearchField from "../../../../../components/filters/search-field";
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

    /**
     * Chips do que está aplicado — o padrão fica de fora. A busca não vira chip:
     * o campo é visível no cabeçalho e já mostra (e limpa) o termo.
     */
    const activeFilters: ActiveFilter[] = [];

    if (filters.uf !== "") {
        activeFilters.push({ id: "uf", label: `UF: ${filters.uf}` });
    }
    if (filters.sort !== EMPTY_FILTERS.sort) {
        activeFilters.push({ id: "sort", label: "Nome (Z-A)" });
    }

    /** A busca fica fora dos chips, então entra à parte no estado vazio. */
    const hasFilters = activeFilters.length > 0 || filters.search.trim() !== "";

    function removeFilter(id: string) {
        setFilters((current) => ({ ...current, [id]: EMPTY_FILTERS[id as keyof Filters] }));
    }

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <PageHeader
                        icon={UsersIcon}
                        title="Amigos"
                        subtitle="As pessoas da sua rede e quem quer entrar nela."
                    >
                        <SearchField
                            value={filters.search}
                            onChange={(search) => setFilters({ ...filters, search })}
                            label="Buscar pessoas"
                            placeholder="Buscar pelo nome da pessoa"
                        />

                        {/* as duas listas viraram chips como os das outras telas —
                            continuam sendo abas, só mudou a aparência */}
                        <div
                            role="tablist"
                            aria-label="Listas de amigos"
                            className="flex flex-row flex-wrap items-center gap-2"
                        >
                            <StatChip
                                role="tab"
                                icon={UsersIcon}
                                label="meus amigos"
                                value={friends.length}
                                active={tab === "friends"}
                                onClick={() => setTab("friends")}
                            />

                            <StatChip
                                role="tab"
                                icon={InboxIcon}
                                label="solicitações"
                                value={requests.length}
                                active={tab === "requests"}
                                onClick={() => setTab("requests")}
                                badge={
                                    requests.length > 0 && tab !== "requests" ? (
                                        <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
                                    ) : null
                                }
                            />
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
                    </PageHeader>

                    <div className="p-4 sm:p-6">
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
                            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed
                                border-line px-6 py-14 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full
                                    bg-brand-subtle text-brand">
                                    {tab === "friends" ? (
                                        <UsersIcon className="size-8" />
                                    ) : (
                                        <InboxIcon className="size-8" />
                                    )}
                                </span>

                                <h2 className="text-base font-semibold">
                                    {hasFilters
                                        ? "Nenhum resultado"
                                        : tab === "friends"
                                            ? "Você ainda não tem amigos por aqui"
                                            : "Nenhuma solicitação pendente"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {hasFilters
                                        ? "Ninguém desta lista combina com a busca e os filtros aplicados."
                                        : tab === "friends"
                                            ? "Confira as sugestões ao lado e envie o primeiro convite."
                                            : "Quando alguém te enviar um convite, ele aparece aqui."}
                                </p>

                                {hasFilters && (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setFilters(EMPTY_FILTERS)}
                                        className="mt-1 font-semibold"
                                    >
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                <aside
                    aria-label="Sugestões"
                    className="w-full flex flex-col lg:w-[28%] gap-4 lg:sticky lg:top-4 lg:self-start"
                >
                    <Container className="rounded-card" padding="p-4">
                        <div className="mb-4 flex flex-row items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                                bg-brand-subtle text-brand">
                                <UsersIcon className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <h2 className="text-base font-semibold leading-tight">Para você</h2>
                                <p className="text-xs text-content-muted">Amigos sugeridos</p>
                            </div>
                        </div>

                        <PeopleSuggestions limit={6} gridClassName="grid grid-cols-2 gap-4" />
                    </Container>
                </aside>
            </div>

            <FilterModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onApply={() => {
                    // o termo de busca é do campo do cabeçalho: o modal não o toca
                    setFilters((current) => ({ ...draft, search: current.search }));
                    setModalOpen(false);
                }}
                onClear={() => setDraft({ ...EMPTY_FILTERS, search: draft.search })}
                title="Filtrar pessoas"
            >
                {/* a busca mora no campo do cabeçalho — aqui ficam só os recortes */}
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
