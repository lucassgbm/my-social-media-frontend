import Image from "next/image";
import MessageIcon from "../icons/message";
import EllipsisVerticalIcon from "../icons/ellipsis";
import Button from "../button";
import RingImage from "../ring-image";
import { JSX } from "react";
import Link from "next/link";
import CheckIcon from "../icons/check";
import CloseIcon from "../icons/close";

interface FriendsProps {
    friends: Friend[];
    acceptRequest: (id: number) => void
}

interface Friend {
    id: number;
    name: string;
    photo: string | null;
}
export default function RequestFriend({ acceptRequest, friends }: FriendsProps) {
    return (
        <>
            {friends.map((friend: Friend) => (
                
                <div className="bg-neutral-100 bg-neutral-950/40 h-[auto] text-center rounded-2xl p-4 cursor-pointer" key={friend.id}>
                    <div className="w-full flex flex-col gap-2 justify-center items-center">
            
                        <Link href={`/social-media/profile/${friend.id}`} key={friend.id}>
                            <RingImage className="cursor-pointer">
                                <Image
                                    src={friend.photo ?? '/imgs/placeholder.png'}
                                    alt="Foto de perfil"
                                    className="rounded-full w-[100px] hover:opacity-90 aspect-[1/1]"
                                    width={120}
                                    height={120}
                                    unoptimized
                                    />
                            </RingImage>
                        </Link>

                        <label className="w-[full] flex text-sm font-semibold justify-start">{friend.name}</label>
                        <div className="flex flex-row justify-between gap-2">
                            <Button onClick={() => acceptRequest(friend.id)}>
                                <CheckIcon />
                            </Button>
                            <Button onClick={() => {}}>
                                <CloseIcon />
                            </Button>
                            
                        </div>
                    </div>
                </div>
            ))}
            
        </>
    );
}