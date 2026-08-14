import Link from "next/link";
import Image from "../remote-image";
import Card from "../card";
import UsersIcon from "../icons/users";
import LockClosedIcon from "../icons/lock-closed";
import type { Community } from "../../utils/community";

type CommunityCardProps = {
    community: Community;
    /** Esconde o selo de participação — útil onde todas já são da pessoa. */
    showMembership?: boolean;
};

/**
 * Card de comunidade das listagens (sugestões, perfil).
 *
 * Mostra a contagem real de membros; antes cada lugar repetia um card próprio,
 * um deles com dois avatares fixos e um "243 join" cravado no código.
 */
export default function CommunityCard({ community, showMembership = true }: CommunityCardProps) {
    const isMember = ["owner", "admin", "member"].includes(community.viewer_role);

    return (
        <Link
            href={`/social-media/communities/${community.id}`}
            className="group rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
        >
            <Card className="flex flex-row items-center gap-3 p-3 transition duration-300
                group-hover:-translate-y-0.5 group-hover:border-brand/50 group-hover:shadow-md">
                <Image
                    src={community.photo || "/imgs/placeholder.png"}
                    alt=""
                    width={48}
                    height={48}
                    sizes="48px"
                    className="w-12 aspect-square rounded-full object-cover shrink-0 bg-surface-2
                        ring-2 ring-transparent transition-colors group-hover:ring-brand/40"
                />

                <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-sm font-semibold truncate">{community.name}</h3>

                    {community.description && (
                        <p className="text-xs text-content-muted truncate">{community.description}</p>
                    )}

                    <span className="flex flex-row items-center gap-3 text-xs text-content-muted mt-0.5">
                        <span className="flex flex-row items-center gap-1">
                            <UsersIcon className="size-3 shrink-0" />
                            {community.members_count === 1
                                ? "1 membro"
                                : `${community.members_count ?? 0} membros`}
                        </span>

                        {/* entrar aqui depende de convite: dizer isso no card
                            evita a viagem até a comunidade para descobrir */}
                        {community.is_private && (
                            <span className="flex flex-row items-center gap-1">
                                <LockClosedIcon className="size-3 shrink-0" />
                                Privada
                            </span>
                        )}
                    </span>
                </div>

                {showMembership && isMember && (
                    <span className="shrink-0 rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {community.viewer_role === "owner"
                            ? "Dono"
                            : community.viewer_role === "admin"
                                ? "Admin"
                                : "Membro"}
                    </span>
                )}
            </Card>
        </Link>
    );
}
