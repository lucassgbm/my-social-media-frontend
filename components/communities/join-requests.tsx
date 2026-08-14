'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "../remote-image";
import Button from "../button";
import ColorButton from "../color-button";
import Skeleton from "../skeleton";
import InboxIcon from "../icons/inbox";
import { get, post, remove } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityJoinRequest } from "../../utils/community";

type JoinRequestsProps = {
    communityId: number | string;
    /**
     * Chamado depois de responder a um pedido. A página recarrega a comunidade:
     * aprovar muda a lista de membros e as contagens, e recusar muda o badge da
     * aba.
     */
    onAnswered?: (approved: boolean) => void;
};

/**
 * Fila de pedidos de entrada de uma comunidade privada.
 *
 * Só é renderizada para quem modera; a lista fica junto dos membros porque é
 * ali que se decide quem participa.
 */
export default function JoinRequests({ communityId, onAnswered }: JoinRequestsProps) {
    const { showToast } = useToaster();

    const [requests, setRequests] = useState<CommunityJoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    // id do pedido em processamento: os botões daquela linha ficam travados
    const [answering, setAnswering] = useState<number | null>(null);

    const loadRequests = useCallback(async () => {
        setLoading(true);

        const response = await get(`/social-media/community/${communityId}/join-requests`);

        setRequests(response?.data ?? []);
        setLoading(false);
    }, [communityId]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    async function answer(request: CommunityJoinRequest, approve: boolean) {
        setAnswering(request.id);

        const base = `/social-media/community/${communityId}/join-requests/${request.id}`;

        // post() engole o erro e devolve undefined; remove() lança
        let response;
        try {
            response = approve ? await post(`${base}/approve`, {}) : await remove(base);
        } catch {
            response = undefined;
        }

        setAnswering(null);

        if (!response) {
            showToast({
                title: "Pedidos de entrada",
                message: approve
                    ? "Não foi possível aprovar o pedido."
                    : "Não foi possível recusar o pedido.",
                status: "error",
            });
            return;
        }

        setRequests((current) => current.filter((item) => item.id !== request.id));

        showToast({
            title: "Pedidos de entrada",
            message: response.message ?? "Pronto!",
            status: "success",
        });

        onAnswered?.(approve);
    }

    if (!loading && requests.length === 0) return null;

    return (
        <section
            aria-label="Pedidos de entrada"
            className="mb-4 flex flex-col gap-3 rounded-card border border-line bg-surface-2 p-4"
        >
            <div className="flex flex-row items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full
                    bg-brand-subtle text-brand">
                    <InboxIcon className="size-4" />
                </span>

                <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight">Pedidos de entrada</h3>
                    <p className="text-xs text-content-muted">
                        {loading
                            ? "Carregando..."
                            : `${requests.length} ${requests.length === 1 ? "pessoa quer" : "pessoas querem"} participar`}
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton key={index} className="h-14" rounded="card" />
                    ))}
                </div>
            )}

            {!loading && (
                <ul className="flex flex-col gap-2 list-none">
                    {requests.map((request) => (
                        <li
                            key={request.id}
                            className="flex flex-row items-center gap-3 rounded-card bg-surface p-3"
                        >
                            <Link
                                href={`/social-media/profile/${request.user.id}`}
                                className="flex min-w-0 flex-1 flex-row items-center gap-3 rounded-card
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <Image
                                    src={request.user.photo || "/imgs/placeholder.png"}
                                    alt=""
                                    width={40}
                                    height={40}
                                    sizes="40px"
                                    className="size-10 shrink-0 rounded-full object-cover bg-surface-2"
                                />

                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-semibold">
                                        {request.user.name}
                                    </span>
                                    {request.created_at && (
                                        <span className="text-xs text-content-muted">
                                            Pediu {request.created_at}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            <div className="flex shrink-0 flex-row items-center gap-2">
                                <ColorButton
                                    onClick={() => answer(request, true)}
                                    disabled={answering === request.id}
                                    className="px-3 text-xs font-semibold"
                                >
                                    Aprovar
                                </ColorButton>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => answer(request, false)}
                                    disabled={answering === request.id}
                                >
                                    Recusar
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
