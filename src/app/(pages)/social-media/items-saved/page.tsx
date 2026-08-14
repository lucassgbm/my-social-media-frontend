'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Container from "../../../../../components/container";
import Sidebar from "../../../../../components/sidebar";
import SidebarFooter from "../../../../../components/sidebar-footer";
import PageHeader from "../../../../../components/page-header";
import StatChip from "../../../../../components/stat-chip";
import Button from "../../../../../components/button";
import Skeleton from "../../../../../components/skeleton";
import Feed from "../../../../../components/feed";
import EventCard from "../../../../../components/communities/event-card";
import BookMarkIcon from "../../../../../components/icons/book-mark";
import TrophyIcon from "../../../../../components/icons/trophy";
import PhotoIcon from "../../../../../components/icons/photo";
import ArrowLeftIcon from "../../../../../components/icons/arrow-left";
import ArrowRightIcon from "../../../../../components/icons/arrow-right";
import { get } from "@/api/services/request";
import { useToaster } from "../../../../../providers/toaster-provider";
import {
    SAVED_ENDPOINT,
    type SavedCounts,
    type SavedItem,
    type SavedType,
} from "../../../../../utils/saved";

/** Aba aberta. "all" não vai para a API — é a ausência do filtro. */
type Tab = "all" | SavedType;

const TABS: { id: Tab; label: string; icon: typeof BookMarkIcon }[] = [
    { id: "all", label: "Todos", icon: BookMarkIcon },
    { id: "post", label: "Posts", icon: PhotoIcon },
    { id: "event", label: "Eventos", icon: TrophyIcon },
];

const EMPTY_COUNTS: SavedCounts = { post: 0, event: 0, all: 0 };

const EMPTY_MESSAGE: Record<Tab, string> = {
    all: "Use o marcador nos posts e nos eventos para guardá-los aqui.",
    post: "Nenhum post salvo. O marcador fica na barra de ações de cada post.",
    event: "Nenhum evento salvo. O marcador fica no canto do card do evento.",
};

/**
 * Itens salvos: posts e eventos que a pessoa guardou para ver depois.
 *
 * A lista é a mesma para os dois tipos — cada item é renderizado pelo card que
 * já existe para ele (o do feed e o da agenda), então o que é possível fazer
 * com um post salvo é o mesmo que no feed, comentários inclusive.
 */
