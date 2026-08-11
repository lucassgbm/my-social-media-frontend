'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "../../../../../../components/remote-image";
import Container from "../../../../../../components/container";
import Card from "../../../../../../components/card";
import Sidebar from "../../../../../../components/sidebar";
import SidebarFooter from "../../../../../../components/sidebar-footer";
import Button from "../../../../../../components/button";
import Skeleton from "../../../../../../components/skeleton";
import AttendanceButtons from "../../../../../../components/communities/attendance-buttons";
import AttendanceSummary from "../../../../../../components/communities/attendance-summary";
import ArrowLeftIcon from "../../../../../../components/icons/arrow-left";
import TrophyIcon from "../../../../../../components/icons/trophy";
import PinIcon from "../../../../../../components/icons/pin";
import ClockIcon from "../../../../../../components/icons/clock";
import CalendarIcon from "../../../../../../components/icons/calendar";
import UsersIcon from "../../../../../../components/icons/users";
import MessageIcon from "../../../../../../components/icons/message";
import CommunityIcon from "../../../../../../components/icons/community";
import { get, remove } from "@/api/services/request";
import { useToaster } from "../../../../../../providers/toaster-provider";
import {
    formatDate,
    formatTime,
    type Community,
    type CommunityEvent,
    type EventAttendee,
} from "../../../../../../utils/community";

const ATTENDANCE_LABELS: Record<EventAttendee["attendance_status"], string> = {
    going: "Vai",
    maybe: "Talvez",
    declined: "Não vai",
};

const ATTENDANCE_BADGE: Record<EventAttendee["attendance_status"], string> = {
    going: "bg-brand-subtle text-brand",
    maybe: "bg-surface-3 text-content-muted",
    declined: "bg-surface-3 text-content-subtle",
};

/**
 * Página de um evento, com o cartão da comunidade que o organiza.
 *
 * Chega pela agenda pessoal (/social-media/events), que mistura comunidades —
 * por isso a identificação de quem organiza vem junto do evento.
 */
