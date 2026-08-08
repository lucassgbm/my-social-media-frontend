"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./button";
import CheckIcon from "./icons/check";
import CloseIcon from "./icons/close";
import InfoIcon from "./icons/info";

export type ToastStatus = "success" | "error" | "info";

export type ToastInput = {
    title?: string;
    message: string;
    /** Vazio ou ausente cai em "info". */
    status?: ToastStatus | string;
    /** Tempo até sumir, em ms. Padrão: 5000. */
    duration?: number;
};

export type Toast = ToastInput & { id: number };

/** Tempo padrão na tela. */
const DEFAULT_DURATION = 5000;

/** Duração da animação de saída — precisa bater com `toast-out` no globals.css. */
const EXIT_MS = 180;

const STATUS_STYLES: Record<ToastStatus, { icon: typeof CheckIcon; className: string }> = {
    success: { icon: CheckIcon, className: "bg-success" },
    error: { icon: CloseIcon, className: "bg-danger" },
    info: { icon: InfoIcon, className: "bg-content-muted" },
};

function statusOf(status?: string): ToastStatus {
    return status === "success" || status === "error" ? status : "info";
}

/**
 * Um aviso da pilha global. Não é usado direto pelas telas: quem exibe é o
 * ToasterProvider, via `useToaster().showToast`.
 *
 * O timer vive aqui porque é o que permite pausar a contagem quando o ponteiro
 * está sobre o aviso — sem isso, uma mensagem longa some no meio da leitura.
 */
export default function Toaster({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: number) => void;
}) {
    const [leaving, setLeaving] = useState(false);
    const [paused, setPaused] = useState(false);
    const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Quanto ainda falta e desde quando conta. A pausa precisa congelar o tempo
    // em vez de reiniciá-lo, senão o JS voltaria a 5s enquanto a barra de
    // progresso (animation-play-state) apenas retoma de onde parou.
    const remaining = useRef(toast.duration ?? DEFAULT_DURATION);
    const startedAt = useRef(0);

    const status = statusOf(toast.status);
    const { icon: Icon, className: statusClass } = STATUS_STYLES[status];
    const duration = toast.duration ?? DEFAULT_DURATION;

    const startExit = useCallback(() => {
        setLeaving(true);
        // remove só depois da animação, senão o aviso some com corte seco
        exitTimer.current = setTimeout(() => onDismiss(toast.id), EXIT_MS);
    }, [onDismiss, toast.id]);

    useEffect(() => {
        if (leaving) return;

        if (paused) {
            remaining.current -= Date.now() - startedAt.current;
            return;
        }

        startedAt.current = Date.now();
        const timer = setTimeout(startExit, Math.max(0, remaining.current));

        return () => clearTimeout(timer);
    }, [paused, leaving, startExit]);

    // o timer de saída precisa morrer com o componente
    useEffect(() => () => {
        if (exitTimer.current) clearTimeout(exitTimer.current);
    }, []);

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`pointer-events-auto relative flex w-full flex-row items-center gap-3 overflow-hidden
                rounded-card border border-line bg-surface p-3 text-sm text-content shadow-2xl
                sm:w-auto sm:min-w-[300px] sm:max-w-[420px]
                ${leaving ? "animate-toast-out" : "animate-toast-in"}`}
        >
            <div className={`shrink-0 rounded-full p-1 text-white ${statusClass}`}>
                <Icon className="size-3" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}

                {/* text-content-muted garante contraste >= 4.5:1 nos dois temas */}
                <p className="text-sm text-content-muted break-words">{toast.message}</p>
            </div>

            <Button
                variant="ghost"
                onClick={() => !leaving && startExit()}
                aria-label="Fechar notificação"
            >
                <CloseIcon className="size-3" />
            </Button>

            {/* Barra de tempo: mostra quanto falta para o aviso sumir e congela
                junto com o timer quando o ponteiro está em cima. */}
            <span
                aria-hidden="true"
                style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? "paused" : "running" }}
                className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${statusClass}
                    ${leaving ? "" : "animate-toast-progress"}`}
            />
        </div>
    );
}
