'use client';

import { useContext } from "react";
import Image from "next/image";
import HomeIcon from "./icons/home";
import UsersIcon from "./icons/users";
import CommunityIcon from "./icons/community";
import TrophyIcon from "./icons/trophy";
import MessageIcon from "./icons/message";
import SettingsIcon from "./icons/settings";
import Link from "next/link";
import Container from "./container";
import Button from "./button";
import Skeleton from "./skeleton";
import { AppContext } from "@/app/(pages)/social-media/layout";
import Card from "./card";
import RingImage from "./ring-image";
import PinIcon from "./icons/pin";



export default function Sidebar() {

    
    const context = useContext(AppContext);

    const { myInfo } = context;

    const imageUser = myInfo?.photo ?? '/imgs/placeholder.png';
    return (
        <>
            
            <div className="sticky top-0 h-[600px] hidden sm:grid sm:col-span-2 gap-4">
                <Container className="flex flex-col rounded-md" padding="p-4">
                    <div className="flex flex-col justify-center">
                        {myInfo && (
                            <>
                                <div className="flex flex-col">
                                    <Link href={`/social-media/profile/${myInfo?.name}`}>
                                        <div className="flex flex-row items-center">

                                            <RingImage className="relative min-w-[55px] max-w-[65px]">
                                                <Image
                                                    src={imageUser}
                                                    alt="Foto de perfil"
                                                    className="rounded-full aspect-[1/1]"
                                                    width={250}
                                                    height={250}
                                                    priority
                                                    unoptimized
                                                />

                                            </RingImage>
                                            <div className="flex flex-col p-2">
                                                <label className=" text-sm">{myInfo.name}</label>
                                                <label className="text-xs text-gray-400 text-xs">ver perfil</label>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="mt-2">
                                        <p className="flex text-xs text-gray-400 justify-between">
                                            {myInfo.autodescription && myInfo.autodescription.length > 30
                                            ? myInfo.autodescription.slice(0, 40) + "..."
                                            : myInfo.autodescription}
                                        </p>
                                    </div>
                                    <div className="flex mt-2 items-center gap-1">
                                        <PinIcon className="size-3 text-green-500"/>
                                        <span className="text-xs">Brasília - DF</span>
                                    </div>
                                </div>
                                
                            </>
                        
                        )}

                        {!myInfo && (
                            <>
                                <div className="flex flex-row items-center gap-2 mb-6">
                                    
                                    <Skeleton height={"h-[55px]"} width={"w-[55px]"} rounded="full" className="aspect-[1/1]" />
                                    <div className="flex flex-col w-full">
                                        <Skeleton width={"w-full"} height={"h-[55px]"} />
                                    </div>
                                </div>
                                <div className="w-full flex flex-row items-center">
                                    <Skeleton rounded="lg" width="w-full" height="h-[50px]" />
                                        
                                
                                </div>
                            </>
                        )}

                        <Card className="flex flex-col rounded-2xl gap-2 p-4 mt-4">
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-xs text-gray-400">Amigos</label>
                                <label className="text-xs">213</label>
                            </div>
                            <div className="w-full flex flex-row justify-between">
                                <label className="text-xs text-gray-400">Comunidades</label>
                                <label className="text-xs">16</label>
                            </div>

                        </Card>
                    </div>
                </Container>

                <Container className="rounded-md" padding="p-4">

                    <nav className="w-full flex flex-col gap-2 overflow-y-auto">
                        <ul className="list-none">

                            <Link href="/social-media">
                                <li className="flex w-full items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">
                                    
                                    <Button>
                                        <HomeIcon className="size-4 dark:text-white text-neutral-800"/>
                                    </Button>
                                    <label className="hidden md:flex text-xs ">Home</label>

                                </li>
                            </Link>
                            
                            <Link href="/social-media/friends">
                                <li className="flex w-full items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">
                                    <Button>
                                        <UsersIcon className="size-4 dark:text-white text-neutral-800"/>
                                    </Button>
                                    <label className="hidden md:flex text-xs ">Amigos</label>

                                </li>
                            </Link>
                            <Link href="/social-media/communities">
                                <li className="flex w-full items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">
                                    <Button>
                                        <CommunityIcon className="size-4 dark:text-white text-neutral-800"/>
                                    </Button>

                                    <label className="hidden md:flex text-xs ">Comunidades</label>

                                </li>
                            </Link>
                            <Link href="/social-media/events">
                                <li className="flex w-full items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">
                                    <Button>
                                        <TrophyIcon className="size-4 dark:text-white text-neutral-800"/>
                                    </Button>
                                
                                    <label className="hidden md:flex text-xs ">Eventos</label>

                                </li>
                            </Link>
                            <Link href="/social-media/messages">
                                <li className="flex w-full p-2 items-center rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition justify-between">
                                    <div className="flex flex-row gap-2 items-center">
                                        <Button>
                                            <MessageIcon className="size-4 dark:text-white text-neutral-800"/>
                                        </Button>
                                        
                                        <label className="hidden md:flex text-xs ">Mensagens</label> 
                                    </div>
                                    <div className="hidden md:flex">
                                        <span className="bg-[#f53003] rounded-full text-white text-xs w-5 h-5 flex items-center justify-center">3</span>
                                    </div>
                                    
                                </li>
                            </Link>
                            <Link href="/social-media/settings">
                                <li className="flex w-full items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">

                                    <Button>
                                        <SettingsIcon className="size-4 dark:text-white text-neutral-800"/>
                                    </Button>
                                    
                                    <label className="hidden md:flex text-xs ">Preferências</label>
                                </li>
                            </Link>  
                        </ul>
                    </nav>
                </Container>
            </div>
        </>
    );
}