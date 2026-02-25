'use client';
import Image from "next/image";
import Container from "../../../../../components/container";
import Button from "../../../../../components/button";
import CloseIcon from "../../../../../components/icons/close";
import PlusIcon from "../../../../../components/icons/plus";
import ListCommunities from "../../../../../components/communities/list-communities";
import FilterIcon from "../../../../../components/icons/filter";
import { useEffect, useState } from "react";
import Modal from "../../../../../components/modal";
import FormButtom from "../../../../../components/form-buttom";
import LoadingSpinner from "../../../../../components/loading-spinner";
import ArrowLeftIcon from "../../../../../components/icons/arrow-left";
import ArrowRightIcon from "../../../../../components/icons/arrow-right";
import ColorButton from "../../../../../components/color-button";
import Toaster from "../../../../../components/toaster";
import { get } from "@/api/services/request";
import Skeleton from "../../../../../components/skeleton";
import Sidebar from "../../../../../components/sidebar";
import BorderButton from "../../../../../components/border-button";
import EllipsisVerticalIcon from "../../../../../components/icons/ellipsis";
import SearchIcon from "../../../../../components/icons/search";
import Link from "next/link";

export default function Home(){
    useEffect(() => {
        getCommunities();
    }, []);
    const [modalNewCommunity, setModalNewCommunity] = useState(false);
    const [loading, setLoading] = useState(false);
    const [communities, setCommunities] = useState<any[]>([]);
    const [toaster, setToaster] = useState({
    show: false,
    message: "",
    });

    async function getCommunities(){
        setLoading(true);
        try {
            const response = await get("/social-media/community");
            setCommunities(response.data);
        } catch (error: any) {
    
            setToaster({ show: true, message: "Erro ao carregar comunidades" });
        }
        setLoading(false);
    }

    const sugestedCommunities = [
        {
            id: 1,
            name: "Comunity 1",
            photo_path: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Fycm9zfGVufDB8fDB8fHww",
            location: "Rio de Janeiro - RJ",
            description: "Descricão da comunidade"
        },
        {
            id: 2,
            name: "Comunity 2",
            photo_path: "https://media.istockphoto.com/id/2214123161/pt/foto/happy-family-preparing-for-a-summer-vacation-on-a-beachside-road.webp?a=1&b=1&s=612x612&w=0&k=20&c=h3fPxOURGHgHdueoaC4b6q34iLPySTvfL4UQeFOlkV4=",
            location: "São Paulo - SP",
            description: "Descricão da comunidade"
        },{
            id: 3,
            name: "Comunity 3",
            photo_path: "https://images.unsplash.com/photo-1567818668259-e66acac21610?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fGNhcnJvc3xlbnwwfHwwfHx8MA%3D%3D",
            location: "Brasília - DF",
            description: "Descricão da comunidade"
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

                                <h1 className="text-2xl font-semibold mb-4">Comunidades</h1>
                            </div>
                            <div className="flex flex-col gap-2">

                                <div className="w-full flex flex-row gap-2 justify-end">

                                    <BorderButton
                                        onClick={() => setModalNewCommunity(true)}
                                    >
                                        
                                        Criar comunidade
                                    </BorderButton>
                                    <ColorButton
                                        onClick={() => setModalNewCommunity(true)}
                                    >
                                        <SearchIcon className="size-5" />
                                    </ColorButton>
                                    
                                </div>
                                <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-2">

                                    <div className="flex flex-row items-center bg-neutral-800 hover:bg-neutral-900 text-xs font-semibold py-2 px-2 pl-2 pr-2 rounded-md cursor-pointer gap-2">
                                        Automobilismo
                                        <CloseIcon className="size-3" />
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        {loading && (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">

                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>
                                <Skeleton width={"w-full"} rounded="3xl" className="aspect-[16/9]"/>

                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                            {communities && (
                                
                                <ListCommunities 
                                    communities={communities} 
                                />
                                
                            )}
                        </div>
                    </div>
                </Container>
                <Container className="w-full sm:w-[30%] rounded-2xl" padding="p-4">
                    <h1 className="text-lg font-semibold mb-4">Comunidades sugeridas</h1>
                    {sugestedCommunities && sugestedCommunities.map((community) => (
                            
                        <Link href={`/social-media/profile/${community?.name}`} key={community.id}>
                            <div className="relative w-full flex flex-row gap-2 mb-2 overflow-hidden group justify-between items-center border-1 border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <div className="flex flex-col items-center">

                                    <Image
                                        src={community?.photo_path ?? '/imgs/placeholder.png'}
                                        alt="Foto de perfil"                            
                                        className="w-full rounded-xl object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                                        width={50}
                                        height={50}
                                        unoptimized
                                    />
                                    <div className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-xl p-4">
                                        <span className="text-sm font-semibold">{community?.name}</span>
                                        <p className="w-full flex text-xs font-normal text-gray-300 text-wrap">{community?.description}</p>
                                        <p className="text-xs font-normal text-gray-400">{community?.location}</p>

                                    </div>
                                </div>
                                <Button onClick={() => setModalNewPhoto(true)} className="absolute right-2 top-2 text-sm text-semibold">
                                    <EllipsisVerticalIcon className="size-3"/>
                                </Button>
                            </div>
                        </Link>
                    ))}
                </Container>

            </div>
            <Modal 
                isOpen={modalNewCommunity} 
                onClose={() => {
                setModalNewCommunity(false);
                }} 
                title="Nova comunidade"
                width="sm:w-[800px]"
            >
                <div className="w-full flex flex-row gap-4">
                    <div className="w-[40%] flex flex-col gap-4 items-center justify-center">
                        <Image
                            src="/imgs/bmw.jpg"
                            alt="Foto de perfil"
                            className="rounded-2xl w-[200px] mr-2 hover:opacity-90"
                            width={200}
                            height={200}
                            priority
                        />
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={() => {}}
                        />

                    </div>
                    <div className="w-[60%] flex flex-col gap-4">
                        <div className="w-full flex flex-col">
                            <label className="font-semibold text-xs mb-2">Nome</label>
                            <input className="w-full text-sm text-gray-700 dark:text-white p-3 bg-white dark:bg-neutral-800 focus:outline-neutral-400 rounded-sm" type="text" placeholder="Digite o nome da comunidade"></input>
                        </div>
                        <div className="w-full flex flex-col">
                            <label className="font-semibold text-xs mb-2">Categoria</label>
                            <select className="w-full text-sm text-gray-700 dark:text-white p-3 bg-white dark:bg-neutral-800 focus:outline-neutral-400 rounded-sm">
                                <option value="">Selecione</option>
                                <option value="1">Automobilismo</option>
                                <option value="2">Programação</option>
                                <option value="3">Games</option>
                                <option value="4">Música</option>
                                <option value="5">Filmes</option>
                            </select>
                        </div>

                        <div className="w-full flex flex-col">
                            <label className="font-semibold text-xs mb-2">Descrição</label>
                            <textarea className="w-full text-sm text-gray-700 dark:text-white p-3 bg-white dark:bg-neutral-800 focus:outline-neutral-400 rounded-sm cols-1 rows-4" placeholder="Digite uma descrição"></textarea>

                        </div>
                        <div className="w-full flex flex-col items-center">
                            <div className="flex flex-row gap-2 items-center">

                                <FormButtom label="Criar" type="submit" onClick={() => alert('Criar comunidade')}/>
                                
                                {loading && <LoadingSpinner />}
                            </div>

                        </div>
                    </div>
                </div>
            </Modal>
            
            {toaster.show && (
            <Toaster
                toaster={toaster}
                setToaster={setToaster}
            />
            )}
        </>
    )
}
