'use client';
import Image from "next/image";
import Container from "../../../../../../components/container";
import Card from "../../../../../../components/card";
import { useState } from "react";
import TrophyIcon from "../../../../../../components/icons/trophy";
import Button from "../../../../../../components/button";
import CommunityIcon from "../../../../../../components/icons/community";
import PinIcon from "../../../../../../components/icons/pin";
import EllipsisVerticalIcon from "../../../../../../components/icons/ellipsis";
import RingImage from "../../../../../../components/ring-image";
import CardUser from "../../../../../../components/users/card-user";
import Link from "next/link";
import UsersIcon from "../../../../../../components/icons/users";
import MessageIcon from "../../../../../../components/icons/message";
import SettingsIcon from "../../../../../../components/icons/settings";

export default function Home(){
    
    const [loading, setLoading] = useState(false);

    const [community, setCommunity] = useState({
        id: 1,
        name: "Drift racing",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum nulla vitae cumque ullam laudantium sunt error illum, delectus voluptatum dicta pariatur quas perspiciatis. Ex quisquam obcaecati ratione, alias ullam tenetur!",
        image: "/imgs/drift.jpg"
    });

    const topics = [
        {
            id: 1,
            title: "Descrição do tópico 1",
            image: "/imgs/drift.jpg"
        },
        {
            id: 2,
            title: "Descrição do tópico 2",
            image: "/imgs/drift.jpg"
        },
        {
            id: 3,
            title: "Descrição do tópico 3",
            image: "/imgs/drift.jpg"
        },
        {
            id: 4,
            title: "Descrição do tópico 4",
            image: "/imgs/drift.jpg"
        }
    ]

    const members = [
        {
            id: 1,
            name: "João",
            title: "Estudante",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
        },
        {
            id: 2,
            name: "Maria",
            title: "Maquiadora",
            photo_path: "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
        },
        {
            id: 3,
            name: "Pedro",
            title: "Desenvolvedor Full Stack",
            photo_path: "https://images.unsplash.com/photo-1770191954591-952ab5c63e68?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDkyfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
        },
        {
            id: 4,
            name: "Ana",
            title: "Dentista",
            photo_path: "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
        },
        {
            id: 5,
            name: "Pedro",
            title: "Empresário",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
        },
        {
            id: 6,
            name: "Maria",
            title: "Dentista",
            photo_path: "https://images.unsplash.com/photo-1770576568718-6747e3d85de8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMzfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
        },
        {
            id: 7,
            name: "Maria",
            title: "Advogada",
            photo_path: "https://images.unsplash.com/photo-1769097137026-c482044ca0fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE5fHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
        },
    ]
    
    return(
        <>
            <div className="sticky top-0 h-[100vh] hidden sm:grid sm:col-span-1 gap-4">

                <Container className="w-full justify-center rounded-lg">
                    <Image
                        src="/imgs/drift.jpg"
                        alt="Logo"
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full aspect-[1/1] object-cover rounded-lg"
                    />
                    <div className="w-[80%] mx-auto flex bg-neutral-700/80 rounded-full aspect-[1/1] my-2 text-4xl items-center justify-center">{community.name.charAt(0).toUpperCase()}</div>
                    <div className="flex flex-col gap-2 rounded-2xl mt-4">
                        <nav className="w-full flex flex-col gap-2 overflow-y-auto mt-6">
                            <ul className="list-none">
                                
                                <Link href="/social-media/friends">
                                    <li className="flex w-full items-center justify-center gap-2 py-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 hover:text-green-400 cursor-pointer transition">
                                        <Button>
                                            <UsersIcon className="size-4 dark:text-white text-neutral-800"/>
                                        </Button>
    
                                    </li>
                                </Link>
                                
                                <Link href="/social-media/events">
                                    <li className="flex w-full items-center justify-center gap-2 py-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 hover:text-green-400 cursor-pointer transition">
                                        <Button>
                                            <TrophyIcon className="size-4 dark:text-white text-neutral-800"/>
                                        </Button>
    
                                    </li>
                                </Link>
                                
                                <Link href="/social-media/messages">
                                    <li className="flex w-full py-1 items-center justify-center rounded-md hover:bg-white dark:hover:bg-neutral-700 hover:text-green-400 cursor-pointer transition justify-between">
                                        <div className="flex flex-row gap-2 items-center">
                                            <Button className="relative">
                                                <MessageIcon className="size-4 dark:text-white text-neutral-800"/>
                                                <div className="absolute -bottom-1 -right-2">
                                                    <span className="bg-[#f53003] rounded-full text-white text-xs w-5 h-5 flex items-center justify-center">3</span>
                                                </div>
                                            </Button>
                                        </div>
                                        
                                    </li>
                                </Link>
                                    
                            </ul>
                        </nav>
                        <nav className="w-full flex flex-col gap-2 overflow-y-auto">
                            <ul className="list-none">
                            
                                <Link href="/social-media/settings">
                                    <li className="flex w-full items-center justify-center gap-2 py-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 hover:text-green-400 cursor-pointer transition">

                                        <Button>
                                            <SettingsIcon className="size-4 dark:text-white text-neutral-800"/>
                                        </Button>
                                    </li>
                                </Link> 
                            </ul>
                        </nav>
                    </div>
                </Container>
            </div>
            <div className="col-span-full sm:col-span-9 flex flex-col">

                <Container className="rounded-2xl" padding="p-0">

                    <div className="flex flex-col gap-2 flex-wrap">
                        <Image 
                            className="w-full h-[250px] rounded-t-2xl object-cover"
                            src="/imgs/drift.jpg"
                            alt="Capa da comunidade"
                            width={100}
                            height={100} 
                            unoptimized       
                        />
                        <div className="p-4">
                            <div className="flex flex-row gap-2 text-md items-center mb-2">
                                <PinIcon className="size-3" />
                                <p className="text-neutral-500">Brasília - DF</p>
                            </div>
                            <h1 className="text-2xl font-semibold">{community.name}</h1>
                            <p className="text-gray-400">{community.description}</p>
                        </div>

                        <div className="w-full flex flex-row p-4 mt-4 p-4">

                            <div className="w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="relative w-full flex flex-row gap-2 overflow-hidden group justify-between items-center border-1 border-neutral-200 dark:border-neutral-800 rounded-2xl">

                                    <div className="flex flex-col items-center">
                                    
                                        <Image
                                            src="/imgs/drift.jpg"
                                            alt="Foto de perfil"                            
                                            className="w-full aspect-[10/5] rounded-xl object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                                            width={100}
                                            height={100}
                                            unoptimized
                                        />
                                        <div className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-xl p-4">
                                            <span className="text-sm font-semibold">Evento</span>
                                            <p className="w-full flex text-xs font-normal text-white text-wrap">10/10/2023 às 8:00</p>
                                            <p className="text-xs font-normal text-gray-400">Local</p>

                                        </div>
                                        <Button onClick={() => {}} className="absolute right-2 top-2 text-sm text-semibold">
                                            <TrophyIcon className="size-3"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 w-1/2 p-4 text-neutral-400">
                                <div className="w-full flex flex-row gap-2">
                                    <TrophyIcon className="size-5"/>
                                    <p className="text-sm font-semibold">2 eventos</p>
                                </div>
                                <div className="w-full flex flex-row gap-2">
                                    <CommunityIcon className="size-5"/>
                                    <p className="text-sm font-semibold">1234 membros</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
                <div className="w-full flex flex-row gap-4 mt-4">
                    <Container className="w-1/2 grid grid-cols-2 gap-4 rounded-2xl" padding="p-4">
                        <Image
                            src="/imgs/drift.jpg"
                            alt="Foto de perfil"
                            width={100}
                            height={100}
                            unoptimized
                            className="w-full aspect-[1/1] object-cover rounded-2xl"
                        />
                        <Image
                            src="/imgs/drift.jpg"
                            alt="Foto de perfil"
                            width={100}
                            height={100}
                            unoptimized
                            className="w-full aspect-[1/1] object-cover rounded-2xl"
                        />
                        <Image
                            src="/imgs/drift.jpg"
                            alt="Foto de perfil"
                            width={100}
                            height={100}
                            unoptimized
                            className="w-full aspect-[1/1] object-cover rounded-2xl"
                        />
                        <Image
                            src="/imgs/drift.jpg"
                            alt="Foto de perfil"
                            width={100}
                            height={100}
                            unoptimized
                            className="w-full aspect-[1/1] object-cover rounded-2xl"
                        />
                        <div className="w-full cols-span-2 text-sm text-neutral-400 justify-center">ver mais</div>
                    </Container>
                    <div className="w-1/2 flex flex-col sm:flex-row gap-4">

                        <Container className="w-full sm:w-1/2 rounded-2xl" padding="p-0">
                            <h1 className="text-lg font-semibold p-4">Tópicos</h1>
                            {topics.map((topic) => (
                                
                                <div className="flex flex-row gap-2 p-4 text-xs justify-between items-center rounded-2xl hover:bg-neutral-950 transition duration-300 ease-in-out cursor-pointer" key={topic.id}>
                                    <div className="flex flex-row gap-2 items-center">
                                        <Image
                                            src={topic.image ?? '/imgs/placeholder.png'}
                                            alt="Foto de perfil"
                                            width={100}
                                            height={100}
                                            unoptimized
                                            className="w-[30px] aspect-[1/1] object-cover rounded-full"
                                        />
                                        <p className="">{topic.title}</p>
                                    </div>
                                    <Button>

                                        <EllipsisVerticalIcon className="size-3" />
                                    </Button>
                                </div>
                            ))}
                        </Container>
                        <Container className="w-full sm:w-1/2 rounded-2xl" padding="p-0">
                            <h1 className="text-lg font-semibold p-4">Membros</h1>
                            <div className="grid grid-cols-2 gap-2 p-4">
                                {members.map((member) => (
                                    <CardUser user={member} key={member.id} />
                                ))}
                            </div>
                        </Container>
                    </div>
                    
                        
                </div>
            </div>


        </>
    )
}
