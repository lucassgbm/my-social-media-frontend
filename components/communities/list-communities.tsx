import Image from "../remote-image";
import Link from "next/link";

export interface Community {
    id: number;
    name: string;
    category_id?: number;
    description?: string | null;
    photo?: string | null;
    owner_id?: number;
}

interface CommunitiesProps {
    communities: Community[];
}

export default function ListCommunities({ communities }: CommunitiesProps) {
    return (
        <>
            {communities.map((community) => (
                // A rota de detalhe usa route-model binding por id — antes o
                // link ia para /communities/{name} e a API devolvia 404.
                <Link
                    href={`/social-media/communities/${community.id}`}
                    key={community.id}
                    className="group relative flex overflow-hidden rounded-card border border-line
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                >
                    <Image
                        src={community.photo ?? "/imgs/placeholder.png"}
                        alt=""
                        className="w-full aspect-[16/9] object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        width={480}
                        height={270}
                        sizes="(max-width: 640px) 100vw, 320px"
                    />

                    <div className="absolute bottom-0 left-0 flex w-full flex-col gap-0.5
                        bg-linear-to-t from-black via-black/70 to-transparent p-4 text-white">
                        <h3 className="text-sm font-semibold truncate">{community.name}</h3>
                        {community.description && (
                            <p className="text-xs font-normal text-gray-200 line-clamp-2">
                                {community.description}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </>
    );
}
