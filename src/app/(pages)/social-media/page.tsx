'use client';

import Image from "next/image";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InfoIcon from "../../../../components/icons/info";
import MoneyIcon from "../../../../components/icons/money";
import Feed from "../../../../components/feed";
import Container from "../../../../components/container";
import Modal from "../../../../components/modal";
import PhotoIcon from "../../../../components/icons/photo";
import Button from "../../../../components/button";
import AirPlaneIcon from "../../../../components/icons/airplane";
import Toaster from "../../../../components/toaster";
import { post, get, postFormData } from "../../../api/services/request";
import ListStories from "../../../../components/list-stories";
import Skeleton from "../../../../components/skeleton";
import { AppContext } from "./layout";
import RingImage from "../../../../components/ring-image";
import ColorButtom from "../../../../components/color-button";
import Card from "../../../../components/card";
import LoadingSpinner from "../../../../components/loading-spinner";
import CalendarIcon from "../../../../components/icons/calendar";
import PinIcon from "../../../../components/icons/pin";
import ClockIcon from "../../../../components/icons/clock";
import CommunityIcon from "../../../../components/icons/community";
import Sidebar from "../../../../components/sidebar";
import SidebarFooter from "../../../../components/sidebar-footer";
import UsersIcon from "../../../../components/icons/users";
import CardUser from "../../../../components/users/card-user";
import ShowMore from "../../../../components/show-more";
import CardEvent from "../../../../components/events/card-event";

interface NewPost {
  description: string;
  photo_path: File | "";
}

interface EventCommunity {
  title: string;
  description: string;
  photo?: string | null;
  date_start: string;
  date_end: string;
  time_start: string;
  time_end: string;
  local: string;
  link?: string;
}

interface Communities {
  Community: [];
}

interface Community {
  id: number;
  name: string;
  description: string;
  photo?: string | null;
}

