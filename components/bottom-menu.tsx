import Link from "next/link";
import Button from "./button";
import Container from "./container";
import CommunityIcon from "./icons/community";
import UsersIcon from "./icons/users";
import Image from "next/image";
import MessageIcon from "./icons/message";
import TrophyIcon from "./icons/trophy";
import { useContext } from "react";
import { AppContext } from "@/app/(pages)/social-media/layout";
import InboxIcon from "./icons/inbox";

export default function BottomMenu(){

    const context = useContext(AppContext);
    const { myInfo, openMessages, setOpenMessages } = context;

    const imageUser = myInfo?.photo ? `${process.env.NEXT_PUBLIC_STORAGE_API?.replace(/\/$/, '')}/${myInfo.photo?.replace(/^\//, '')}` : "";


    return (
        <Container className="sm:hidden flex fixed w-full bg-white -ml-6 bottom-0 rounded-0">
            <nav className="w-full">
                    
                    <ul className="flex flex-row list-none justify-center">
                        <Link href={`/social-media/profile/${myInfo?.name}`}>
                            <li className="flex w-full items-center gap-2 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-950 cursor-pointer">
                               
                                <Image
                                    src={myInfo?.photo ?? '/imgs/placeholder.png'}
                                    alt="Foto de perfil"
                                    className="w-[45px] rounded-full aspect-[1/1]"
                                    width={250}
                                    height={250}
                                    priority
                                />
                            </li>
                        </Link>
                        
                        <Link href="/social-media/friends">
                            <li className="flex w-full items-center gap-2 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-950 cursor-pointer">
                                <Button>
                                    <UsersIcon className="size-8 dark:text-white text-neutral-800"/>
                                </Button>

                            </li>
                        </Link>
                        <Link href="/social-media/communities">
                            <li className="flex w-full items-center gap-2 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-950 cursor-pointer">
                                <Button>
                                    <CommunityIcon className="size-8 dark:text-white text-neutral-800"/>
                                </Button>


                            </li>
                        </Link>

                        <Link href="/social-media/events">
                            <li className="flex w-full items-center gap-2 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-950 cursor-pointer">
                                
                                <Button>
                                    <TrophyIcon className="size-8 dark:text-white text-neutral-800"/>
                                </Button>

                            </li>
                        </Link>
                        
                        <Link href="#" onClick={() => { setOpenMessages(!openMessages) }}>
                            <li className="flex w-full items-center gap-2 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-950 cursor-pointer">

                            <Button>
                                <InboxIcon className="size-8 dark:text-white text-neutral-800"/>
                            </Button>
                                                        
                            </li>
                        </Link>
                        
                    </ul>

                </nav>
        </Container>
    )
}