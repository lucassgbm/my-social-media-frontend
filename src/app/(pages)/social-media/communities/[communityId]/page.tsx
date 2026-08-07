'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "../../../../../../components/remote-image";
import Container from "../../../../../../components/container";
import Card from "../../../../../../components/card";
import Button from "../../../../../../components/button";
import ColorButton from "../../../../../../components/color-button";
import Sidebar from "../../../../../../components/sidebar";
import SidebarFooter from "../../../../../../components/sidebar-footer";
import CardUser from "../../../../../../components/users/card-user";
import CardEvent from "../../../../../../components/events/card-event";
import Skeleton from "../../../../../../components/skeleton";
import Toaster from "../../../../../../components/toaster";
import PinIcon from "../../../../../../components/icons/pin";
import TrophyIcon from "../../../../../../components/icons/trophy";
import CommunityIcon from "../../../../../../components/icons/community";
import UsersIcon from "../../../../../../components/icons/users";
import MessageIcon from "../../../../../../components/icons/message";
import PhotoIcon from "../../../../../../components/icons/photo";
import PlusIcon from "../../../../../../components/icons/plus";
import EllipsisVerticalIcon from "../../../../../../components/icons/ellipsis";
import { get } from "@/api/services/request";
import {
    communityTopics,
    communityGallery,
    suggestedFriends,
    suggestedEvents,
} from "../../../../../../mocks/suggestions";

type Community = {
    id: number;
    name: string;
    description?: string | null;
    photo?: string | null;
};

type Tab = "topics" | "photos" | "members";

const TABS: { id: Tab; label: string; icon: typeof UsersIcon }[] = [
    { id: "topics", label: "Tópicos", icon: MessageIcon },
    { id: "photos", label: "Fotos", icon: PhotoIcon },
    { id: "members", label: "Membros", icon: UsersIcon },
];

