'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArrowRightIcon from "./icons/arrow-right";
import LoadingSpinner from "./loading-spinner";
import Button from "./button";
import { useSessionStore } from "../stores/use-session-store";
import { logout } from "@/api/services/auth";
import { useToaster } from "../providers/toaster-provider";

type LogoutButtonProps = {
    /**
     * `menu` imita a linha do Submenu (cabeçalho); `button` é o botão da tela
     * de preferências.
     */
    variant?: "menu" | "button";
    /** Fecha o menu que contém o botão, antes da navegação. */
    onDone?: () => void;
};

/**
 * Encerra a sessão de verdade.
 *
 * O item "Sair" era um `<Link href="/login">`: saía da tela, mas o cookie
 * continuava lá e bastava voltar para /social-media para estar dentro de novo.
 * Aqui a chamada à API vem antes, e só depois a navegação.
 *
 * A saída acontece mesmo se a chamada falhar: o servidor pode estar fora do ar,
 * e prender alguém numa sessão que ele pediu para encerrar é pior do que sair
 * com o token ainda vivo — que expira sozinho em 5 horas.
 */
export default function LogoutButton({ variant = "menu", onDone }: LogoutButtonProps) {
    const router = useRouter();
    const { showToast } = useToaster();
    const clearSession = useSessionStore((state) => state.clear);

    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);

        try {
            await logout();
        } catch {
            showToast({
                title: "Sair",
                message: "Não foi possível avisar o servidor, mas a sessão foi encerrada aqui.",
                status: "error",
            });
        }

        // limpa a sessão antes de navegar: sem isso o cabeçalho ainda mostra a
        // foto de quem saiu enquanto a rota troca
        clearSession();
        onDone?.();

        // replace e não push: o botão "voltar" não deve retornar para a área
        // logada, que agora só redirecionaria para o login
        router.replace("/login");
    }

    if (variant === "button") {
        return (
            <Button
                variant="outline"
                size="md"
                onClick={handleLogout}
                disabled={loading}
                aria-busy={loading}
                className="rounded-field font-semibold"
            >
                {loading ? <LoadingSpinner /> : <ArrowRightIcon className="size-4" />}
                Sair da conta
            </Button>
        );
    }

    return (
        <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loading}
            aria-busy={loading}
            className="flex w-full items-center gap-3 rounded-field p-2 mb-1
                text-content hover:bg-surface-2 transition-colors cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
        >
            {/* sem spinner aqui: ele é maior que o ícone e empurraria a linha
                do menu; o estado desabilitado já esmaece o item */}
            <span className="flex items-center justify-center rounded-full bg-surface-3 p-2">
                <ArrowRightIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold">Sair</span>
        </button>
    );
}
