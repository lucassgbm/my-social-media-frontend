'use client';

import { useState } from "react";
import CheckIcon from "../icons/check";
import QuestionIcon from "../icons/question";
import CloseIcon from "../icons/close";
import { post, remove } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { AttendanceStatus, CommunityEvent } from "../../utils/community";

type AttendanceButtonsProps = {
    event: CommunityEvent;
    /**
     * Recebe o evento com presença e contagens já atualizadas — a API devolve
     * os totais na própria resposta, então a tela não precisa recarregar.
     */
    onChange: (event: CommunityEvent) => void;
    size?: "sm" | "md";
};

const OPTIONS: {
    status: AttendanceStatus;
    label: string;
    icon: typeof CheckIcon;
}[] = [
    { status: "going", label: "Vou", icon: CheckIcon },
    { status: "maybe", label: "Talvez", icon: QuestionIcon },
    { status: "declined", label: "Não vou", icon: CloseIcon },
];

/**
 * Confirmação de presença de um evento.
 *
 * Clicar na resposta já marcada a retira: é a única forma de voltar a "sem
 * resposta" sem um quarto botão só para isso.
 */
export default function AttendanceButtons({
    event,
    onChange,
    size = "md",
}: AttendanceButtonsProps) {
    const { showToast } = useToaster();

    const [pending, setPending] = useState<AttendanceStatus | null>(null);

    if (!event.can_attend) return null;

    async function choose(status: AttendanceStatus) {
        const undo = event.viewer_attendance === status;

        setPending(status);

        try {
            const response = undo
                ? await remove(`/social-media/events/${event.id}/attendance`)
                : await post(`/social-media/events/${event.id}/attendance`, { status });

            // post() engole o erro e devolve undefined
            if (!response) {
                showToast({
                    title: "Presença",
                    message: "Não foi possível registrar a sua resposta.",
                    status: "error",
                });
                return;
            }

            onChange({
                ...event,
                viewer_attendance: undo ? null : status,
                going_count: response.going_count ?? event.going_count,
                maybe_count: response.maybe_count ?? event.maybe_count,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Presença",
                message:
                    error?.response?.data?.message ??
                    "Não foi possível registrar a sua resposta.",
                status: "error",
            });
        } finally {
            setPending(null);
        }
    }

    const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

    return (
        <div
            role="group"
            aria-label="Confirmação de presença"
            className="flex flex-row flex-wrap items-center gap-2"
        >
            {OPTIONS.map(({ status, label, icon: Icon }) => {
                const active = event.viewer_attendance === status;

                return (
                    <button
                        key={status}
                        type="button"
                        onClick={() => choose(status)}
                        disabled={pending !== null}
                        aria-pressed={active}
                        className={`flex flex-row items-center gap-2 rounded-full border font-semibold
                            transition-colors cursor-pointer ${padding}
                            disabled:pointer-events-none disabled:opacity-50
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                            ${active
                                ? "border-brand bg-brand text-on-brand"
                                : "border-line bg-surface text-content-muted hover:border-line-strong hover:text-content"}`}
                    >
                        <Icon className="size-4 shrink-0" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
