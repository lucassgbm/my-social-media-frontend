'use client';

import CardUser from "../users/card-user";
import Button from "../button";
import SettingsIcon from "../icons/settings";
import { roleLabel, type CommunityMember } from "../../utils/community";

type MemberCardProps = {
    member: CommunityMember;
    /** Ausente quando o visitante não tem nada a fazer com esta pessoa. */
    onManage?: (member: CommunityMember) => void;
};

/**
 * Card de membro: o mesmo de qualquer pessoa, com o papel na comunidade e o
 * acesso à moderação para quem administra.
 *
 * O botão de gerenciar entra na coluna de ações do próprio card, logo abaixo
 * do de amizade.
 */
export default function MemberCard({ member, onManage }: MemberCardProps) {
    const label = member.blocked ? "Bloqueado" : roleLabel(member.community_role);
    const canManage = !!onManage && (member.can_moderate || member.can_assign_role);

    return (
        // relative para o selo de papel ficar sobre o card, que preenche a caixa
        <div className="relative">
            <CardUser
                user={member}
                actions={
                    canManage ? (
                        <Button
                            aria-label={`Gerenciar ${member.name}`}
                            title={`Gerenciar ${member.name}`}
                            className="shadow-sm"
                            onClick={() => onManage?.(member)}
                        >
                            <SettingsIcon className="size-4" />
                        </Button>
                    ) : null
                }
            />

            {label && (
                <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold
                        ${member.blocked ? "bg-danger text-white" : "bg-black/60 text-white"}`}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
