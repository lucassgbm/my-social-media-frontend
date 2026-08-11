'use client';

import Link from "next/link";
import Image from "../remote-image";
import Button from "../button";
import PinIcon from "../icons/pin";
import CloseIcon from "../icons/close";
import UsersIcon from "../icons/users";
import CheckIcon from "../icons/check";
import { formatDate, formatTime, type CommunityEvent } from "../../utils/community";

type EventCardProps = {
    event: CommunityEvent;
    /** Navega para a página do evento. Tem precedência sobre `onOpen`. */
    href?: string;
    /** Abre os detalhes num modal — usado na agenda da própria comunidade. */
    onOpen?: (event: CommunityEvent) => void;
    onDelete?: (eventId: number) => void;
    /** Mostra de qual comunidade é o evento (a agenda geral mistura várias). */
    showCommunity?: boolean;
};

/**
 * Evento na agenda.
 *
 * Com imagem, ela vira o fundo do card e o texto sai sobre um gradiente
 * escuro; sem imagem, o card segue as cores do tema. O card inteiro é
 * clicável, e o clicável é um elemento em overlay — não um wrapper em volta de
 * tudo — porque o botão de apagar não pode ficar dentro de um botão nem de um
 * link.
 */
export default function EventCard({
    event,
    href,
    onOpen,
    onDelete,
    showCommunity = false,
}: EventCardProps) {
    const hasPhoto = !!event.photo;
    const overlayClass = `absolute inset-0 z-10 cursor-pointer rounded-card
        focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-ring`;

    return (
        <div
            className={`group relative overflow-hidden rounded-card border border-line
                ${hasPhoto ? "min-h-[150px] text-white" : "bg-surface-2"}
                ${event.is_past ? "opacity-75" : ""}`}
        >
            {hasPhoto && (
                <>
                    <Image
                        src={event.photo as string}
                        alt=""
                        fill
                        sizes="(max-width: 1280px) 100vw, 320px"
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                    {/* o gradiente é o que garante a leitura do texto sobre
                        qualquer foto */}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/20" />
                </>
            )}

            <div className="relative flex flex-col gap-1 p-3">
                {showCommunity && event.community && (
                    <span
                        className={`flex flex-row items-center gap-2 text-xs
                            ${hasPhoto ? "text-gray-200" : "text-content-muted"}`}
                    >
                        <Image
                            src={event.community.photo || "/imgs/placeholder.png"}
                            alt=""
                            width={20}
                            height={20}
                            sizes="20px"
                            className="size-5 shrink-0 rounded-full object-cover bg-surface-3"
                        />
                        <span className="truncate">{event.community.name}</span>
                    </span>
                )}

                <h3 className={`text-sm font-semibold break-words ${hasPhoto ? "" : "text-content"}`}>
                    {event.title}
                </h3>

                <span className={`text-xs ${hasPhoto ? "text-gray-200" : "text-content-muted"}`}>
                    {formatDate(event.date_start)} às {formatTime(event.time_start)}
                </span>

                <span
                    className={`flex flex-row items-center gap-1 text-xs
                        ${hasPhoto ? "text-gray-300" : "text-content-muted"}`}
                >
                    <PinIcon className="size-3 shrink-0" />
                    <span className="truncate">{event.local}</span>
                </span>

                {/* a contagem só existe nas rotas que anotam presença; sem ela a
                    linha inteira sai de cena em vez de mostrar "0 confirmados" */}
                {typeof event.going_count === "number" && (
                    <span
                        className={`flex flex-row items-center gap-1 text-xs
                            ${hasPhoto ? "text-gray-200" : "text-content-muted"}`}
                    >
                        <UsersIcon className="size-3 shrink-0" />
                        <span className="truncate">
                            {event.going_count === 0
                                ? "Ninguém confirmou ainda"
                                : `${event.going_count} ${event.going_count === 1 ? "confirmado" : "confirmados"}`}
                        </span>
                    </span>
                )}

                {/* {event.description && (
                    <p className={`text-xs line-clamp-2 ${hasPhoto ? "text-gray-200" : "text-content-muted"}`}>
                        {event.description}
                    </p>
                )} */}
            </div>

            {/* cobre o card inteiro: clicar em qualquer ponto abre o evento */}
            {href ? (
                <Link href={href} className={overlayClass}>
                    <span className="sr-only">{`Ver detalhes de ${event.title}`}</span>
                </Link>
            ) : (
                <button type="button" onClick={() => onOpen?.(event)} className={overlayClass}>
                    <span className="sr-only">{`Ver detalhes de ${event.title}`}</span>
                </button>
            )}

            {event.is_past && (
                <span className="absolute left-2 bottom-2 z-20 rounded-full bg-black/60 px-2 py-0.5
                    text-[11px] font-semibold text-white">
                    Encerrado
                </span>
            )}

            {/* quem confirmou vê o próprio selo — a contagem acima não diz se
                a pessoa está entre os confirmados */}
            {event.viewer_attendance === "going" && (
                <span className="absolute right-2 bottom-2 z-20 flex flex-row items-center gap-1
                    rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-on-brand">
                    <CheckIcon className="size-3 shrink-0" />
                    Você vai
                </span>
            )}

            {onDelete && event.can_delete && (
                <Button
                    aria-label={`Apagar ${event.title}`}
                    className="absolute right-2 top-2 z-20"
                    onClick={() => onDelete(event.id)}
                >
                    <CloseIcon className="size-3" />
                </Button>
            )}
        </div>
    );
}
