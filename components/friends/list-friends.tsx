import Image from "../remote-image";
import MessageIcon from "../icons/message";
import EllipsisVerticalIcon from "../icons/ellipsis";
import Button from "../button";
import RingImage from "../ring-image";
import { JSX } from "react";
import Link from "next/link";

interface FriendsProps {
    friends: Friend[];
}

interface Friend {
    id: number;
    name: string;
    photo: string | null;
}
export default function ListFriends({friends}: FriendsProps) {
    return (
        <>
            {friends.map((friend: Friend) => (
                
                <Link href={`/social-media/profile/${friend.id}`} key={friend.id}>

                    <div className="bg-neutral-100 bg-neutral-950/40 h-[auto] text-center rounded-2xl p-4 cursor-pointer" key={friend.id}>
                        <div className="w-full flex flex-col gap-2 justify-center items-center">
                            <RingImage className="cursor-pointer">
                                <Image
                                    src={friend.photo ?? '/imgs/placeholder.png'}
                                    alt="Foto de perfil"
                                    className="rounded-full w-[100px] hover:opacity-90 aspect-[1/1]"
                                    width={120}
                                    height={120}
                                    />
                            </RingImage>

                            <span className="w-[full] flex text-sm font-semibold justify-start">{friend.name}</span>
                            
                        </div>
                    </div>
                </Link>
            ))}
            
        </>
    );
}