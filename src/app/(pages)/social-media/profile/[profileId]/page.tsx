'use client';

import '@splidejs/react-splide/css';
import Image from "next/image";
import Link from "next/link";
import Container from "../../../../../../components/container";
import { Splide, SplideSlide } from '@splidejs/react-splide';
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
import ProfileIcon from '../../../../../../components/icons/profile';
import EllipsisVerticalIcon from '../../../../../../components/icons/ellipsis';
import HeartIcon from '../../../../../../components/icons/heart';
import '@splidejs/react-splide/css';
import PinIcon from '../../../../../../components/icons/pin';
import UsersIcon from '../../../../../../components/icons/users';

interface UserPhoto {
    id: number;
    photo_path: string;
    created_at: string;
}

interface Likes {
  count: number;
}

interface Comments {
  count: number;
}

interface Post {
  id: number;
  description: string;
  photo_path?: string | null;
  created_at: string;
  user: User;
  likes: Likes;
  comments: Comments;
}

interface Posts {
  feed: Post[];
}

export default function Home(){

    useEffect(() => {
        getUserPhotos();
        getUserPosts();
    },[]);

    const context = useContext(AppContext);
    const { myInfo } = context;
    // const [tab, setTab] = useState("fotos");

    const [userPosts, setUserPosts] = useState<Posts | []>([]);

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

    const sugestedUsers = [
        {
            id: 1,
            name: "João",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "Rio de Janeiro - RJ"
        },
        {
            id: 2,
            name: "Maria",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "São Paulo - SP"
        },
        {
            id: 3,
            name: "Pedro",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "Curitiba - PR"
        },
        {
            id: 4,
            name: "Ana",
            photo_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
            location: "Belo Horizonte - MG"
        },
    ]

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

    async function getUserPosts() {
    
        // setLoadingFeed(true);
        try {
          const response = await get("/social-media/feed");
          console.log(response.data);
          setUserPosts(response.data);
        } catch (error: any) {
    
          setToaster({...toaster, show: true, message: "Erro ao carregar posts", status: 'error', title: "Posts"});
        }
        // setLoadingFeed(false);
    }

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

            <div className="col-span-full sm:col-span-7 gap-4">
                <Container className="h-full " padding="p-0">
                    
                    <div className="relative w-full p-4 border-b border-neutral-200 dark:border-neutral-800">
                        <Image 
                            src="/imgs/cover-profile.jpg"
                            alt="Capa do perfil"
                            width={500}
                            height={500}
                            className="absolute inset-0 w-full h-[200px] object-cover z-40"
                            unoptimized 
                        />
                        <div className="flex flex-row justify-end items-start h-[80px]">
                            <Button className="text-sm font-semibold z-50">
                                <div className="flex flex-row gap-2 items-center">
                                    <PencilSquareIcon className="size-4"/>

                                </div>
                            </Button>
                        </div>
                        <div className="relative w-full h-full flex flex-col gap-4 mb-4 z-50">
                            <RingImage className='w-[200px]'>

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
                                    <div className="flex flex-col mb-4">
                                        <h1 className="text-2xl font-semibold">{myInfo?.name}</h1>
                                        <div className="flex flex-row gap-2 items-center">
                                            <PinIcon className="size-3"/>
                                            <p className="text-sm text-gray-400">Brasília - DF</p>
                                        </div>
                                    </div>

                                    <Link href="/social-media/profile/edit">
                                        <Button className="text-sm font-semibold">
                                            <div className="flex flex-row gap-2 items-center">
                                                <PencilSquareIcon className="size-4"/>

                                            </div>
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-sm mb-4 text-gray-400">{myInfo?.autodescription}</p>
                                <div className="w-full flex flex-row gap-2 mb-4 items-center">

                                    <ColorButton className="rounded-full text-sm font-semibold h-[35px] w-[100px] items-center">
                                        <div className="flex flex-row gap-2 justify-center items-center">
                                            <ProfileIcon className="size-4"/>
                                            Seguir

                                        </div>
                                    </ColorButton>
                                    <ColorButton className="rounded-full text-sm font-semibold h-[35px] w-[140px] items-center">
                                        <div className="flex flex-row gap-2 justify-center items-center">
                                            <MessageIcon className="size-4"/>
                                            Mensagem
                                        </div>
                                    </ColorButton>
                                    <ColorButton className="rounded-full text-sm font-semibold h-[35px] aspect-square items-center">
                                        <div className="flex flex-row gap-2 justify-center items-center">
                                            <EllipsisVerticalIcon className="size-5"/>
                                            
                                        </div>
                                    </ColorButton>

                                </div>
                                <div className="flex flex-row gap-2">
                                    <p className="text-sm font-semibold text-neutral-400">2.000 Seguidores</p>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    <div className='w-full flex flex-row p-4'>
                        <div className="flex rounded-2xl  justify-center items-center hover:opacity-90" >
                            <button onClick={() => setModalNewPhoto(true)} className="flex flex-row gap-2 rounded-full border-1 border-neutral-800 items-center justify-center p-4 cursor-pointer">
                                <PlusIcon className="size-6"/>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800">
                        
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
                    <div className="p-4">
                        <h1 className="text-2xl font-semibold mb-4">Posts</h1>
                    </div>
                    <div className="grid grid-cols-1 p-4 gap-4">
                        <Splide
                            options={{
                                type: 'loop',
                                perPage: 2,
                                breakpoints: {
                                    640: {
                                        perPage: 1,
                                    },
                                    1024: {
                                        perPage: 2,
                                    },
                                },
                                gap: '1rem',
                                loop: true,
                                arrows: true,
                                autoplay: false
                            
                            }}
                            aria-label="My Favorite Images"
                        >
                            {userPosts && userPosts?.map((post) => {
                                
                                const imageUser = post.user.photo ?? '/imgs/placeholder.png';
                                
                                const imagePost = post.photo_path ?? null;
                                return (
                                    
                                    <SplideSlide className="flex flex-col border-1 border-neutral-200 dark:border-neutral-800 p-4 rounded-md" key={post.id}>

                                        <div className="flex flex-row gap-4 items-center mb-4">
                                            {imageUser && (
                                                <Image
                                                src={imageUser}
                                                alt="Foto de perfil"
                                                className="rounded-full aspect-[1/1]"
                                                width={50}
                                                height={50}
                                                unoptimized
                                                />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{post.user.name}</span>
                                                <span className="text-sm font-normal text-gray-400">{post.created_at}</span>
                                            </div>
                                        </div>
                        
                                        <p className="text-sm py-4">{post.description}</p>
                                        {imagePost && (
                                            <Image
                                            src={imagePost}
                                            alt="Imagem do Post"
                                            className="w-full rounded"
                                            width={500}
                                            height={500}
                                            unoptimized
                                            />
                                        )}
                        
                        
                                        <div className="w-full flex flex-row gap-4 items-center mt-4">
                                            <div className="flex flex-row gap-1 items-center">
                                                <HeartIcon />
                                                <span className="text-sm font-semibold">{post.likes.count}</span>
                                            </div>
                                            <div className="flex flex-row gap-1 items-center">
                                                <MessageIcon />
                                                <span className="text-sm font-semibold">{post.comments.count}</span>
                                            </div>
                                        </div>
                                    </SplideSlide>
                                )
                            })}
                        </Splide>
                        </div>
                            
                            
                    </Container>
            </div>
            <div className="col-span-full sm:col-span-3 gap-4">
                <Container className="h-full " padding="p-0">
                    <div className="flex flex-col p-4">
                        <h1 className="text-lg font-semibold mb-4">Siga outras pessoas</h1>
                        {sugestedUsers && sugestedUsers.map((user) => (
                            
                            <div className="w-full  flex flex-row gap-2 px-4 py-8 justify-between items-center" key={user.id}>
                                <div className="flex flex-row items-center">

                                    <Image
                                        src={user?.photo_path ?? '/imgs/placeholder.png'}
                                        alt="Foto de perfil"                            
                                        className="w-[60px] w-[60px] rounded-full aspect-[1/1]"
                                        width={50}
                                        height={50}
                                        unoptimized
                                    />
                                    <div className="flex flex-col ml-2">
                                        <span className="text-sm font-semibold">{user?.name}</span>
                                        <p className="text-xs font-normal text-gray-400">{user?.location}</p>
                                    </div>
                                </div>
                                <Button onClick={() => setModalNewPhoto(true)} className="text-sm text-semibold">
                                    <div className="flex flex-row items-center">
                                        <UsersIcon className="size-4" /><span>+</span>
                                    </div>
                                </Button>
                            </div>
                        ))}

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