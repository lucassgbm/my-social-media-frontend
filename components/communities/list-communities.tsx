import Image from "../remote-image";
import Link from "next/link";
import UsersIcon from "../icons/users";
import MessageIcon from "../icons/message";
import ArrowRightIcon from "../icons/arrow-right";
import type { Community, CommunityRole } from "../../utils/community";

interface CommunitiesProps {
    communities: Community[];
    /** Nome da categoria por id — vira o selo sobre a capa. */
    categoryNames?: Record<number, string>;
}

const ROLE_LABELS: Partial<Record<CommunityRole, string>> = {
    owner: "Dono",
    admin: "Admin",
    member: "Membro",
};

function plural(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export default function ListCommunities({ communities, categoryNames }: CommunitiesProps) {
    return (
        <>
            {communities.map((community) => {
                const role = ROLE_LABELS[community.viewer_role];
                const category = community.category_id
                    ? categoryNames?.[community.category_id]
                    : undefined;

                return (
                    // A rota de detalhe usa route-model binding por id — antes o
                    // link ia para /communities/{name} e a API devolvia 404.
                    <Link
                        href={`/social-media/communities/${community.id}`}
                        key={community.id}
                        className="group relative flex flex-col overflow-hidden rounded-card border border-line
                            bg-surface shadow-sm transition duration-300 ease-out
                            hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                            <Image
                                src={community.photo ?? "/imgs/placeholder.png"}
                                alt=""
                                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                width={480}
                                height={270}
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
                            />

                            {/* O gradiente é o que garante contraste do nome sobre
                                qualquer capa, clara ou escura */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10"
                            />

                            <div className="absolute inset-x-0 top-0 flex flex-row items-start gap-2 p-3">
                                {category && (
                                    <span className="truncate rounded-full bg-black/45 px-2.5 py-1 text-[11px]
                                        font-medium text-white backdrop-blur-sm">
                                        {category}
                                    </span>
                                )}

                                {role && (
                                    <span className="ml-auto shrink-0 rounded-full bg-brand px-2.5 py-1
                                        text-[11px] font-semibold text-on-brand">
                                        {role}
                                    </span>
                                )}
                            </div>

                            <h3 className="absolute inset-x-0 bottom-0 truncate p-4 text-base font-semibold text-white">
                                {community.name}
                            </h3>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 p-4">
                            <p className="line-clamp-2 min-h-10 text-sm text-content-muted">
                                {community.description || "Esta comunidade ainda não tem descrição."}
                            </p>

                            <div className="mt-auto flex flex-row flex-wrap items-center gap-x-4 gap-y-1
                                border-t border-line pt-3 text-xs text-content-muted">
                                <span className="flex flex-row items-center gap-1.5">
                                    <UsersIcon className="size-3.5 shrink-0" />
                                    {plural(community.members_count ?? 0, "membro", "membros")}
                                </span>

                                {community.topics_count !== undefined && (
                                    <span className="flex flex-row items-center gap-1.5">
                                        <MessageIcon className="size-3.5 shrink-0" />
                                        {plural(community.topics_count, "tópico", "tópicos")}
                                    </span>
                                )}

                                <span className="ml-auto flex flex-row items-center gap-1 font-semibold text-brand">
                                    Ver
                                    <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </>
    );
}
