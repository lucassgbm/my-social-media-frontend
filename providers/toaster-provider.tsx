"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import Toaster, { type Toast, type ToastInput } from "../components/toaster";

type ToasterContextType = {
    /** Empilha um aviso. Some sozinho depois de `duration` (5s por padrão). */
    showToast: (toast: ToastInput) => number;
    dismissToast: (id: number) => void;
    dismissAll: () => void;
};

const ToasterContext = createContext<ToasterContextType | null>(null);

/** Quantos avisos ficam visíveis ao mesmo tempo; os mais antigos saem antes. */
const MAX_VISIBLE = 3;

let nextId = 0;

/**
 * Toaster global.
 *
 * Antes cada tela repetia o mesmo `useState({ show, message, status, title })`,
 * renderizava o próprio <Toaster> e o aviso ficava na tela até alguém clicar no
 * X — e sumia junto com a página em qualquer navegação. Agora o provider vive na
 * raiz da aplicação: qualquer componente chama `showToast` e o aviso se fecha
 * sozinho.
 */
export function ToasterProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => setToasts([]), []);

    const showToast = useCallback((toast: ToastInput) => {
        const id = ++nextId;

        setToasts((current) => {
            const next = [...current, { ...toast, id }];

            // mantém os mais recentes: uma sequência de erros não deve encher a tela
            return next.slice(-MAX_VISIBLE);
        });

        return id;
    }, []);

    const value = useMemo(
        () => ({ showToast, dismissToast, dismissAll }),
        [showToast, dismissToast, dismissAll]
    );

    return (
        <ToasterContext.Provider value={value}>
            {children}

            {/* A região precisa existir no DOM antes de receber conteúdo para que
                leitores de tela anunciem os avisos que chegam depois. Por isso ela
                é sempre renderizada, mesmo vazia.
                pointer-events-none no container (e auto em cada aviso) evita que a
                faixa invisível bloqueie cliques no canto da tela. */}
            <div
                aria-live="polite"
                aria-atomic="false"
                className="pointer-events-none fixed inset-x-4 bottom-4 z-[1100] flex flex-col
                    items-end gap-2 sm:inset-x-auto sm:right-4"
            >
                {toasts.map((toast) => (
                    <Toaster key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </ToasterContext.Provider>
    );
}

export function useToaster(): ToasterContextType {
    const context = useContext(ToasterContext);

    if (!context) {
        throw new Error("useToaster precisa estar dentro de <ToasterProvider>");
    }

    return context;
}
