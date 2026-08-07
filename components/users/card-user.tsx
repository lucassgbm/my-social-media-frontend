import Image from "../remote-image";
import Link from "next/link"
import Button from "../button"
import EllipsisVerticalIcon from "../icons/ellipsis"

interface User {
    id: number,
    name: string,
    photo_path: string,
    title: string,
    location?: string
}

export default function CardUser({user}: {user: User}) {
    return (
        <div className="relative w-full flex flex-row gap-2 mb-2 overflow-hidden group justify-between items-center border border-line rounded-card">
            <div className="flex flex-col items-center">

                <Image
                    src={user?.photo_path ?? '/imgs/placeholder.png'}
                    alt=""
                    className="w-full rounded-card aspect-square object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                    width={200}
                    height={200}
                    sizes="(max-width: 1024px) 50vw, 150px"
                />
                <Link
                    href={`/social-media/user/${user?.name}`}
                    key={user?.id}
                    className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-card p-4 text-white
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                >
                    <span className="text-sm font-semibold">{user?.name}</span>
                    <p className="w-full flex text-xs font-normal text-gray-200 text-wrap">{user?.title}</p>
                    {user.location && (
                        <p className="text-xs font-normal text-gray-300">{user.location}</p>
                    )}

                </Link>
            </div>
            <Button
                onClick={() => {}}
                aria-label={`Mais opções sobre ${user?.name}`}
                className="absolute right-2 top-2"
            >
                <EllipsisVerticalIcon className="size-3"/>
            </Button>
        </div>
    )
} 