'use client';

import { useCallback, useEffect, useState } from "react";
import Image from "../remote-image";
import Modal from "../modal";
import Button from "../button";
import Skeleton from "../skeleton";
import SearchIcon from "../icons/search";
import UsersIcon from "../icons/users";
import CheckIcon from "../icons/check";
import { get, post } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import { locationOf } from "../../utils/friendship";
import type { InviteCandidate, InviteStatus } from "../../utils/community";

type InviteFriendsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    communityId: number | string;
    communityName?: string;
};

/** Por que aquela pessoa não tem botão de convite. */
const STATUS_LABELS: Partial<Record<InviteStatus, string>> = {
    member: "Já participa",
    invited: "Convite enviado",
    blocked: "Bloqueado",
};

/**
 * Convidar amigos para a comunidade.
 *
 * Lista todos os amigos, e não só os convidáveis: ver "já participa" ao lado do
 * nome explica a ausência do botão, o que sumir da lista não explicaria.
 */
export default function InviteFriendsModal({
    isOpen,
    onClose,
    communityId,
    communityName,
}: InviteFriendsModalProps) {
    const { showToast } = useToaster();

    const [friends, setFriends] = useState<InviteCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sending, setSending] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);

        // get() engole o erro e devolve undefined
        const response = await get(`/social-media/community/${communityId}/invites/candidates`);

        setFriends(response?.data ?? []);
        setLoading(false);
    }, [communityId]);

    useEffect(() => {
        if (!isOpen) return;

        setSearch("");
        load();
    }, [isOpen, load]);

    async function invite(friend: InviteCandidate) {
        setSending(friend.id);

        try {
            const response = await post(`/social-media/community/${communityId}/invites`, {
                user_id: friend.id,
            });

            if (!response) {
                showToast({
                    title: "Convites",
                    message: "Não foi possível enviar o convite.",
                    status: "error",
                });
                return;
            }

            // a API devolve a situação final — inclusive quando ela mudou entre
            // abrir o modal e clicar (a pessoa entrou sozinha, por exemplo)
            const status: InviteStatus = response.status ?? "invited";

            setFriends((current) =>
                current.map((person) =>
                    person.id === friend.id ? { ...person, invite_status: status } : person
                )
            );

            showToast({
                title: "Convites",
                message: response.message ?? "Convite enviado!",
                status: status === "invited" ? "success" : "info",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Convites",
                message: error?.response?.data?.message ?? "Não foi possível enviar o convite.",
                status: "error",
            });
        } finally {
            setSending(null);
        }
    }

    const term = search.trim().toLowerCase();
    const filtered = term === ""
        ? friends
        : friends.filter((friend) => friend.name?.toLowerCase().includes(term));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={communityName ? `Convidar para ${communityName}` : "Convidar amigos"}
            width="sm:w-[520px]"
        >
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4
                        -translate-y-1/2 text-content-subtle" />

                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar entre os seus amigos"
                        placeholder="Buscar entre os seus amigos"
                        className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-4
                            text-sm text-content placeholder:text-content-subtle
                            focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-ring
                            [&::-webkit-search-cancel-button]:appearance-none"
                    />
                </div>

                {loading && (
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} height="h-14" rounded="card" />
                        ))}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto scrollbar-slim list-none">
                        {filtered.map((friend) => (
                            <li
                                key={friend.id}
                                className="flex flex-row items-center gap-3 rounded-card p-2
                                    hover:bg-surface-2 transition-colors"
                            >
                                <Image
                                    src={friend.photo || "/imgs/placeholder.png"}
                                    alt=""
                                    width={40}
                                    height={40}
                                    sizes="40px"
                                    className="size-10 shrink-0 rounded-full object-cover bg-surface-2"
                                />

                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-semibold truncate">{friend.name}</span>
                                    {locationOf(friend) && (
                                        <span className="text-xs text-content-muted truncate">
                                            {locationOf(friend)}
                                        </span>
                                    )}
                                </div>

                                {friend.invite_status === "none" ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="shrink-0 font-semibold"
                                        disabled={sending !== null}
                                        onClick={() => invite(friend)}
                                    >
                                        Convidar
                                    </Button>
                                ) : (
                                    <span
                                        className={`flex shrink-0 flex-row items-center gap-1 rounded-full px-2.5 py-1
                                            text-[11px] font-semibold
                                            ${friend.invite_status === "blocked"
                                                ? "bg-surface-3 text-content-muted"
                                                : "bg-brand-subtle text-brand"}`}
                                    >
                                        {friend.invite_status === "invited" && (
                                            <CheckIcon className="size-3 shrink-0" />
                                        )}
                                        {STATUS_LABELS[friend.invite_status]}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <span className="flex size-14 items-center justify-center rounded-full
                            bg-brand-subtle text-brand">
                            <UsersIcon className="size-7" />
                        </span>

                        <p className="max-w-xs text-sm text-content-muted">
                            {friends.length === 0
                                ? "Você ainda não tem amigos para convidar. Adicione pessoas em Amigos primeiro."
                                : "Nenhum amigo com esse nome."}
                        </p>
                    </div>
                )}

                <div className="flex flex-row justify-end border-t border-line pt-4">
                    <Button variant="ghost" size="md" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
