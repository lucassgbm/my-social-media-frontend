import Image from "next/image"
import Link from "next/link"
import Button from "../button"
import EllipsisVerticalIcon from "../icons/ellipsis"

interface User {
    id: number,
    name: string,
    photo_path: string,
    title: string,
    location: string
}

export default function CardUser({user}: {user: User}) {
    return (
        <div className="relative w-full flex flex-row gap-2 mb-2 overflow-hidden group justify-between items-center border-1 border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <div className="flex flex-col items-center">

                <Image
                    src={user?.photo_path ?? '/imgs/placeholder.png'}
                    alt="Foto de perfil"                            
                    className="w-full rounded-xl aspect-[1/1] object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                    width={50}
                    height={50}
                    unoptimized
                />
                <Link href={`/social-media/user/${user?.name}`} key={user?.id} className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-xl p-4">

                    <span className="text-sm font-semibold">{user?.name}</span>
                    <p className="w-full flex text-xs font-normal text-gray-300 text-wrap">{user?.title}</p>
                    {user.location && (
                        <p className="text-xs font-normal text-gray-400">{user.location}</p>
                    )}

                </Link>
            </div>
            <Button onClick={() => {}} className="absolute right-2 top-2 text-sm text-semibold">
                <EllipsisVerticalIcon className="size-3"/>
            </Button>
        </div>
    )
} 