export default function Home() {

  useEffect(() => {
    getFeed();
    getEvent();
    getCommunities();
  }, []);

  const [modalNewPost, setModalNewPost] = useState(false);
  const [toaster, setToaster] = useState({
    show: false,
    message: "",
    title: "",
    status: '',
  });
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingSendPost, setLoadingSendPost] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<NewPost>({
    description: "",
    photo_path: "",
  });
  const [feed, setFeed] = useState([]);
  const [communities, setCommunities] = useState<Communities | null>(null);
  const [event, setEvent] = useState<EventCommunity | null>(null);
  const context = useContext(AppContext);
  const { myInfo } = context;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const router = useRouter(); 

  const sugestedFriends = [
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

  const sugestedEvents = [
    {
        id: 1,
        title: "Megadrift",
        description: "Descrição do evento 1",
        location: "Local do evento 1",
        date: "01/10/2026",
        time: "10:00",
        image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: 2,
        title: "Evento 2",
        description: "Descrição do evento 2",
        location: "Local do evento 2",
        date: "01/10/2026",
        time: "10:00",
        image: "https://plus.unsplash.com/premium_photo-1664304752635-3e0d8d8185e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D"
    }]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setNewPost({ ...newPost, photo_path: file });

      // libera a URL anterior da memória
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const url = URL.createObjectURL(file);
      setPreview(url);

    }
  };

  async function handlePost(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    if (newPost.description === "") {
      setToaster({ show: true, message: "Preencha a descrição", status: "error", title: "Criar Post" });
      return;
    }

    setLoadingSendPost(true);
    const formData = new FormData();
    formData.append("photo_path", newPost.photo_path);
    formData.append("description", newPost.description);

    try {

      const response = await postFormData("/social-media/post", formData);
      setToaster({ show: true, message: "Post criado com sucesso!", status: "success", title: "Criar Post" });
      setNewPost({ description: "", photo_path: "" });
      setModalNewPost(false);
      setPreview(null);
      getFeed();

    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao criar post: " + error.response.data.message, status: 'error', title: "Criar Post"});

    }

    setLoadingSendPost(false);
  }

  async function getFeed() {

    setLoadingFeed(true);
    try {
      const response = await get("/social-media/feed");
      setFeed(response.data);
    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao carregar feed", status: 'error', title: "Feed"});
    }
    setLoadingFeed(false);
  }

  async function getEvent() {

    try {
      const response = await get("/social-media/community-event/random-event");
      setEvent(response.data);
    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao carregar Evento", status: 'error', title: "Evento"});
    }
  }

  async function getCommunities() {

    try {
      const response = await get("/social-media/community?page=1");
      setCommunities(response.data);
    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao carregar Comunidades", status: 'error', title: "Comunidades"});
    }
  }

  return (
    <>
      <Sidebar />
      <div className="col-span-full sm:col-span-9 gap-6">

        <ListStories />
          <div className="flex flex-row gap-6">
            <div className="w-full sm:w-5/7 h-full rounded-2xl mb-4">
              <Container className="flex flex-row gap-2 mb-4 items-center rounded-md">
                {myInfo && (

                  <>
                    <RingImage>

                      <Image
                        src={ myInfo.photo ?? '/imgs/placeholder.png'}
                        alt="Foto de perfil"
                        className="rounded-full w-[50px] aspect-[1/1]"
                        width={50}
                        height={50}
                      />
                    </RingImage>

                    <div className="flex flex-row bg-neutral-100 dark:bg-neutral-800 dark:text-white w-full rounded-full pl-4 pr-4">
                      <div
                        className="w-full hover:text-border-0 ml-2 focus:outline-none p-4 rounded-full bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 cursor-pointer"
                        onClick={() => setModalNewPost(true)}
                      >Como você está se sentindo hoje?
                      </div>
                    </div>
                  </>
                )}
                {!myInfo && (
                  <div className="w-full flex flex-row ">

                    <div className="w-full flex flex-row gap-2 items-center">
                      <Skeleton height={"h-[50px]"} width={"w-[50px]"} rounded="full" className="aspect-[1/1]" />
                      <Skeleton rounded="full" height={"h-[55px]"} width={"w-full"} />
                    </div>
                  </div>
                )}


              </Container>

              {loadingFeed && (
                <>
                  <Container className="mb-4">
                    <div className="w-full flex flex-row gap-4 items-center mb-4">
                      <div className="w-[50px] flex flex-col">
                        <Skeleton rounded="full" height={"h-[50px]"} width={"w-[50px]"} />

                      </div>
                      <div className="flex flex-col">
                        <Skeleton rounded="sm" height={"h-[20px]"} width={"w-[100px]"} className="mb-2" />
                        <Skeleton rounded="sm" height={"h-[20px]"} width={"w-[150px]"} />
                      </div>
                    </div>
                    <div className="w-full flex flex-row gap-4 items-center mb-4">
                      <Skeleton rounded="sm" height={"h-[40px]"} width={"w-full"} />
                    </div>
                    <div className="w-full flex flex-row gap-4 items-center mb-4">
                      <Skeleton rounded="sm" height={"h-[30px]"} width={"w-[45px]"} />
                      <Skeleton rounded="sm" height={"h-[30px]"} width={"w-[45px]"} />
                    </div>
                  </Container>
                </>
              )}
              <Feed feed={feed} />

            </div>
            <div className="hidden sm:block relative w-2/7">
                {/* {event && (
                  <Container className="mb-4 rounded-md">
                  
                    <div className="flex flex-row justify-between">

                      <label className="text-sm font-semibold mb-4 ">Próximo Evento</label>
                      <CalendarIcon />
                    </div>

                    <CardEvent event={event} />
                  </Container>
                )} */}

                {event?.length === 0 && (
                  <Container className="mb-4 rounded-md">
                    <div className="flex flex-row justify-between">

                      <label className="text-sm font-semibold mb-4 ">Próximo Evento</label>
                      <CalendarIcon />
                    </div>

                    <Card className="flex flex-col justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl cursor-pointer hover:shadow-md">
                      <div className="flex flex-col sm:flex-row mb-4 items-center">
                        
                        <h2 className="text-md font-semibold">Nenhum evento próximo</h2>
                      </div>
                      <div className="p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <PinIcon className="size-3 text-red-500"/>
                          <span className="font-semibold text-xs"></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CalendarIcon className="size-3 text-orange-500"/>
                        </div>
                        
                        
                      </div>
                      <div className="flex flex-row justify-center gap-2 mt-4">

                        <Button>
                          <InfoIcon />
                        </Button>

                        {event?.link && (

                          <Button>
                            <MoneyIcon />
                          </Button>

                        )}

                      </div>

                    </Card>
                  </Container>
                )}

                {!event && (
                  <Container className="mb-4 rounded-md">
                    <div className="flex flex-row justify-center">

                      <Skeleton rounded="md" height="h-[25px]" width="w-[100px]" />
                    </div>
                    <div className="flex flex-col h-full mt-2">
                      <div className="flex flex-col sm:flex-row items-center mb-4 gap-4">

                        <Skeleton rounded="md" height="h-[70px]" width="w-[70px]" />
                        <Skeleton rounded="md" height="h-[25px]" width="w-[90px]" />

                      </div>
                      <Skeleton rounded="2xl" height="h-[60px]" width="w-[full]" />

                      <div className="flex flex-row justify-center gap-2 mt-4">

                        <Skeleton rounded="full" height="h-[35px]" width="w-[35px]" />

                        <Skeleton rounded="full" height="h-[35px]" width="w-[35px]" />

                      </div>

                    </div>
                  
                  </Container>
                )}

              <Container className="mb-4 rounded-md">
                <div className="flex flex-row justify-between mb-4">
                  <label className="text-sm font-semibold">Eventos sugeridos</label>
                  <CalendarIcon />
                </div>
                <div className="flex flex-col gap-4">
                  {sugestedEvents.map((event) => (
                    
                    <CardEvent event={event} key={event.id} />
                  ))}
                </div>
                
                <ShowMore onClick={() => router.push('/social-media/events')} />

              </Container>
              <Container className="mb-4 rounded-md">
                  <div className="flex flex-row justify-between">
                    <label className="text-sm font-semibold">Conecte com outras pessoas</label>
                    <UsersIcon className="size-5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                      {sugestedFriends.map((friend) => (
                          <CardUser user={friend} key={friend.id} />
                      ))}
                  </div>
                  <ShowMore onClick={() => router.push('/social-media/events')} />

              </Container>
              <Container className="mb-4 rounded-md">
                  <div className="flex flex-row justify-between">
                    <label className="text-sm font-semibold">Comunidades</label>
                    <CommunityIcon className="size-5" />
                  </div>
                  {!communities && (
                    <>
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                    </>
                  )}

                  {communities && (

                    communities.map((community: Community, index: number) => {
                      
                      return (
                        
                        <Card className="flex flex-col justify-center  mt-4 bg-neutral-100 dark:bg-neutral-800 border-1 border-neutral-400/30 rounded-xl cursor-pointer hover:shadow-md" key={index}>
                          <div className="flex flex-row items-center rounded-sm mb-2">
                            <Image
                              src={community.photo ?? "/imgs/placeholder.png"}
                              alt="Foto de perfil"
                              className="rounded-full w-[40px] aspect-[1/1] mr-2 hover:opacity-90 object-cover"
                              width={110}
                              height={110}
                              priority
                            />
                            <div className="flex flex-col text-left">
                              <label className="text-xs font-semibold">{community.name}</label>
                              <p className="text-xs font-normal w-full" 

                              >
                                {community.description && community.description.length > 30
                                ? community.description.slice(0, 30) + "..."
                                : community.description}
                                {/* {community.description} */}
                              </p>
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center border-t-1 border-gray-200 dark:border-gray-800 p-1">
                            <Image
                              src="/imgs/bmw.jpg"
                              alt="Foto de perfil"
                              className="rounded-full w-[20px] mr-2 hover:opacity-90"
                              width={20}
                              height={20}
                              priority
                            />
                            <Image
                              src="/imgs/bmw.jpg"
                              alt="Foto de perfil"
                              className="rounded-full w-[20px] ml-[-16px] hover:opacity-90"
                              width={20}
                              height={20}
                              priority
                            />
                            <label className="text-xs font-semibold ml-auto">243 join</label>
                          </div>
                        </Card>
                      

                      );

                    } 
                  ))}
                  <ShowMore onClick={() => router.push('/social-media/communities')} />
              </Container>
              <SidebarFooter />
            </div>
          </div>

      </div>

      <Modal
        isOpen={modalNewPost}
        onClose={() => {
          setModalNewPost(false);
          setPreview(null);
        }}
        title="Novo post"
      >
        
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={ myInfo?.photo ?? '/imgs/placeholder.png'}
            alt="Foto de perfil"
            className="rounded-full w-[40px] aspect-[1/1]"
            width={40}
            height={40}
            unoptimized
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm">{myInfo?.name}</label>
            <select className="bg-neutral-200 dark:bg-neutral-600 text-white rounded-2xl text-xs p-1">
              <option>Privado</option>
              <option>Publico</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row dark:text-white w-full py-4 rounded-full gap-2 mb-2">
          <input
            type="text"
            placeholder="Como você está se sentindo hoje?"
            className="w-full hover:text-border-0 focus:outline-none rounded-full dark:text-white text-neutral-800"
            onChange={(e) => {
              setNewPost({ ...newPost, description: e.target.value });
              setToaster({ ...toaster, show: false });
            }}
          />

        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {preview && (
          <div className="w-full flex flex-col items-center h-[250px] overflow-y-scroll">
            <Image
              src={preview}
              className="w-full h-[350px] object-cover"
              alt="preview"
              width={350}
              height={350}
            />
          </div>
        )}
        <span className="text-sm mb-2">Adicionar ao post</span>
        <div className="flex flex-row mb-2 gap-2">
          <Button onClick={handleButtonClick}>
            <PhotoIcon className="size-6 dark:text-white text-neutral-800" />
          </Button>
          <Button onClick={() => {}}>
            <PinIcon className="size-6 dark:text-white text-neutral-800" />
          </Button>
        </div>
        <div className="flex flex-row justify-end">
          {loadingSendPost && (
            <div className="w-full flex flex-row p-2 justify-center">
              <LoadingSpinner />
            </div>
          )}
          <ColorButtom onClick={(e) => handlePost(e)}>
            <AirPlaneIcon className="size-6 dark:text-white text-neutral-800" />
          </ColorButtom>
        </div>
      </Modal>
      {toaster.show && (
        <Toaster
          toaster={toaster}
          setToaster={setToaster}
        />
      )}


    </>
  );
}
