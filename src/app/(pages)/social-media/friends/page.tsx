'use client';

import { useEffect, useMemo, useState } from "react";
import { get, post } from "@/api/services/request";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import CardUser from "../../../../../components/users/card-user";
import RequestFriend from "../../../../../components/friends/request-friend";
import Skeleton from "../../../../../components/skeleton";
import SearchIcon from "../../../../../components/icons/search";
import CloseIcon from "../../../../../components/icons/close";
import UsersIcon from "../../../../../components/icons/users";
import InboxIcon from "../../../../../components/icons/inbox";
import { suggestedFriends } from "../../../../../mocks/suggestions";
import { useToaster } from "../../../../../providers/toaster-provider";

type Person = {
    id: number;
    name: string;
    photo?: string | null;
    autodescription?: string | null;
};

type Tab = "friends" | "requests";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";

export default function Home() {
    const { showToast } = useToaster();

    const [tab, setTab] = useState<Tab>("friends");
    const [search, setSearch] = useState("");

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
        if (accepted) setFriends((current) => [accepted, ...current]);

        showToast({
            title: "Amigos",
            message: `Agora vocês são amigos${accepted ? `, ${accepted.name}` : ""}!`,
            status: "success",
        });
        setAcceptingId(null);
    }

    function declineRequest(userId: number) {
        // Sem endpoint de recusa na API ainda: some da lista só nesta sessão.
        setRequests((current) => current.filter((person) => person.id !== userId));
    }

    const list = tab === "friends" ? friends : requests;

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (term === "") return list;
        return list.filter((person) => person.name?.toLowerCase().includes(term));
    }, [list, search]);

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
                            <span className="text-sm text-content-muted">
                                {loading
                                    ? "Carregando..."
                                    : `${friends.length} ${friends.length === 1 ? "amigo" : "amigos"}`}
                            </span>
                        </div>

                        {/* Busca real, filtrando a aba atual — antes o botão de lupa
                            abria o modal de comunidade e não buscava nada */}
                        <div className="flex w-full items-center gap-2 rounded-full border border-line
                            bg-surface-2 px-4 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                            <SearchIcon className="size-5 shrink-0 text-content-muted" />
                            <input
                                type="search"
                                aria-label="Buscar amigos pelo nome"
                                placeholder="Buscar pelo nome..."
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
                                        <CardUser
                                            key={person.id}
                                            user={{
                                                id: person.id,
                                                name: person.name,
                                                photo_path: person.photo ?? "/imgs/placeholder.png",
                                                title: person.autodescription ?? "",
                                            }}
                                        />
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
                                    {search
                                        ? "Nenhum resultado"
                                        : tab === "friends"
                                            ? "Você ainda não tem amigos por aqui"
                                            : "Nenhuma solicitação pendente"}
                                </h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {search
                                        ? `Não encontramos ninguém com "${search}".`
                                        : tab === "friends"
                                            ? "Confira as sugestões ao lado e envie o primeiro convite."
                                            : "Quando alguém te enviar um convite, ele aparece aqui."}
                                </p>
                            </div>
                        )}
                    </div>
                </Container>

                <aside aria-label="Sugestões" className="w-full flex flex-col lg:w-[28%] gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <h2 className="text-lg font-semibold mb-4">Amigos sugeridos</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {suggestedFriends.slice(0, 6).map((user) => (
                                <CardUser user={user} key={user.id} />
                            ))}
                        </div>
                    </Container>
                </aside>
            </div>

        </>
    );
}
