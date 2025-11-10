'use client';
import Image from "next/image";
import Container from "../../../../../components/container";
import Button from "../../../../../components/button";
import CloseIcon from "../../../../../components/icons/close";
import CheckIcon from "../../../../../components/icons/check";
import SearchIcon from "../../../../../components/icons/search";
import PlusIcon from "../../../../../components/icons/plus";
import ListCommunities from "../../../../../components/communities/list-communities";
import Card from "../../../../../components/card";
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
            setCommunities(response.data.data);
        } catch (error: any) {
    
            setToaster({ show: true, message: "Erro ao carregar comunidades" });
        }
        setLoading(false);
    }
    return(
        <>
        
            <div className="col-span-full sm:col-span-8 gap-4">
                <Container className="h-full " padding="p-0">

                    <div className="flex flex-col gap-4 mb-4 flex-wrap">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <div>

                                <h1 className="text-2xl font-semibold mb-4">Comunidades</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">

                                <div className="flex flex-row gap-2">

                                    <ColorButton
                                        onClick={() => setModalNewCommunity(true)}
                                    >
                                        <PlusIcon />
                                    </ColorButton>
                                    <Button>
                                        <FilterIcon />
                                    </Button>
                                </div>
                                <div className="w-full flex flex-col sm:flex-row items-center gap-2">

                                    <div className="flex flex-row items-center bg-neutral-800 hover:bg-neutral-900 text-xs font-semibold py-1 px-1 pl-2 pr-2 rounded-2xl cursor-pointer gap-2">
                                        Automobilismo
                                        <CloseIcon className="size-3" />
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <Button>

                                        <ArrowLeftIcon/>
                                    </Button>
                                    <Button>

                                        <ArrowRightIcon/>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {loading && (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">

                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>
                                <Skeleton height={"h-[420px]"} width={"w-full"} rounded="3xl"/>

                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">

                            {communities && (

                                <ListCommunities communities={communities}/>
                            )}
                        </div>
                    </div>
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
