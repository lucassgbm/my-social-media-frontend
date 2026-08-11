'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "../../../../../../components/remote-image";
import Container from "../../../../../../components/container";
import Card from "../../../../../../components/card";
import Button from "../../../../../../components/button";
import ColorButton from "../../../../../../components/color-button";
import Sidebar from "../../../../../../components/sidebar";
import SidebarFooter from "../../../../../../components/sidebar-footer";
import MemberCard from "../../../../../../components/communities/member-card";
import MemberManageModal from "../../../../../../components/communities/member-manage-modal";
import EventCard from "../../../../../../components/communities/event-card";
import EventDetailsModal from "../../../../../../components/communities/event-details-modal";
import TopicModal from "../../../../../../components/communities/topic-modal";
import PhotoModal from "../../../../../../components/communities/photo-modal";
import EventModal from "../../../../../../components/communities/event-modal";
import InviteFriendsModal from "../../../../../../components/communities/invite-friends-modal";
import Skeleton from "../../../../../../components/skeleton";
import PinIcon from "../../../../../../components/icons/pin";
import TrophyIcon from "../../../../../../components/icons/trophy";
import CommunityIcon from "../../../../../../components/icons/community";
import UsersIcon from "../../../../../../components/icons/users";
import MessageIcon from "../../../../../../components/icons/message";
import PhotoIcon from "../../../../../../components/icons/photo";
import PlusIcon from "../../../../../../components/icons/plus";
import CheckIcon from "../../../../../../components/icons/check";
import CloseIcon from "../../../../../../components/icons/close";
import { get, post, remove } from "@/api/services/request";
import { useToaster } from "../../../../../../providers/toaster-provider";
import {
    type Community,
    type CommunityEvent,
    type CommunityMember,
    type CommunityPhoto,
    type CommunityTopic,
} from "../../../../../../utils/community";

type Tab = "topics" | "photos" | "members";

const TABS: { id: Tab; label: string; icon: typeof UsersIcon }[] = [
    { id: "topics", label: "Tópicos", icon: MessageIcon },
    { id: "photos", label: "Fotos", icon: PhotoIcon },
    { id: "members", label: "Membros", icon: UsersIcon },
];

const PHOTO_GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-3";

/**
 * Página da comunidade.
 *
 * Tópicos, fotos, eventos e membros vinham de mocks e não havia papel nenhum:
 * o botão "Participar" só mudava um estado local. Agora tudo vem da API, e o
 * que cada pessoa pode fazer chega decidido nos `can_*` — quem administra
 * cadastra conteúdo e modera; membro comenta nos tópicos.
 */