export default function CommunityPage() {
    const params = useParams<{ communityId: string }>();
    const communityId = params?.communityId ?? "";

    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);
    const [tab, setTab] = useState<Tab>("topics");

    const [toaster, setToaster] = useState({
        show: false,
        message: "",
        status: "",
        title: "Comunidade",
    });

    useEffect(() => {
        getCommunity();
    }, [communityId]);

    async function getCommunity() {
        setLoading(true);

        // get() devolve undefined quando a requisição falha
        const response = await get(`/social-media/community/${communityId}`);

        if (!response) {
            setToaster({
                show: true,
                title: "Comunidade",
                message: "Não foi possível carregar a comunidade.",
                status: "error",
            });
            setCommunity(null);
        } else {
            setCommunity(response.data ?? null);
        }

        setLoading(false);
    }

    const tabClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    const initial = community?.name?.charAt(0).toUpperCase() ?? "?";

    return (
        <>
            {/* Antes esta página tinha a própria barra lateral — uma cópia da
                Sidebar global, mas com links globais (amigos, eventos, ajustes)
                dentro do contexto da comunidade. */}
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col xl:flex-row gap-4">

                <div className="flex-1 min-w-0 flex flex-col gap-4">

                    {/* --- Cabeçalho: capa + avatar sobreposto --- */}
                    <Container className="rounded-card overflow-hidden" padding="p-0" as="section">
                        <div className="relative h-36 sm:h-52 w-full bg-surface-2">
                            {community?.photo ? (
                                <Image
                                    src={community.photo}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1280px) 100vw, 800px"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/imgs/drift.jpg"
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1280px) 100vw, 800px"
                                    priority
                                />
                            )}
                        </div>

                        {/* relative z-10: a capa é uma <Image fill> (posicionada) e
                            cobriria este bloco na ordem de pintura do CSS */}
                        <div className="relative z-10 px-4 pb-4 sm:px-6">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div className="-mt-14 sm:-mt-20">
                                    {loading ? (
                                        <Skeleton
                                            width="w-[112px] sm:w-[150px]"
                                            height="h-[112px] sm:h-[150px]"
                                            rounded="card"
                                        />
                                    ) : (
                                        <div className="w-[112px] sm:w-[150px] rounded-card border-4 border-surface bg-surface-3 overflow-hidden">
                                            {community?.photo ? (
                                                <Image
                                                    src={community.photo}
                                                    alt={`Imagem da comunidade ${community.name}`}
                                                    width={150}
                                                    height={150}
                                                    sizes="150px"
                                                    className="w-full aspect-square object-cover"
                                                />
                                            ) : (
                                                <div className="w-full aspect-square flex items-center justify-center
                                                    text-4xl font-semibold text-content-muted">
                                                    {initial}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:pb-2">
                                    <ColorButton
                                        onClick={() => setJoined(!joined)}
                                        bgColor={joined ? "bg-surface-3" : undefined}
                                        className="flex-1 sm:flex-none px-4 text-sm font-semibold"
                                    >
                                        <PlusIcon className="size-4 shrink-0" />
                                        {joined ? "Participando" : "Participar"}
                                    </ColorButton>

                                    <Button aria-label="Mais opções" className="shrink-0">
                                        <EllipsisVerticalIcon className="size-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {loading ? (
                                    <>
                                        <Skeleton width="w-[220px]" height="h-[28px]" rounded="field" />
                                        <Skeleton width="w-full" height="h-[40px]" rounded="field" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-row items-center gap-1 text-content-muted">
                                            <PinIcon className="size-3" />
                                            <span className="text-sm">Brasília - DF</span>
                                        </div>

                                        <h1 className="text-2xl font-semibold">
                                            {community?.name ?? "Comunidade não encontrada"}
                                        </h1>

                                        {community?.description && (
                                            <p className="text-sm text-content-muted max-w-2xl">
                                                {community.description}
                                            </p>
                                        )}
                                    </>
                                )}

                                <dl className="mt-2 flex flex-row flex-wrap gap-6">
                                    <div className="flex flex-col">
                                        <dt className="sr-only">Membros</dt>
                                        <dd className="text-lg font-semibold">1.234</dd>
                                        <span className="text-xs text-content-muted">Membros</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="sr-only">Eventos</dt>
                                        <dd className="text-lg font-semibold">{suggestedEvents.length}</dd>
                                        <span className="text-xs text-content-muted">Eventos</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="sr-only">Tópicos</dt>
                                        <dd className="text-lg font-semibold">{communityTopics.length}</dd>
                                        <span className="text-xs text-content-muted">Tópicos</span>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </Container>

                    {/* --- Abas --- */}
                    <Container className="rounded-card" padding="p-0" as="section">
                        <div
                            role="tablist"
                            aria-label="Seções da comunidade"
                            className="flex flex-row gap-2 overflow-x-auto scrollbar-hide border-b border-line p-4"
                        >
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === id}
                                    onClick={() => setTab(id)}
                                    className={`${tabClass(tab === id)} shrink-0 whitespace-nowrap`}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="p-4">
                            {tab === "topics" && (
                                <ul className="flex flex-col gap-2 list-none">
                                    {communityTopics.map((topic) => (
                                        <li key={topic.id}>
                                            <Link
                                                href="#"
                                                className="flex flex-row items-center justify-between gap-3 rounded-card p-3
                                                    hover:bg-surface-2 transition-colors
                                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                            >
                                                <div className="flex flex-row items-center gap-3 min-w-0">
                                                    <Image
                                                        src={topic.image}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        sizes="40px"
                                                        className="w-10 aspect-square object-cover rounded-full shrink-0"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold truncate">
                                                            {topic.title}
                                                        </span>
                                                        <span className="text-xs text-content-muted">
                                                            {`${topic.replies} respostas`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <EllipsisVerticalIcon className="size-4 shrink-0 text-content-muted" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {tab === "photos" && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                    {communityGallery.map((item) => (
                                        <Image
                                            key={item.id}
                                            src={item.image}
                                            alt=""
                                            width={300}
                                            height={300}
                                            sizes="(max-width: 640px) 50vw, 200px"
                                            className="w-full aspect-square object-cover rounded-card"
                                        />
                                    ))}
                                </div>
                            )}

                            {tab === "members" && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                    {suggestedFriends.map((member) => (
                                        <CardUser user={member} key={member.id} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Container>
                </div>

                <aside aria-label="Informações da comunidade" className="w-full xl:w-[340px] xl:shrink-0 flex flex-col gap-4">
                    <Container className="rounded-card" padding="p-4">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Próximos eventos</h2>
                            <TrophyIcon className="size-5 text-content-muted" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                            {suggestedEvents.map((event) => (
                                <CardEvent event={event} key={event.id} />
                            ))}
                        </div>
                    </Container>

                    <Container className="rounded-card" padding="p-4">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Sobre</h2>
                            <CommunityIcon className="size-5 text-content-muted" />
                        </div>

                        <Card className="flex flex-col gap-3 p-3">
                            <div className="flex flex-row items-center justify-between">
                                <span className="flex items-center gap-2 text-content-muted text-sm">
                                    <UsersIcon className="size-4" />
                                    Membros
                                </span>
                                <span className="text-sm font-semibold">1.234</span>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <span className="flex items-center gap-2 text-content-muted text-sm">
                                    <TrophyIcon className="size-4" />
                                    Eventos
                                </span>
                                <span className="text-sm font-semibold">{suggestedEvents.length}</span>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <span className="flex items-center gap-2 text-content-muted text-sm">
                                    <MessageIcon className="size-4" />
                                    Tópicos
                                </span>
                                <span className="text-sm font-semibold">{communityTopics.length}</span>
                            </div>
                        </Card>
                    </Container>

                    <SidebarFooter />
                </aside>
            </div>

            {toaster.show && <Toaster toaster={toaster} setToaster={setToaster} />}
        </>
    );
}