export default function SavedItemsPage() {
    const { showToast } = useToaster();

    const [items, setItems] = useState<SavedItem[]>([]);
    const [counts, setCounts] = useState<SavedCounts>(EMPTY_COUNTS);
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState<Tab>("all");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const loadItems = useCallback(async () => {
        setLoading(true);

        const query = tab === "all" ? `?page=${page}` : `?type=${tab}&page=${page}`;
        const response = await get(`${SAVED_ENDPOINT}${query}`);

        // get() engole o erro e devolve undefined
        if (!response) {
            showToast({
                title: "Salvos",
                message: "Não foi possível carregar os seus itens salvos.",
                status: "error",
            });
        }

        setItems(response?.data ?? []);
        setCounts(response?.counts ?? EMPTY_COUNTS);
        setLastPage(response?.meta?.last_page ?? 1);
        setLoading(false);
    }, [tab, page, showToast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    function changeTab(next: Tab) {
        setTab(next);
        // a aba nova tem outra contagem de páginas: continuar na 3 abriria uma
        // lista vazia
        setPage(1);
    }

    /**
     * O marcador de um card mudou.
     *
     * Só interessa quando ele foi desmarcado: o item sai da tela na hora, sem
     * esperar a lista inteira recarregar. Esvaziando a página, aí sim recarrega
     * — é o que ajusta a paginação depois de tirar o último item dela.
     */
    function handleSavedChange(type: SavedType, itemId: number, saved: boolean) {
        if (saved) return;

        const remaining = items.filter(
            (item) => !(item.type === type && (type === "post" ? item.post?.id : item.event?.id) === itemId)
        );

        setItems(remaining);
        setCounts((current) => ({
            ...current,
            [type]: Math.max(current[type] - 1, 0),
            all: Math.max(current.all - 1, 0),
        }));

        showToast({ title: "Salvos", message: "Item removido dos salvos.", status: "success" });

        if (remaining.length === 0) {
            // a página anterior passa a ser a última quando esta era a única
            if (page > 1) setPage(page - 1);
            else loadItems();
        }
    }

    const countOf = (id: Tab) => counts[id] ?? 0;

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col lg:flex-row gap-4">
                <Container className="w-full lg:w-[72%] rounded-card min-w-0" padding="p-0">

                    <PageHeader
                        icon={BookMarkIcon}
                        title="Salvos"
                        subtitle="Os posts e eventos que você guardou para ver depois."
                    >
                        <div
                            role="tablist"
                            aria-label="Tipo de item salvo"
                            className="flex flex-row flex-wrap items-center gap-2"
                        >
                            {TABS.map(({ id, label, icon }) => (
                                <StatChip
                                    key={id}
                                    icon={icon}
                                    label={label}
                                    value={countOf(id)}
                                    active={tab === id}
                                    onClick={() => changeTab(id)}
                                    role="tab"
                                />
                            ))}
                        </div>
                    </PageHeader>

                    <div className="flex flex-col gap-4 p-4 sm:p-6">
                        {loading && (
                            <>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-[180px]" rounded="card" />
                                ))}
                            </>
                        )}

                        {!loading && items.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="flex flex-col gap-1">
                                {item.saved_at && (
                                    <span className="text-xs text-content-muted">
                                        Salvo {item.saved_at}
                                    </span>
                                )}

                                {/* o post reaproveita o card do feed — modal de
                                    comentários incluso; a lista tem no máximo 10
                                    itens, então uma instância por post não pesa */}
                                {item.type === "post" && item.post && (
                                    <Feed
                                        feed={[item.post]}
                                        onSavedChange={(postId, saved) =>
                                            handleSavedChange("post", postId, saved)
                                        }
                                    />
                                )}

                                {item.type === "event" && item.event && (
                                    <EventCard
                                        event={item.event}
                                        href={`/social-media/events/${item.event.id}`}
                                        showCommunity
                                        onSavedChange={(eventId, saved) =>
                                            handleSavedChange("event", eventId, saved)
                                        }
                                    />
                                )}
                            </div>
                        ))}

                        {!loading && items.length === 0 && (
                            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed
                                border-line px-6 py-14 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full
                                    bg-brand-subtle text-brand">
                                    <BookMarkIcon className="size-8" />
                                </span>

                                <h2 className="text-base font-semibold">Nada salvo ainda</h2>

                                <p className="max-w-sm text-sm text-content-muted">
                                    {EMPTY_MESSAGE[tab]}
                                </p>

                                <Link
                                    href={tab === "event" ? "/social-media/events" : "/social-media"}
                                    className="mt-1 inline-flex items-center justify-center rounded-full
                                        border-2 border-brand px-4 py-2 text-sm font-semibold text-brand
                                        transition-colors hover:bg-brand-subtle
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    {tab === "event" ? "Ver a agenda" : "Ir para o feed"}
                                </Link>
                            </div>
                        )}

                        {/* anterior/próximo, de 10 em 10 — a lista some inteira a
                            cada página, então rolar de volta ao topo não é preciso */}
                        {!loading && lastPage > 1 && (
                            <div className="flex flex-row items-center justify-center gap-3 pt-2">
                                <Button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1}
                                    aria-label="Página anterior"
                                >
                                    <ArrowLeftIcon className="size-4" />
                                </Button>

                                <span className="text-sm text-content-muted">
                                    Página {page} de {lastPage}
                                </span>

                                <Button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= lastPage}
                                    aria-label="Próxima página"
                                >
                                    <ArrowRightIcon className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </Container>

                <aside
                    aria-label="Sobre os salvos"
                    className="w-full lg:w-[28%] flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start"
                >
                    <Container className="rounded-card" padding="p-4">
                        <div className="mb-4 flex flex-row items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                                bg-brand-subtle text-brand">
                                <BookMarkIcon className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <h2 className="text-base font-semibold leading-tight">Como funciona</h2>
                                <p className="text-xs text-content-muted">Guardar e desfazer</p>
                            </div>
                        </div>

                        <p className="text-sm text-content-muted">
                            O marcador aparece na barra de ações dos posts e no canto dos cards de
                            evento. Clicar de novo tira o item daqui — nada é apagado, só sai da
                            sua lista.
                        </p>

                        <p className="mt-3 text-sm text-content-muted">
                            A lista é sua e ninguém mais vê o que você guardou.
                        </p>
                    </Container>

                    <SidebarFooter />
                </aside>
            </div>
        </>
    );
}
