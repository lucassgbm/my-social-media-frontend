'use client';

import { useState } from "react";
import Modal from "../modal";
import Button from "../button";
import { post, remove } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import type { CommunityMember } from "../../utils/community";

type Action = "kick" | "block" | "unblock" | "promote" | "demote";

type MemberManageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    communityId: number | string;
    member: CommunityMember | null;
    /** Recarrega a lista depois da ação — papéis e contadores mudam juntos. */
    onDone: () => void;
};

/**
 * Ações de moderação sobre um membro.
 *
 * Quem pode o quê já vem decidido do backend (`can_moderate` e
 * `can_assign_role` em cada membro); aqui é só a confirmação, porque expulsar e
 * bloquear não têm desfazer óbvio.
 */
export default function MemberManageModal({
    isOpen,
    onClose,
    communityId,
    member,
    onDone,
}: MemberManageModalProps) {
    const { showToast } = useToaster();

    const [pending, setPending] = useState<Action | null>(null);
    const [confirming, setConfirming] = useState<Action | null>(null);

    if (!member) return null;

    const base = `/social-media/community/${communityId}/members/${member.id}`;

    async function run(action: Action) {
        setPending(action);

        try {
            let response;

            if (action === "kick") {
                response = await remove(base);
            } else if (action === "promote" || action === "demote") {
                response = await post(`${base}/role`, {
                    role: action === "promote" ? "admin" : "member",
                });
            } else {
                response = await post(`${base}/${action}`, {});
            }

            if (!response) {
                showToast({
                    title: "Membros",
                    message: "Não foi possível concluir a ação.",
                    status: "error",
                });
                return;
            }

            showToast({
                title: "Membros",
                message: response.message ?? "Pronto!",
                status: "success",
            });

            onDone();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                title: "Membros",
                message: error?.response?.data?.message ?? "Não foi possível concluir a ação.",
                status: "error",
            });
        } finally {
            setPending(null);
            setConfirming(null);
        }
    }

    const confirmLabels: Record<Action, string> = {
        kick: `Remover ${member.name} da comunidade? Ele poderá entrar de novo.`,
        block: `Bloquear ${member.name}? Ele perde o acesso e não consegue voltar.`,
        unblock: `Desbloquear ${member.name}?`,
        promote: `Tornar ${member.name} administrador da comunidade?`,
        demote: `${member.name} deixa de ser administrador?`,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar ${member.name}`} width="sm:w-[460px]">
            {confirming ? (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-content-muted">{confirmLabels[confirming]}</p>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button variant="ghost" size="md" onClick={() => setConfirming(null)}>
                            Voltar
                        </Button>
                        <Button
                            variant={confirming === "kick" || confirming === "block" ? "danger" : "primary"}
                            size="md"
                            disabled={pending !== null}
                            onClick={() => run(confirming)}
                        >
                            Confirmar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {member.can_assign_role && !member.blocked && (
                        <Button
                            variant="secondary"
                            size="md"
                            className="justify-start"
                            onClick={() =>
                                setConfirming(member.community_role === "admin" ? "demote" : "promote")
                            }
                        >
                            {member.community_role === "admin"
                                ? "Rebaixar a membro"
                                : "Tornar administrador"}
                        </Button>
                    )}

                    {member.can_moderate && !member.blocked && (
                        <>
                            <Button
                                variant="secondary"
                                size="md"
                                className="justify-start"
                                onClick={() => setConfirming("kick")}
                            >
                                Expulsar da comunidade
                            </Button>
                            <Button
                                variant="danger"
                                size="md"
                                className="justify-start"
                                onClick={() => setConfirming("block")}
                            >
                                Bloquear
                            </Button>
                        </>
                    )}

                    {member.can_moderate && member.blocked && (
                        <Button
                            variant="primary"
                            size="md"
                            className="justify-start"
                            onClick={() => setConfirming("unblock")}
                        >
                            Desbloquear
                        </Button>
                    )}

                    <Button variant="ghost" size="md" className="mt-2" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            )}
        </Modal>
    );
}
