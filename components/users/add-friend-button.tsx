'use client';

import { useState } from "react";
import Button, { type ButtonSize } from "../button";
import PlusIcon from "../icons/plus";
import CheckIcon from "../icons/check";
import ClockIcon from "../icons/clock";
import UsersIcon from "../icons/users";
import { post } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { FriendshipStatus, Person } from "../../utils/friendship";

type AddFriendButtonProps = {
    person: Person;
    size?: ButtonSize;
    className?: string;
    /** Só o ícone — o card de sugestão não tem largura para o rótulo. */
    iconOnly?: boolean;
    /** Avisa a tela para atualizar contadores e listas. */
    onStatusChange?: (personId: number, status: FriendshipStatus) => void;
};

/**
 * Botão de amizade: o rótulo e a ação saem do `friendship_status` que a API
 * manda junto de cada pessoa.
 *
 * Quem já me convidou é aceito direto daqui — sem esse atalho, o único caminho
 * seria abrir a aba de solicitações.
 */
export default function AddFriendButton({
    person,
    size = "sm",
    className = "",
    iconOnly = false,
    onStatusChange,
}: AddFriendButtonProps) {
    const { showToast } = useToaster();

    const [status, setStatus] = useState<FriendshipStatus>(
        person.friendship_status ?? "none"
    );
    const [sending, setSending] = useState(false);

    // o próprio usuário não tem o que adicionar
    if (status === "self") return null;

    async function handleClick() {
        setSending(true);

        // aceitar e convidar são endpoints diferentes, mas para quem clica é o
        // mesmo gesto: "quero ser amigo desta pessoa"
        const accepting = status === "request_received";

        const response = accepting
            ? await post("/social-media/friends/accept", { user_id: person.id })
            : await post("/social-media/friends/send-request", { friend_id: person.id });

        setSending(false);

        // post() devolve undefined quando a requisição falha
        if (!response?.status) {
            showToast({
                title: "Amigos",
                message: `Não foi possível ${accepting ? "aceitar o convite" : "enviar o convite"}.`,
                status: "error",
            });
            return;
        }

        const next = response.status as FriendshipStatus;

        setStatus(next);
        onStatusChange?.(person.id, next);

        showToast({
            title: "Amigos",
            message: response.message ?? "Convite enviado!",
            status: "success",
        });
    }

    const labels: Record<FriendshipStatus, string> = {
        none: "Adicionar",
        request_sent: "Convite enviado",
        request_received: "Aceitar convite",
        friends: "Amigos",
        self: "",
    };

    const icons: Record<FriendshipStatus, typeof PlusIcon> = {
        none: PlusIcon,
        request_sent: ClockIcon,
        request_received: CheckIcon,
        friends: UsersIcon,
        self: PlusIcon,
    };

    const Icon = icons[status];
    const label = labels[status];

    // pendente e amizade fechada não têm ação: viram indicador de estado
    const inactive = status === "request_sent" || status === "friends";

    return (
        <Button
            variant={status === "none" || status === "request_received" ? "primary" : "secondary"}
            size={iconOnly ? "icon" : size}
            disabled={sending || inactive}
            onClick={handleClick}
            aria-label={iconOnly ? `${label} — ${person.name}` : undefined}
            title={iconOnly ? label : undefined}
            className={className}
        >
            <Icon className="size-4 shrink-0" />
            {!iconOnly && label}
        </Button>
    );
}