export default function CommunityPage() {
    const { showToast } = useToaster();

    const params = useParams<{ communityId: string }>();
    const communityId = params?.communityId ?? "";

    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [tab, setTab] = useState<Tab>("topics");

    const [topics, setTopics] = useState<CommunityTopic[]>([]);
    const [photos, setPhotos] = useState<CommunityPhoto[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);

    const [topicModal, setTopicModal] = useState(false);
    const [photoModal, setPhotoModal] = useState(false);
    const [eventModal, setEventModal] = useState(false);
    const [inviteModal, setInviteModal] = useState(false);
    const [viewingEvent, setViewingEvent] = useState<CommunityEvent | null>(null);
    const [managing, setManaging] = useState<CommunityMember | null>(null);

    const loadCommunity = useCallback(async () => {
        // get() devolve undefined quando a requisição falha
        const response = await get(`/social-media/community/${communityId}`);

        if (!response?.data) {
            showToast({
                title: "Comunidade",
                message: "Não foi possível carregar a comunidade.",
                status: "error",
            });
            setCommunity(null);
            return;
        }

        setCommunity(response.data as Community);
    }, [communityId, showToast]);

    useEffect(() => {
        if (!communityId) return;

        let active = true;

        setLoading(true);

        Promise.all([
            loadCommunity(),
            get(`/social-media/community/${communityId}/topics`),
            get(`/social-media/community/${communityId}/photos`),
            get(`/social-media/community/${communityId}/events`),
        ]).then(([, topicsResponse, photosResponse, eventsResponse]) => {
            if (!active) return;

            setTopics(topicsResponse?.data ?? []);
            setPhotos(photosResponse?.data ?? []);
            setEvents(eventsResponse?.data ?? []);
            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, [communityId, loadCommunity]);

    const isMember = community
        ? ["owner", "admin", "member"].includes(community.viewer_role)
        : false;
    const isBlocked = community?.viewer_role === "blocked";
    const canManage = !!community?.can_manage;

    async function handleJoin() {
        setJoining(true);

        const response = isMember
            ? await safeLeave()
            : await post(`/social-media/community/${communityId}/members`, {});

        setJoining(false);

        if (!response) {
            showToast({
                title: "Comunidade",
                message: isMember
                    ? "Não foi possível sair da comunidade."
                    : "Não foi possível entrar na comunidade.",
                status: "error",
            });
            return;
        }

        showToast({
            title: "Comunidade",
            message: response.message ?? "Pronto!",
            status: "success",
        });

        // papel, permissões e contagem de membros mudam de uma vez
        loadCommunity();
    }

    /** remove() lança em erro, ao contrário de post(); aqui os dois viram undefined. */
    async function safeLeave() {
        try {
            return await remove(`/social-media/community/${communityId}/members/me`);
        } catch {
            return undefined;
        }
    }

    async function handleDeletePhoto(photoId: number) {
        try {
            await remove(`/social-media/community/${communityId}/photos/${photoId}`);

            setPhotos((current) => current.filter((photo) => photo.id !== photoId));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Fotos",
                message: error?.response?.data?.message ?? "Não foi possível apagar a foto.",
                status: "error",
            });
        }
    }

    async function handleDeleteEvent(eventId: number) {
        try {
            await remove(`/social-media/community/${communityId}/events/${eventId}`);

            setEvents((current) => current.filter((event) => event.id !== eventId));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Eventos",
                message: error?.response?.data?.message ?? "Não foi possível apagar o evento.",
                status: "error",
            });
        }
    }

    /**
     * Espelha a resposta de presença na agenda e no modal aberto.
     *
     * O modal recebe o evento por prop, então atualizar só a lista deixaria os
     * botões marcando a resposta anterior até fechar e reabrir.
     */
    function handleAttendanceChange(updated: CommunityEvent) {
        setEvents((current) =>
            current.map((event) => (event.id === updated.id ? updated : event))
        );

        setViewingEvent((current) => (current?.id === updated.id ? updated : current));
    }

    const tabClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    const initial = community?.name?.charAt(0).toUpperCase() ?? "?";
    const members = community?.members ?? [];

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
                            <Image
                                src={community?.photo || "/imgs/placeholder.png"}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 1280px) 100vw, 800px"
                                priority
                            />
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
                                    {isBlocked ? (
                                        <span className="flex-1 sm:flex-none rounded-full bg-danger px-4 py-2
                                            text-sm font-semibold text-white text-center">
                                            Você foi bloqueado
                                        </span>
                                    ) : (
                                        <ColorButton
                                            onClick={handleJoin}
                                            disabled={joining || loading}
                                            bgColor={isMember ? "bg-surface-3" : undefined}
                                            className="flex-1 sm:flex-none px-4 text-sm font-semibold"
                                        >
                                            {isMember ? (
                                                <CheckIcon className="size-4 shrink-0" />
                                            ) : (
                                                <PlusIcon className="size-4 shrink-0" />
                                            )}
                                            {isMember ? "Participando" : "Participar"}
                                        </ColorButton>
                                    )}

                                    {/* convidar é de quem participa, não só de quem
                                        administra: é o que faz a comunidade crescer */}
                                    {isMember && (
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="shrink-0 font-semibold"
                                            onClick={() => setInviteModal(true)}
                                        >
                                            <UsersIcon className="size-4 shrink-0" />
                                            <span className="hidden sm:inline">Convidar amigos</span>
                                        </Button>
                                    )}

                                    {canManage && (
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="shrink-0 font-semibold"
                                            onClick={() => setEventModal(true)}
                                        >
                                            <TrophyIcon className="size-4 shrink-0" />
                                            <span className="hidden sm:inline">Novo evento</span>
                                        </Button>
                                    )}
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
                                        <h1 className="text-2xl font-semibold">
                                            {community?.name ?? "Comunidade não encontrada"}
                                        </h1>

                                        {community?.owner && (
                                            <div className="flex flex-row items-center gap-1 text-content-muted">
                                                <PinIcon className="size-3" />
                                                <span className="text-sm">
                                                    Criada por{" "}
                                                    <Link
                                                        href={`/social-media/profile/${community.owner.id}`}
                                                        className="font-semibold text-content hover:underline"
                                                    >
                                                        {community.owner.name}
                                                    </Link>
                                                </span>
                                            </div>
                                        )}

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
                                        <dd className="text-lg font-semibold">{community?.members_count ?? 0}</dd>
                                        <span className="text-xs text-content-muted">Membros</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="sr-only">Eventos</dt>
                                        <dd className="text-lg font-semibold">{events.length}</dd>
                                        <span className="text-xs text-content-muted">Eventos</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="sr-only">Tópicos</dt>
                                        <dd className="text-lg font-semibold">{topics.length}</dd>
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
                                <>
                                    {canManage && (
                                        <div className="flex justify-end mb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTopicModal(true)}
                                            >
                                                <PlusIcon className="size-4" />
                                                Novo tópico
                                            </Button>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="flex flex-col gap-2">
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <Skeleton key={index} height="h-16" rounded="card" />
                                            ))}
                                        </div>
                                    )}

                                    {!loading && topics.length > 0 && (
                                        <ul className="flex flex-col gap-2 list-none">
                                            {topics.map((topic) => (
                                                <li key={topic.id}>
                                                    <Link
                                                        href={`/social-media/communities/${communityId}/topics/${topic.id}`}
                                                        className="flex flex-row items-center justify-between gap-3 rounded-card p-3
                                                            hover:bg-surface-2 transition-colors
                                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                                    >
                                                        <div className="flex flex-row items-center gap-3 min-w-0">
                                                            <Image
                                                                src={topic.author?.photo || "/imgs/placeholder.png"}
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
                                                                    {topic.comments_count === 1
                                                                        ? "1 resposta"
                                                                        : `${topic.comments_count ?? 0} respostas`}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <MessageIcon className="size-4 shrink-0 text-content-muted" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {!loading && topics.length === 0 && (
                                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                                            <MessageIcon className="size-10 text-content-subtle" />
                                            <h3 className="text-base font-semibold">Nenhum tópico ainda</h3>
                                            <p className="max-w-xs text-sm text-content-muted">
                                                {canManage
                                                    ? "Abra o primeiro tópico para os membros conversarem."
                                                    : "Quem administra a comunidade ainda não abriu nenhum."}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {tab === "photos" && (
                                <>
                                    {canManage && (
                                        <div className="flex justify-end mb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPhotoModal(true)}
                                            >
                                                <PhotoIcon className="size-4" />
                                                Adicionar foto
                                            </Button>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className={PHOTO_GRID}>
                                            {Array.from({ length: 6 }).map((_, index) => (
                                                <Skeleton key={index} className="w-full aspect-square" rounded="card" />
                                            ))}
                                        </div>
                                    )}

                                    {!loading && photos.length > 0 && (
                                        <div className={PHOTO_GRID}>
                                            {photos.map((photo) => (
                                                <div
                                                    key={photo.id}
                                                    className="relative w-full aspect-square overflow-hidden rounded-card bg-surface-2"
                                                >
                                                    <Image
                                                        src={photo.photo || "/imgs/placeholder.png"}
                                                        alt={photo.description ?? ""}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, 200px"
                                                        className="object-cover"
                                                    />

                                                    {photo.can_delete && (
                                                        <Button
                                                            aria-label="Apagar foto"
                                                            className="absolute right-2 top-2"
                                                            onClick={() => handleDeletePhoto(photo.id)}
                                                        >
                                                            <CloseIcon className="size-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!loading && photos.length === 0 && (
                                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                                            <PhotoIcon className="size-10 text-content-subtle" />
                                            <h3 className="text-base font-semibold">Nenhuma foto ainda</h3>
                                            <p className="max-w-xs text-sm text-content-muted">
                                                {canManage
                                                    ? "Envie as primeiras fotos da comunidade."
                                                    : "Quem administra a comunidade ainda não publicou fotos."}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {tab === "members" && (
                                members.length > 0 ? (
                                    <div className={PHOTO_GRID}>
                                        {members.map((member) => (
                                            <MemberCard
                                                key={member.id}
                                                member={member}
                                                onManage={setManaging}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <UsersIcon className="size-10 text-content-subtle" />
                                        <h3 className="text-base font-semibold">Nenhum membro ainda</h3>
                                        <p className="max-w-xs text-sm text-content-muted">
                                            Quem entrar na comunidade aparece aqui.
                                        </p>
                                    </div>
                                )
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

                        {events.length === 0 ? (
                            <p className="py-6 text-center text-sm text-content-muted">
                                {canManage
                                    ? "Cadastre o primeiro evento da comunidade."
                                    : "Nenhum evento marcado por enquanto."}
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onOpen={setViewingEvent}
                                        onDelete={handleDeleteEvent}
                                    />
                                ))}
                            </div>
                        )}
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
                                <span className="text-sm font-semibold">{community?.members_count ?? 0}</span>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <span className="flex items-center gap-2 text-content-muted text-sm">
                                    <TrophyIcon className="size-4" />
                                    Eventos
                                </span>
                                <span className="text-sm font-semibold">{events.length}</span>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                                <span className="flex items-center gap-2 text-content-muted text-sm">
                                    <MessageIcon className="size-4" />
                                    Tópicos
                                </span>
                                <span className="text-sm font-semibold">{topics.length}</span>
                            </div>
                        </Card>
                    </Container>

                    <SidebarFooter />
                </aside>
            </div>

            <TopicModal
                isOpen={topicModal}
                onClose={() => setTopicModal(false)}
                communityId={communityId}
                onCreated={(topic) => setTopics((current) => [topic, ...current])}
            />

            <PhotoModal
                isOpen={photoModal}
                onClose={() => setPhotoModal(false)}
                communityId={communityId}
                onCreated={(photo) => setPhotos((current) => [photo, ...current])}
            />

            <EventModal
                isOpen={eventModal}
                onClose={() => setEventModal(false)}
                communityId={communityId}
                onCreated={(event) => setEvents((current) => [...current, event])}
            />

            <EventDetailsModal
                isOpen={viewingEvent !== null}
                onClose={() => setViewingEvent(null)}
                event={viewingEvent}
                onDelete={handleDeleteEvent}
                onAttendanceChange={handleAttendanceChange}
            />

            <InviteFriendsModal
                isOpen={inviteModal}
                onClose={() => setInviteModal(false)}
                communityId={communityId}
                communityName={community?.name}
            />

            <MemberManageModal
                isOpen={managing !== null}
                onClose={() => setManaging(null)}
                communityId={communityId}
                member={managing}
                onDone={loadCommunity}
            />
        </>
    );
}
