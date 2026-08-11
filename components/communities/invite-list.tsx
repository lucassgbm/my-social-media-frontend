'use client';

import { useState } from "react";
import Image from "../remote-image";
import Button from "../button";
import { post } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityInvite } from "../../utils/community";

type InviteListProps = {
    invites: CommunityInvite[];
    /** Chamado depois de aceitar ou recusar — a lista e a contagem mudam juntas. */
    onResponded: (inviteId: number, accepted: boolean) => void;
};

/**
 * Convites de comunidade recebidos, com a resposta em linha.
 *
 * Aceitar entra na comunidade na hora; recusar apaga o convite, e a mesma
 * pessoa pode convidar de novo depois.
 */
export default function InviteList({ invites, onResponded }: InviteListProps) {
    const { showToast } = useToaster();

    const [pending, setPending] = useState<number | null>(null);

    async function respond(invite: CommunityInvite, accepted: boolean) {
        setPending(invite.id);

        try {
            const response = await post(
                `/social-media/community-invites/${invite.id}/${accepted ? "accept" : "decline"}`,
                {}
            );

            // post() engole o erro e devolve undefined
            if (!response) {
                showToast({
                    title: "Convites",
                    message: "Não foi possível responder ao convite.",
                    status: "error",
                });
                return;
            }

            showToast({
                title: "Convites",
                message: response.message ?? "Pronto!",
                status: accepted ? "success" : "info",
            });

            onResponded(invite.id, accepted);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Convites",
                message: error?.response?.data?.message ?? "Não foi possível responder ao convite.",
                status: "error",
            });
        } finally {
            setPending(null);
        }
    }

    return (
        <ul className="flex flex-col gap-3 list-none">
            {invites.map((invite) => (
                <li
                    key={invite.id}
                    className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4
                        sm:flex-row sm:items-center"
                >
                    <Image
                        src={invite.community.photo || "/imgs/placeholder.png"}
                        alt=""
                        width={56}
                        height={56}
                        sizes="56px"
                        className="size-14 shrink-0 rounded-card object-cover bg-surface-2"
                    />

                    <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                        <span className="text-sm font-semibold truncate">
                            {invite.community.name}
                        </span>

                        {invite.inviter && (
                            <span className="text-xs text-content-muted truncate">
                                Convidado por {invite.inviter.name}
                            </span>
                        )}

                        {invite.community.description && (
                            <p className="line-clamp-2 text-xs text-content-muted">
                                {invite.community.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-row items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending !== null}
                            onClick={() => respond(invite, false)}
                        >
                            Recusar
                        </Button>

                        <Button
                            variant="primary"
                            size="sm"
                            className="font-semibold"
                            disabled={pending !== null}
                            onClick={() => respond(invite, true)}
                        >
                            Aceitar
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
