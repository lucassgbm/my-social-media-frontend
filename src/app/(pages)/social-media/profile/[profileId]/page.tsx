'use client';


import '@splidejs/react-splide/css';
import Image from "next/image";
import Link from "next/link";
import Container from "../../../../../../components/container";
import Card from "../../../../../../components/card";
import ColorButton from "../../../../../../components/color-button";
import PlusIcon from "../../../../../../components/icons/plus";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../layout";
import RingImage from "../../../../../../components/ring-image";
import MessageIcon from "../../../../../../components/icons/message";
import PencilSquareIcon from "../../../../../../components/icons/pencil-square";
import CameraIcon from '../../../../../../components/icons/camera';
import Modal from '../../../../../../components/modal';
import Button from '../../../../../../components/button';
import PhotoIcon from '../../../../../../components/icons/photo';
import AirPlaneIcon from '../../../../../../components/icons/airplane';
import Toaster from '../../../../../../components/toaster';
import LoadingSpinner from '../../../../../../components/loading-spinner';
import { get, postFormData } from '../../../../../api/services/request';
import { User } from 'next-auth';
import Skeleton from '../../../../../../components/skeleton';

interface UserPhoto {
    id: number;
    photo_path: string;
    created_at: string;
}

export default function Home(){

    useEffect(() => {
        getUserPhotos();
    },[]);

    const context = useContext(AppContext);
    const { myInfo } = context;
    const [tab, setTab] = useState("fotos");
    const [toaster, setToaster] = useState({ 
        show: false, 
        message: "", 
        status: "", 
        title: "" 
    });
    const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
    const [modalNewPhoto, setModalNewPhoto] = useState(false);
    const [newPhoto, setNewPhoto] = useState<{ photo_path: File | string | null }>({
        photo_path: null,
    });
    const [loadingSendPhoto, setLoadingSendPhoto] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        inputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setNewPhoto({ ...newPhoto, photo_path: file });

            // libera a URL anterior da memória
            if (preview) {
            URL.revokeObjectURL(preview);
            }

            const url = URL.createObjectURL(file);
            setPreview(url);

        }
    };

    async function getUserPhotos(){

        try{
            const response = await get("/social-media/user-photos");
            setUserPhotos(response.data);
        }catch(error: any)
        {
            setToaster({ show: true, message: "Erro ao carregar fotos", status: "error", title: "Fotos" });
        }
    }

    async function handlePhoto(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if(newPhoto.photo_path === null) {
            setToaster({ show: true, message: "Escolha uma foto", status: "error", title: "Nova Foto" });
            return;
        }

        setLoadingSendPhoto(true);
        const formData = new FormData();
        formData.append("photo_path", newPhoto.photo_path);
        formData.append("description", "");

        try{

            const response = await postFormData("/social-media/user-photos", formData);
            setToaster({ show: true, message: "Foto enviada com sucesso!", status: "success", title: "Nova Foto" });
            setNewPhoto({ photo_path: "" });
            getUserPhotos();
        }catch(error: any)
        {
            setToaster({ show: true, message: "Erro ao enviar foto: " + error.response.data.message, status: "error", title: "Nova Foto" });
        }

        setLoadingSendPhoto(false);
        setModalNewPhoto(false);
        setPreview(null);
    }

    const imageUser = myInfo?.photo ?? '/imgs/placeholder.png';

    return(
        <>

            <div className="col-span-full sm:col-span-8 gap-4">
                <Container className="h-full " padding="p-0">
                    {/* <div className="flex flex-col gap-4 mb-4 flex-wrap">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <p className="text-sm">
                                <span className="font-semibold text-neutral-400">
                                    <a href="/social-media">Home / </a> 
                                    
                                </span> Perfil
                            </p>
                            
                        </div>
                    </div> */}
                    <div className="w-full p-4">
                        <div className="flex flex-row gap-4 mb-4 items-center">
                            <RingImage>

                                <Image
                                    src={imageUser}
                                    alt="Capa do perfil"
                                    width={500}
                                    height={500}
                                    className="min-w-[70px] w-[200px] aspect-[1/1] object-cover rounded-full"
                                    unoptimized
                                />
                            </RingImage>
                            <div className="w-full flex flex-col justify-end">
                                
                                <div className="flex flex-row justify-between">
                                    <h1 className="text-2xl font-semibold mb-4">{myInfo?.name}</h1>
                                    <Link href="/social-media/profile/edit">
                                        <Button className="text-sm font-semibold">
                                            <div className="flex flex-row gap-2 items-center">
                                                <PencilSquareIcon className="size-4"/>

                                            </div>
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-sm mb-4">{myInfo?.autodescription}</p>
                                <div className="w-full flex flex-row gap-2 mb-4 items-center">

                                    <ColorButton className="rounded-md text-sm font-semibold h-[35px]">
                                        <div className="flex flex-row gap-2 items-center">
                                            Seguir

                                        </div>
                                    </ColorButton>
                                    <ColorButton className="rounded-md text-sm font-semibold h-[35px]">
                                        <div className="flex flex-row gap-2 items-center">
                                            <MessageIcon className="size-4"/>

                                        </div>
                                    </ColorButton>

                                </div>
                                <div className="w-[40%] flex flex-row gap-2">
                                    <Card className="w-full rounded-2xl">
                                        <span className="text-xs text-neutral-400 font-semibold">200 Amigos</span>
                                    </Card>
                                    <Card className="w-full rounded-2xl">
                                        <span className="text-xs text-neutral-400 font-semibold">10 Comunidades</span>
                                    </Card>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full flex flex-row pl-4 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex flex-row gap-2">
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-neutral-800 cursor-pointer font-semibold">Fotos</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Posts</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Amigos</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Comunidades</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4">
                        
                        <button onClick={() => setModalNewPhoto(true)}>
                            <Card className="flex w-full rounded-2xl aspect-[1/1] justify-center items-center hover:opacity-90 cursor-pointer" >
                                    <PlusIcon className="size-10"/>
                            </Card>
                        </button>
                        {userPhotos?.length !== 0 && userPhotos?.map((photo) => (
                            <div key={photo.id}>
                                <Image
                                    src={photo.photo_path ?? '/imgs/placeholder.png'}
                                    alt={`Foto do(a) ${myInfo?.name}`}
                                    width={500}
                                    height={500}
                                    className="w-full aspect-[1/1] object-cover rounded-2xl"
                                    unoptimized
                                />
                            </div>
                        ))}
                        {userPhotos?.length === 0 && (
                            <>
                                <Skeleton className="w-full aspect-[1/1] object-cover" rounded="2xl" />
                                <Skeleton className="w-full aspect-[1/1] object-cover" rounded="2xl" />
                                <Skeleton className="w-full aspect-[1/1] object-cover" rounded="2xl" />
                                <Skeleton className="w-full aspect-[1/1] object-cover" rounded="2xl" />
                            </>
                        )}
                    
                    </div>                    
                    
                </Container>
            </div>
            <Modal isOpen={modalNewPhoto} onClose={() => setModalNewPhoto(false)} title="Nova Foto">
                <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                {preview && (
                    <div className="w-full flex flex-col p-2 items-center">
                    <Image
                        src={preview}
                        className="w-full sm:w-[350px] h-[350px] object-cover"
                        alt="preview"
                        width={350}
                        height={350}
                    />
                    </div>
                )}
                <span className="text-sm mb-2">Adicionar</span>
                <div className="flex flex-row justify-between">

                    <div className="flex flex-row mb-2 gap-2">
                        <Button onClick={handleButtonClick}>
                            <PhotoIcon className="size-6 dark:text-white text-neutral-800" />
                        </Button>
                        <Button onClick={() => {}}>
                            <CameraIcon className="size-6 dark:text-white text-neutral-800" />
                        </Button>
                    </div>
                    {loadingSendPhoto && (
                    <div className="w-full flex flex-row p-2 justify-center">
                        <LoadingSpinner />
                    </div>
                    )}
                    <div className="flex flex-row items-center">
                        <ColorButton onClick={(e) => handlePhoto(e)}>
                            <AirPlaneIcon className="size-6 dark:text-white text-neutral-800" />
                        </ColorButton>
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