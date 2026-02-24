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

export default function Home(){
    
    const [loading, setLoading] = useState(false);

    const topics = [
        {
            id: 1,
            title: "Descrição do tópico 1",
        },
        {
            id: 2,
            title: "Descrição do tópico 2",
        },
        {
            id: 3,
            title: "Descrição do tópico 3",
        },
        {
            id: 4,
            title: "Descrição do tópico 4",
        }
    ]
    return(
        <>
            <div className="sticky top-0 h-[600px] hidden sm:grid sm:col-span-2 gap-4">

                <Container className="rounded-lg">
                    <Image
                        src="/imgs/drift.jpg"
                        alt="Logo"
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full aspect-[1/1] object-cover rounded-lg"
                    />
                </Container>
            </div>
            <div className="col-span-full sm:col-span-8 flex flex-col">

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
                            <h1 className="text-2xl font-semibold">Nome da comunidade</h1>
                            <p className="text-gray-600">Descrição da comunidade</p>
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
                        <div className="w-full cols-span-2 justify-center">ver mais</div>
                    </Container>
                    <Container className="w-1/2 rounded-2xl" padding="p-0">
                        <h1 className="text-lg font-semibold p-4">Tópicos</h1>
                        {topics.map((topic) => (
                            
                            <div className="flex flex-row gap-2 p-4 text-xs justify-between items-center" key={topic.id}>
                                <p className="">{topic.title}</p>
                                <Button>

                                    <EllipsisVerticalIcon className="size-3" />
                                </Button>
                            </div>
                        ))}
                    </Container>
                    
                        
                </div>
            </div>


        </>
    )
}
