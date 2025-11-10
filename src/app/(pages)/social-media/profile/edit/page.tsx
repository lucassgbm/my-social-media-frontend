'use client';

// @ts-expect-error missing types
import { Splide, SplideSlide } from "@splidejs/react-splide";
import '@splidejs/react-splide/css';
import Image from "next/image";
import Container from "../../../../../../components/container";
import { useContext, useState } from "react";
import { AppContext } from "../../layout";
import RingImage from "../../../../../../components/ring-image";
import Input from "../../../../../../components/input";
import { get } from "@/api/services/request";

export default function Home(){
    const context = useContext(AppContext);
    const { myInfo } = context;
    const [tab, setTab] = useState("fotos");
    const [data, setData] = useState({
        name: "",
        email: "",
        birthdate: "",
        interest: [],
    });
    const [interestlist, setInterestlist] = useState([]);

    const imageUser = myInfo?.photo
    ? `${process.env.NEXT_PUBLIC_STORAGE_API?.replace(/\/$/, '')}/${myInfo.photo?.replace(/^\//, '')}`
    : null;

    async function getInterest(value :string){

        if(value.length > 3){

            try {
                const response = await get("/social-media/categories?category=" + value);
                setInterestlist(response.data);
            }catch (error: any) {
                console.log(error);
            }
        }
            
    }

    return(
        <>

            <div className="col-span-full sm:col-span-8 gap-4">
                <Container className="h-full " padding="p-0">
                    <div className="flex flex-col gap-4 mb-4 flex-wrap">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <p className="text-sm">
                                <span className="font-semibold text-neutral-400">
                                    <a href="/social-media">Home / </a> 
                                    
                                </span>
                                
                                <span className="font-semibold text-neutral-400">
                                    <a href={`/social-media/profile/${myInfo?.name}`}>Perfil / </a> 
                                    
                                </span> Editar Perfil
                            </p>
                            
                        </div>
                    </div>
                    <div className="w-full p-4">
                        <div className="flex flex-col gap-4 mb-4">
                            
                            <h1 className="text-2xl font-semibold mb-4">Editar perfil</h1>
                            <div className="flex flex-row justify-center">

                                <div className="w-full sm:w-[50%] flex flex-col">

                                    <div className="flex flex-row justify-center">

                                        <RingImage>

                                            <Image
                                                src={"/imgs/placeholder.png"}
                                                alt="Capa do perfil"
                                                width={500}
                                                height={500}
                                                className="w-[200px] aspect-[1/1] object-cover rounded-full"
                                            />
                                        </RingImage>
                                    </div>
                                    <div className="flex flex-col mb-2">
                                        <label className="font-semibold text-xs mb-2">Nome completo</label>

                                        <Input
                                            placeholder="Digite o seu nome"
                                            value={data.name}
                                            type="text"
                                            onChange={(e) => setData({ ...data, name: e.target.value })}
                                            name="name"
                                        />

                                    </div>

                                    <div className="flex flex-col mb-2">
                                        <label className="font-semibold text-xs mb-2">E-mail</label>

                                        <Input
                                            placeholder="Digite o seu e-mail"
                                            value={data.email}
                                            type="email"
                                            onChange={(e) => setData({...data, email: e.target.value})}
                                            name="email"
                                        />

                                    </div>

                                    <div className="flex flex-col mb-4">
                                        <label className="font-semibold text-xs mb-2">Data de aniversário</label>

                                        <Input
                                            placeholder="Digite sua data de nascimento"
                                            value={data.birthdate}
                                            type="date"
                                            onChange={(e) => setData({...data, birthdate: e.target.value})}
                                            name="birthdate"
                                        />

                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label className="font-semibold text-xs mb-2">Interesses</label>
                                        <div className="flex flex-row gap-2 flex-wrap mb-4">
                                            <span className="bg-neutral-700 w-[auto] text-xs font-normal py-1 px-2 rounded-full">Automobilismo</span>
                                            <span className="bg-neutral-700 w-[auto] text-xs font-normal py-1 px-2 rounded-full">Motociclismo</span>
                                            <span className="bg-neutral-700 w-[auto] text-xs font-normal py-1 px-2 rounded-full">Gastronomia</span>
                                            <span className="bg-neutral-700 w-[auto] text-xs font-normal py-1 px-2 rounded-full">Jogos eletrônicos</span>
                                            <span className="bg-neutral-700 w-[auto] text-xs font-normal py-1 px-2 rounded-full">Saúde</span>
                                            
                                        </div>
                                        

                                        <Input
                                            placeholder="Digite algum interesse"
                                            type="text"
                                            onChange={(e) => getInterest(e.target.value)}
                                            name="interest"
                                        />

                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label className="font-semibold text-xs mb-2">Autodescrição</label>
                                        <textarea 
                                            className="w-full text-sm text-gray-700 p-3 bg-white focus:outline-blue-400 rounded-sm" 
                                            name="" rows={5}  
                                            placeholder="Como você se autodescreve?"
                                            onChange={(e) => setData({...data, autodescription: e.target.value})}
                                        />
                                    </div>
                                        
                                </div>
                            </div>
                        </div>

                    </div>
                                    
                    
                </Container>
            </div>
                
        </>
    )
}