export default function EventPage() {
    const { showToast } = useToaster();
    const router = useRouter();

    const params = useParams<{ eventId: string }>();
    const eventId = params?.eventId ?? "";

    const [event, setEvent] = useState<CommunityEvent | null>(null);
    const [community, setCommunity] = useState<Community | null>(null);
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const loadEvent = useCallback(async () => {
        setLoading(true);

        const [response, attendeesResponse] = await Promise.all([
            get(`/social-media/events/${eventId}`),
            get(`/social-media/events/${eventId}/attendees`),
        ]);

        // get() devolve undefined tanto no 404 quanto em falha de rede
        if (!response?.data?.event) {
            setNotFound(true);
        } else {
            // resource aninhado em array não ganha o wrapper `data`, só o da raiz
            setEvent(response.data.event as CommunityEvent);
            setCommunity(response.data.community as Community);
        }

        // 404 aqui é quem foi bloqueado na comunidade: a lista fica vazia
        setAttendees(attendeesResponse?.data ?? []);
        setLoading(false);
    }, [eventId]);

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);

    /**
     * Recarrega só a lista de presença depois de responder.
     *
     * As contagens vêm na resposta da própria ação, mas os nomes não — e é a
     * lista que precisa passar a mostrar (ou deixar de mostrar) quem respondeu.
     */
    async function handleAttendanceChange(updated: CommunityEvent) {
        setEvent(updated);

        const response = await get(`/social-media/events/${eventId}/attendees`);

        setAttendees(response?.data ?? []);
    }

    async function handleDelete() {
        if (!community) return;

        try {
            await remove(`/social-media/community/${community.id}/events/${eventId}`);

            showToast({ title: "Eventos", message: "Evento removido.", status: "success" });
            router.push("/social-media/events");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Eventos",
                message: error?.response?.data?.message ?? "Não foi possível apagar o evento.",
                status: "error",
            });
        }
    }

    // um evento de um dia só não precisa repetir a data no fim
    const sameDay = event?.date_start === event?.date_end;

    return (
        <>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col xl:flex-row gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                    {loading && (
                        <Container className="rounded-card" padding="p-4" as="section">
                            <div className="flex flex-col gap-3">
                                <Skeleton width="w-40" height="h-5" rounded="field" />
                                <Skeleton className="w-full aspect-video" rounded="card" />
                                <Skeleton width="w-2/3" height="h-8" rounded="field" />
                            </div>
                        </Container>
                    )}

                    {!loading && notFound && (
                        <Container className="rounded-card" padding="p-4" as="section">
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <TrophyIcon className="size-10 text-content-subtle" />
                                <h1 className="text-lg font-semibold">Evento não encontrado</h1>
                                <p className="max-w-sm text-sm text-content-muted">
                                    Ele pode ter sido removido por quem administra a comunidade.
                                </p>
                                <Link
                                    href="/social-media/events"
                                    className="mt-2 rounded-field px-3 py-1 text-sm font-semibold text-brand
                                        hover:bg-surface-2 transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    Ver a agenda
                                </Link>
                            </div>
                        </Container>
                    )}

                    {!loading && event && (
                        <Container className="rounded-card overflow-hidden" padding="p-0" as="section">
                            {event.photo && (
                                <div className="relative w-full aspect-video sm:aspect-[3/1] bg-surface-2">
                                    <Image
                                        src={event.photo}
                                        alt=""
                                        fill
                                        sizes="(max-width: 1280px) 100vw, 800px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-4 p-4">
                                <Link
                                    href="/social-media/events"
                                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand
                                        rounded-field px-2 py-1 -ml-2 hover:bg-surface-2 transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    <ArrowLeftIcon className="size-4" />
                                    Voltar para a agenda
                                </Link>

                                <div className="flex flex-row flex-wrap items-start justify-between gap-3">
                                    <div className="flex flex-col gap-2 min-w-0">
                                        {event.is_past && (
                                            <span className="w-fit rounded-full bg-surface-3 px-3 py-1
                                                text-xs font-semibold text-content-muted">
                                                Evento encerrado
                                            </span>
                                        )}

                                        <h1 className="text-2xl font-semibold break-words">{event.title}</h1>
                                    </div>

                                    {event.can_delete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 text-danger"
                                            onClick={handleDelete}
                                        >
                                            Apagar evento
                                        </Button>
                                    )}
                                </div>

                                <dl className="flex flex-col gap-2 text-sm">
                                    <div className="flex flex-row items-center gap-2">
                                        <dt className="sr-only">Data</dt>
                                        <CalendarIcon className="size-4 shrink-0 text-content-muted" />
                                        <dd>
                                            {sameDay
                                                ? formatDate(event.date_start)
                                                : `${formatDate(event.date_start)} a ${formatDate(event.date_end)}`}
                                        </dd>
                                    </div>

                                    <div className="flex flex-row items-center gap-2">
                                        <dt className="sr-only">Horário</dt>
                                        <ClockIcon className="size-4 shrink-0 text-content-muted" />
                                        <dd>
                                            {formatTime(event.time_start)} às {formatTime(event.time_end)}
                                        </dd>
                                    </div>

                                    <div className="flex flex-row items-center gap-2">
                                        <dt className="sr-only">Local</dt>
                                        <PinIcon className="size-4 shrink-0 text-content-muted" />
                                        <dd className="break-words">{event.local}</dd>
                                    </div>
                                </dl>

                                {/* Presença: o resumo aparece para todo mundo que vê o
                                    evento; os botões, só para quem participa da
                                    comunidade e num evento que ainda não terminou */}
                                <div className="flex flex-col gap-3 rounded-card border border-line
                                    bg-surface-2 p-4">
                                    <AttendanceSummary event={event} />

                                    {event.can_attend ? (
                                        <>
                                            <p className="text-sm text-content-muted">
                                                {event.viewer_attendance
                                                    ? "Mudou de ideia? É só escolher outra resposta — ou clicar na atual para desmarcar."
                                                    : "Você vai a este evento?"}
                                            </p>

                                            <AttendanceButtons
                                                event={event}
                                                onChange={handleAttendanceChange}
                                            />
                                        </>
                                    ) : (
                                        <p className="text-sm text-content-muted">
                                            {event.is_past
                                                ? "O evento já terminou."
                                                : "Entre na comunidade para confirmar presença."}
                                        </p>
                                    )}
                                </div>

                                {event.description && (
                                    <p className="text-sm text-content whitespace-pre-line break-words">
                                        {event.description}
                                    </p>
                                )}

                                {event.link && (
                                    <a
                                        href={event.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-fit text-sm font-semibold text-brand hover:underline break-all
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        {event.link}
                                    </a>
                                )}
                            </div>
                        </Container>
                    )}
                </div>

                <aside aria-label="Comunidade organizadora" className="w-full xl:w-[340px] xl:shrink-0 flex flex-col gap-4">
                    {!loading && event && attendees.length > 0 && (
                        <Container className="rounded-card" padding="p-4">
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Quem respondeu</h2>
                                <UsersIcon className="size-5 text-content-muted" />
                            </div>

                            <ul className="flex flex-col gap-1 list-none">
                                {attendees.map((person) => (
                                    <li key={person.id}>
                                        <Link
                                            href={`/social-media/profile/${person.id}`}
                                            className="flex flex-row items-center gap-3 rounded-card p-2
                                                hover:bg-surface-2 transition-colors
                                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                        >
                                            <Image
                                                src={person.photo || "/imgs/placeholder.png"}
                                                alt=""
                                                width={36}
                                                height={36}
                                                sizes="36px"
                                                className="size-9 shrink-0 rounded-full object-cover bg-surface-2"
                                            />

                                            <span className="flex-1 min-w-0 truncate text-sm font-semibold">
                                                {person.name}
                                            </span>

                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold
                                                    ${ATTENDANCE_BADGE[person.attendance_status]}`}
                                            >
                                                {ATTENDANCE_LABELS[person.attendance_status]}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Container>
                    )}

                    {!loading && community && (
                        <Container className="rounded-card" padding="p-4">
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Organizado por</h2>
                                <CommunityIcon className="size-5 text-content-muted" />
                            </div>

                            <Link
                                href={`/social-media/communities/${community.id}`}
                                className="flex flex-row items-center gap-3 rounded-card p-2 -m-2
                                    hover:bg-surface-2 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <Image
                                    src={community.photo || "/imgs/placeholder.png"}
                                    alt=""
                                    width={56}
                                    height={56}
                                    sizes="56px"
                                    className="size-14 shrink-0 rounded-card object-cover bg-surface-2"
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-base font-semibold truncate">{community.name}</span>
                                    <span className="text-xs text-content-muted">
                                        {community.viewer_role === "owner"
                                            ? "Você é o dono"
                                            : community.viewer_role === "admin"
                                                ? "Você administra"
                                                : community.viewer_role === "member"
                                                    ? "Você participa"
                                                    : "Você não participa"}
                                    </span>
                                </div>
                            </Link>

                            {community.description && (
                                <p className="mt-3 text-sm text-content-muted break-words">
                                    {community.description}
                                </p>
                            )}

                            <Card className="mt-4 flex flex-col gap-3 p-3">
                                <div className="flex flex-row items-center justify-between">
                                    <span className="flex items-center gap-2 text-content-muted text-sm">
                                        <UsersIcon className="size-4" />
                                        Membros
                                    </span>
                                    <span className="text-sm font-semibold">{community.members_count ?? 0}</span>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <span className="flex items-center gap-2 text-content-muted text-sm">
                                        <TrophyIcon className="size-4" />
                                        Eventos
                                    </span>
                                    <span className="text-sm font-semibold">{community.events_count ?? 0}</span>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <span className="flex items-center gap-2 text-content-muted text-sm">
                                        <MessageIcon className="size-4" />
                                        Tópicos
                                    </span>
                                    <span className="text-sm font-semibold">{community.topics_count ?? 0}</span>
                                </div>
                            </Card>

                            <Link
                                href={`/social-media/communities/${community.id}`}
                                className="mt-4 flex items-center justify-center rounded-full px-4 py-2
                                    text-sm font-semibold text-brand hover:bg-surface-2 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                Ver a comunidade
                            </Link>
                        </Container>
                    )}

                    <SidebarFooter />
                </aside>
            </div>
        </>
    );
}
