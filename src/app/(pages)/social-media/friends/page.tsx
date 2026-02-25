'use client';

import Container from "../../../../../components/container";
import ListFriends from "../../../../../components/friends/list-friends";
import PlusIcon from "../../../../../components/icons/plus";
import ColorButton from "../../../../../components/color-button";
import { useEffect, useState } from "react";
import { get, post } from "@/api/services/request";
import RequestFriend from "../../../../../components/friends/request-friend";
import { request } from "http";
import Toaster from "../../../../../components/toaster";
import Sidebar from "../../../../../components/sidebar";
import Image from "next/image";
import Link from "next/link";
import CardUser from "../../../../../components/users/card-user";
import Modal from "../../../../../components/modal";
import BorderButton from "../../../../../components/border-button";
import SearchIcon from "../../../../../components/icons/search";
import Skeleton from "../../../../../components/skeleton";
import CloseIcon from "../../../../../components/icons/close";

export default function Home() {

    useEffect(() => {
        getfriends();
    }, []);
    const [modalNewCommunity, setModalNewCommunity] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [friends, setfriends] = useState<any[]>([]);
    const [toaster, setToaster] = useState({
    show: false,
    message: "",
    });

    async function getfriends(){
        setLoading(true);
        try {
            const response = await get("/social-media/community");
            // setfriends(response.data);
        } catch (error: any) {
    
            setToaster({ show: true, message: "Erro ao carregar amigos" });
        }
        setLoading(false);
    }

    const friends = [
        {
            id: 1,
            name: "João",
            title: "Estudante",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "Rio de Janeiro - RJ"
        },
        {
            id: 2,
            name: "Maria",
            title: "Maquiadora",
            photo_path: "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "São Paulo - SP"
        },
        {
            id: 3,
            name: "Pedro",
            title: "Desenvolvedor Full Stack",
            photo_path: "https://images.unsplash.com/photo-1770191954591-952ab5c63e68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDkyfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "Curitiba - PR"
        },
        {
            id: 4,
            name: "Ana",
            title: "Dentista",
            photo_path: "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "Belo Horizonte - MG"
        },
    ]

    const sugestedFriends = [
        {
            id: 1,
            name: "João",
            title: "Estudante",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "Rio de Janeiro - RJ"
        },
        {
            id: 2,
            name: "Maria",
            title: "Maquiadora",
            photo_path: "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "São Paulo - SP"
        },
        {
            id: 3,
            name: "Pedro",
            title: "Desenvolvedor Full Stack",
            photo_path: "https://images.unsplash.com/photo-1770191954591-952ab5c63e68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDkyfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "Curitiba - PR"
        },
        {
            id: 4,
            name: "Ana",
            title: "Dentista",
            photo_path: "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
            location: "Belo Horizonte - MG"
        },
    ]

    return(
        <>
            <Sidebar />
            <div className="flex flex-col sm:flex-row col-span-full sm:col-span-9 gap-4">
                <Container className="w-full sm:w-[80%] h-full rounded-2xl" padding="p-0">

                    <div className="flex flex-col gap-4 mb-4 flex-wrap">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <div>

                                <h1 className="text-2xl font-semibold mb-4">Amigos</h1>
                            </div>
                            <div className="flex flex-col gap-2">

                                <div className="w-full flex flex-row gap-2 justify-end">

                                    <ColorButton
                                        onClick={() => setModalNewCommunity(true)}
                                    >
                                        <SearchIcon className="size-5" />
                                    </ColorButton>
                                    
                                </div>
                                <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-2">

                                    <div className="flex flex-row items-center bg-neutral-800 hover:bg-neutral-900 text-xs font-semibold py-2 px-2 pl-2 pr-2 rounded-md cursor-pointer gap-2">
                                        Antônio
                                        <CloseIcon className="size-3" />
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        {loading && (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-4 p-4">

                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[1/1]"/>

                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4">
                            {friends && friends.map((friend) => (
                                
                                <CardUser 
                                    key={friend.id}
                                    user={friend} 
                                />
                                
                            ))}

                        </div>
                    </div>
                </Container>
                <div className="w-full flex flex-col sm:w-[30%] gap-4" >

                    <Container className="rounded-2xl" padding="p-4">
                        <h1 className="text-lg font-semibold mb-4">Amigos próximos</h1>
                        <div className="grid grid-cols-2 gap-4">

                            {sugestedFriends && sugestedFriends.map((user) => (
                                    
                                <CardUser 
                                    user={user} 
                                    key={user.id} 
                                />
                            ))}
                        </div>
                    </Container>
                    <Container className="rounded-2xl" padding="p-4">
                        <h1 className="text-lg font-semibold mb-4">Amigos sugeridos</h1>
                        <div className="grid grid-cols-2 gap-4">

                            {sugestedFriends && sugestedFriends.map((user) => (
                                    
                                <CardUser 
                                    user={user} 
                                    key={user.id} 
                                />
                            ))}
                        </div>
                    </Container>
                </div>

            </div>
            
            {toaster.show && (
            <Toaster
                toaster={toaster}
                setToaster={setToaster}
            />
            )}
        </>
    )
}
