'use client';

import { useState, type MouseEvent } from "react";
import Button, { type ButtonSize } from "../button";
import ConfirmModal from "../confirm-modal";
import PlusIcon from "../icons/plus";
import CheckIcon from "../icons/check";
import ClockIcon from "../icons/clock";
import UsersIcon from "../icons/users";
import UserMinusIcon from "../icons/user-minus";
import {
    useAcceptFriendRequest,
    useSendFriendRequest,
    useUnfriend,
} from "../../hooks/use-friends";
import { useToaster } from "../../providers/toaster-provider";
import { errorMessage } from "../../utils/api-error";
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
 *
 * Já sendo amigos, o botão desfaz a amizade, mas só depois da confirmação: o
 * vínculo levou o aceite das duas partes para existir e um clique errado no
 * card não pode desmanchá-lo.
 */
export default function AddFriendButton({
    person,
    size = "sm",
    className = "",
    iconOnly = false,
    onStatusChange,
}: AddFriendButtonProps) {
    const { showToast } = useToaster();

    /**
     * O botão também vive em listas que não passam pelo React Query (resultados
     * da busca, membros de comunidade), então guarda o próprio estado. As
     * mutações abaixo invalidam o cache de amizade para as telas que passam.
     */
    const [status, setStatus] = useState<FriendshipStatus>(
        person.friendship_status ?? "none"
    );
    const [confirmingUnfriend, setConfirmingUnfriend] = useState(false);

    const sendRequest = useSendFriendRequest();
    const acceptRequest = useAcceptFriendRequest();
    const unfriendRequest = useUnfriend();

    const sending =
        sendRequest.isPending || acceptRequest.isPending || unfriendRequest.isPending;

    // o próprio usuário não tem o que adicionar
    if (status === "self") return null;

    /**
     * O botão mora dentro do <Link> do card: sem barrar o clique, adicionar
     * alguém levava junto para o perfil dessa pessoa.
     */
    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (status === "friends") {
            setConfirmingUnfriend(true);
            return;
        }

        sendOrAccept();
    }

    function sendOrAccept() {
        // aceitar e convidar são endpoints diferentes, mas para quem clica é o
        // mesmo gesto: "quero ser amigo desta pessoa"
        const accepting = status === "request_received";
        const mutation = accepting ? acceptRequest : sendRequest;

        mutation.mutate(person.id, {
            onSuccess: (response) => {
                // conflitos previsíveis (já são amigos, convite repetido) voltam
                // como 200 com o estado real — o backend é quem decide
                const next = response.status ?? (accepting ? "friends" : "request_sent");

                setStatus(next);
                onStatusChange?.(person.id, next);

                showToast({
                    title: "Amigos",
                    message: response.message ?? "Convite enviado!",
                    status: "success",
                });
            },
            onError: (error) => {
                showToast({
                    title: "Amigos",
                    message: errorMessage(
                        error,
                        `Não foi possível ${accepting ? "aceitar o convite" : "enviar o convite"}.`
                    ),
                    status: "error",
                });
            },
        });
    }

    function unfriend() {
        unfriendRequest.mutate(person.id, {
            onSuccess: (response) => {
                setStatus("none");
                onStatusChange?.(person.id, "none");
                setConfirmingUnfriend(false);

                showToast({
                    title: "Amigos",
                    message: response.message ?? `Você desfez a amizade com ${person.name}.`,
                    status: "success",
                });
            },
            onError: (error) => {
                showToast({
                    title: "Amigos",
                    message: errorMessage(error, "Não foi possível desfazer a amizade."),
                    status: "error",
                });
            },
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

    // o convite pendente depende da outra pessoa: vira indicador de estado
    const inactive = status === "request_sent";

    /** "Amigos" é o estado; o que o clique faz é outra coisa e precisa ser dito. */
    const hint = status === "friends" ? `Desfazer amizade com ${person.name}` : label;

    return (
        <>
            <Button
                variant={status === "none" || status === "request_received" ? "primary" : "secondary"}
                size={iconOnly ? "icon" : size}
                disabled={sending || inactive}
                onClick={handleClick}
                aria-label={iconOnly ? hint : undefined}
                title={iconOnly || status === "friends" ? hint : undefined}
                className={`group/friend ${className}`}
            >
                {/* já amigos, o ícone troca no hover: "Amigos" é o estado, e sem
                    isso nada na tela diz que dá para clicar ali */}
                {status === "friends" ? (
                    <>
                        <UsersIcon className="size-4 shrink-0 group-hover/friend:hidden" />
                        <UserMinusIcon className="hidden size-4 shrink-0 group-hover/friend:block" />
                    </>
                ) : (
                    <Icon className="size-4 shrink-0" />
                )}
                {!iconOnly && label}
            </Button>

            <ConfirmModal
                isOpen={confirmingUnfriend}
                onClose={() => setConfirmingUnfriend(false)}
                onConfirm={unfriend}
                title="Desfazer amizade"
                description={
                    <>
                        <strong className="font-semibold text-content">{person.name}</strong> sai
                        da sua lista de amigos, e você da lista dessa pessoa. Ninguém é avisado, e
                        um novo convite pode ser enviado depois.
                    </>
                }
                confirmLabel="Desfazer amizade"
                confirmVariant="danger"
                pending={sending}
            />
        </>
    );
}
