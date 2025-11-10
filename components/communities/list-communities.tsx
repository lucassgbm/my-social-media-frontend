import Image from "next/image";
import Card from "../card";
import Container from "../container";
import Link from "next/link";

interface Community {
    id: number;
    name: string;
    category_id: number;
    description?: string;
    photo?: string;
}

interface CommunitiesProps {
    communities: Community[];
}

export default function ListCommunities({communities} : CommunitiesProps){
    return (
        <>
        {communities.map((community) => {

            const imageCommunity = community.photo
            ? `${process.env.NEXT_PUBLIC_STORAGE_API?.replace(/\/$/, '')}/${community.photo?.replace(/^\//, '')}`
            : null;

            return(
                <div key={community.id}>

                    <Card className="rounded-3xl p-3 border border-neutral-200/50 dark:border-neutral-700/50 ">

                        <div className="w-full flex flex-col gap-4">

                            <Link href={`/social-media/communities/${community.id}`} className="w-full">
                                <Image
                                    src={imageCommunity || "/imgs/placeholder.png"}
                                    alt="Foto de perfil"
                                    className="rounded-2xl w-full hover:opacity-90 object-cover h-[200px]"
                                    width={420}
                                    height={420}
                                    priority
                                    />
                            </Link>
                            <div className="flex flex-row space-x-2 justify-between">
                                <Link href="/social-media/communities/1" className="cursor-pointer">
                                    <label className="text-2xl font-semibold">{community.name}</label>
                                </Link>
                                <button className="w-[80px] max-h-[35px] bg-green-500 hover:bg-green-400 text-white text-xs font-bold py-2 px-3 rounded-2xl cursor-pointer">
                                    Seguir
                                </button>
                            </div>
                            <div className="flex grid grid-cols-2 gap-2">
                                <div className="flex flex-col p-2 bg-neutral-700/50 items-center text-xs rounded-sm font-semibold">30<span className="text-neutral-400">Seguidores</span></div>
                                <div className="flex flex-col p-2 bg-neutral-700/50 items-center text-xs rounded-sm font-semibold">40<span className="text-neutral-400">Posts</span></div>

                            </div>
                            <div>
                                <div className="flex flex-row gap-2 mb-2">
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-neutral-400">Localização</label>
                                        <div className="flex flex-row w-[100px] bg-neutral-700/50 rounded-4xl py-1 text-xs justify-center border border-neutral-700/80">Brasília</div>
                                    </div>
                                </div>
                                <p className="text-xs text-justify text-gray-600 dark:text-gray-400">{community.description}</p>
                            </div>
                            
                        </div>
                    </Card>
                </div>
            );
        })}
        </>
    );
}