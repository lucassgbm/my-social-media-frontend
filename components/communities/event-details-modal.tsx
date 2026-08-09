'use client';

import Image from "../remote-image";
import Modal from "../modal";
import Button from "../button";
import PinIcon from "../icons/pin";
import CalendarIcon from "../icons/calendar";
import ClockIcon from "../icons/clock";
import { formatDate, formatTime, type CommunityEvent } from "../../utils/community";

type EventDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: CommunityEvent | null;
    onDelete?: (eventId: number) => void;
};

/** Informações completas do evento — o card da agenda mostra só o resumo. */
export default function EventDetailsModal({
    isOpen,
    onClose,
    event,
    onDelete,
}: EventDetailsModalProps) {
    if (!event) return null;

    // um evento de um dia só não precisa repetir a data no fim
    const sameDay = event.date_start === event.date_end;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event.title} width="sm:w-[560px]">
            <div className="flex flex-col gap-4">
                {event.photo && (
                    <div className="relative w-full aspect-video overflow-hidden rounded-card bg-surface-2">
                        <Image
                            src={event.photo}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 560px"
                            className="object-cover"
                        />
                    </div>
                )}

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
                        className="text-sm font-semibold text-brand hover:underline break-all
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        {event.link}
                    </a>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-line pt-4">
                    {onDelete && event.can_delete && (
                        <Button
                            variant="danger"
                            size="md"
                            className="sm:mr-auto"
                            onClick={() => {
                                onDelete(event.id);
                                onClose();
                            }}
                        >
                            Apagar evento
                        </Button>
                    )}

                    <Button variant="ghost" size="md" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
