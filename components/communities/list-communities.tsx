import Image from "next/image";
import Link from "next/link";
import Button from "../button";
import EllipsisVerticalIcon from "../icons/ellipsis";

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

export default function ListCommunities({ communities }: CommunitiesProps) {
    return (
        <>
        {communities.map((community) => {

            return(
                            
                <Link href={`/social-media/communities/${community?.name}`} key={community.id}>
                    <div className="relative w-full flex flex-row gap-2 mb-2 overflow-hidden group justify-between items-center border-1 border-neutral-200 dark:border-neutral-800 rounded-2xl">
                        <div className="flex flex-col items-center">

                            <Image
                                src={community?.photo ?? '/imgs/placeholder.png'}
                                alt="Foto de perfil"                            
                                className="w-full aspect-[16/9] rounded-xl object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                                width={50}
                                height={50}
                                unoptimized
                            />
                            <div className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-xl p-4">
                                <span className="text-sm font-semibold">{community?.name}</span>
                                <p className="w-full flex text-xs font-normal text-gray-300 text-wrap">{community?.description}</p>
                                <p className="text-xs font-normal text-gray-400">{community?.location}</p>

                            </div>
                        </div>
                        <Button onClick={() => setModalNewPhoto(true)} className="absolute right-2 top-2 text-sm text-semibold">
                            <EllipsisVerticalIcon className="size-3"/>
                        </Button>
                    </div>
                </Link>
            
            );
        })}
        </>
    );
}