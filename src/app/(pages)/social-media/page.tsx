'use client';

import Image from "next/image";

import React, { useContext, useEffect, useRef, useState } from "react";
import EllipsisVerticalIcon from "../../../../components/icons/ellipsis";
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
import Link from "next/link";

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
      const response = await get("/social-media/community-event/2");
      setEvent(response.data);
    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao carregar Evento", status: 'error', title: "Evento"});
    }
  }

  async function getCommunities() {

    try {
      const response = await get("/social-media/community?page=1");
      setCommunities(response.data.data);
    } catch (error: any) {

      setToaster({...toaster, show: true, message: "Erro ao carregar Comunidades", status: 'error', title: "Comunidades"});
    }
  }

  return (
    <>

      <div className="col-span-full sm:col-span-8 gap-6">

        <ListStories />
          <div className="flex flex-row gap-6">
            <div className="w-full sm:w-[3/5] h-full rounded-2xl mb-4">
              <Container className="flex flex-row gap-2 mb-4 items-center rounded-2xl">
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
            <div className="hidden sm:block w-[2/5]">
              <Container className="mb-4 rounded-2xl">
                {event && (
                  <>
                    <div className="flex flex-row justify-between">

                      <label className="text-sm font-semibold mb-4 ">Próximo Evento</label>
                      <CalendarIcon />
                    </div>

                    <Card className="flex flex-col justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl cursor-pointer hover:shadow-md">
                      <div className="flex flex-col sm:flex-row mb-4 items-center">
                        <Image
                          src={'/imgs/placeholder.png'}
                          alt="Foto de perfil"
                          className="rounded-md w-[60px] aspect-[1/1] mr-4 hover:opacity-90 object-cover"
                          width={70}
                          height={70}
                          loading="lazy"
                        />
                        <h2 className="text-md font-semibold">{event?.title}</h2>
                      </div>
                      <div className="p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <PinIcon className="size-3 text-red-500"/>
                          <span className="font-semibold text-xs">{event?.local}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CalendarIcon className="size-3 text-orange-500"/>
                          <span className="text-xs">{`${event?.date_start}`}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <ClockIcon className="size-3 text-orange-500"/>
                          <span className="text-xs">{`${event.time_start} às ${event.time_end}`}</span>
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
                  </>
                )}

                {!event && (
                  <>
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
                  </>
                )}
              </Container>

              <Container className="mb-4 rounded-2xl">
                <div className="flex flex-row justify-between">
                  <label className="text-sm font-semibold">Eventos sugeridos</label>
                  <CalendarIcon />
                </div>
                <Card className="flex flex-col justify-center mt-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl cursor-pointer hover:shadow-md">
                  <div className="flex flex-row items-center rounded-sm ">
                    <Image
                      src={"/imgs/placeholder.png"}
                      alt="Foto de perfil"
                      className="rounded-md w-[40px] aspect-[1/1] mr-2 hover:opacity-90 object-cover"
                      width={110}
                      height={110}
                      priority
                    />
                    <div className="flex flex-col text-left">
                      <label className="text-xs font-semibold">Nome evento</label>
                      <p className="text-xs font-normal w-full" 

                      >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      </p>
                      
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 text-xs">
                      <PinIcon className="size-3 text-red-500"/>
                      <span className="font-semibold text-xs">Pátio Brasil - Brasília</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CalendarIcon className="size-3 text-orange-500"/>
                      <span className="text-xs">16/10/2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <ClockIcon className="size-3 text-orange-500"/>
                      <span className="text-xs">às 20:00</span>
                    </div>

                  </div>
                
                </Card>
                <ColorButtom className="w-full mt-4 mb-2 rounded-md text-sm font-semibold">
                    Ver mais 
                  </ColorButtom>
              </Container>
              <Container className="mb-4 rounded-2xl">
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
                      const imageCommunity = community.photo
                      ? `${process.env.NEXT_PUBLIC_STORAGE_API?.replace(/\/$/, '')}/${community.photo?.replace(/^\//, '')}`
                      : null;

                      return (
                        
                        <Card className="flex flex-col justify-center  mt-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl cursor-pointer hover:shadow-md" key={index}>
                          <div className="flex flex-row items-center rounded-sm mb-2">
                            <Image
                              src={"/imgs/placeholder.png"}
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

                  <ColorButtom className="w-full mt-4 mb-2 rounded-md text-sm font-semibold">
                    Ver mais 
                  </ColorButtom>
 
              </Container>
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
            src={'/imgs/placeholder.png'}
            alt="Foto de perfil"
            className="rounded-full w-[40px] aspect-[1/1]"
            width={40}
            height={40}
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
