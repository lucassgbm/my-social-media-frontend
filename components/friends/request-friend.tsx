import Image from "../remote-image";
import Button from "../button";
import RingImage from "../ring-image";
import Link from "next/link";
import CheckIcon from "../icons/check";
import CloseIcon from "../icons/close";

interface FriendsProps {
    friends: Friend[];
    acceptRequest: (id: number) => void;
    declineRequest?: (id: number) => void;
    pendingId?: number | null;
}

interface Friend {
    id: number;
    name: string;
    photo: string | null;
}

export default function RequestFriend({
    acceptRequest,
    declineRequest,
    friends,
    pendingId,
}: FriendsProps) {
    return (
        <>
            {friends.map((friend: Friend) => (
                <div
                    className="flex flex-col items-center gap-2 rounded-card border border-line
                        bg-surface-2 p-4 text-center"
                    key={friend.id}
                >
                    <Link
                        href={`/social-media/profile/${friend.id}`}
                        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        <RingImage className="cursor-pointer w-[88px]">
                            <Image
                                src={friend.photo ?? '/imgs/placeholder.png'}
                                alt=""
                                className="rounded-full w-full aspect-square object-cover hover:opacity-90"
                                width={88}
                                height={88}
                                sizes="88px"
                            />
                        </RingImage>
                    </Link>

                    <span className="text-sm font-semibold truncate w-full">{friend.name}</span>

                    <div className="flex flex-row justify-center gap-2">
                        <Button
                            variant="primary"
                            onClick={() => acceptRequest(friend.id)}
                            disabled={pendingId === friend.id}
                            aria-label={`Aceitar solicitação de ${friend.name}`}
                        >
                            <CheckIcon className="size-4" />
                        </Button>
                        <Button
                            onClick={() => declineRequest?.(friend.id)}
                            disabled={pendingId === friend.id}
                            aria-label={`Recusar solicitação de ${friend.name}`}
                        >
                            <CloseIcon className="size-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </>
    );
}
