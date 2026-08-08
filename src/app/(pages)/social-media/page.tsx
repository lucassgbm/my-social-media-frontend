'use client';

import Image from "../../../../components/remote-image";

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
import { suggestedFriends, suggestedEvents } from "../../../../mocks/suggestions";
import { useToaster } from "../../../../providers/toaster-provider";

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
  const { showToast } = useToaster();


  useEffect(() => {
    getFeed();
    getEvent();
    getCommunities();
  }, []);

  const [modalNewPost, setModalNewPost] = useState(false);
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

  async function handlePost(e: React.SyntheticEvent) {

    e.preventDefault();

    if (newPost.description === "") {
      showToast({ message: "Preencha a descrição", status: "error", title: "Criar Post" });
      return;
    }

    setLoadingSendPost(true);
    const formData = new FormData();
    formData.append("photo_path", newPost.photo_path);
    formData.append("description", newPost.description);

    try {

      const response = await postFormData("/social-media/post", formData);
      showToast({ message: "Post criado com sucesso!", status: "success", title: "Criar Post" });
      setNewPost({ description: "", photo_path: "" });
      setModalNewPost(false);
      setPreview(null);
      getFeed();

    } catch (error: any) {

      showToast({ message: "Erro ao criar post: " + error.response.data.message, status: 'error', title: "Criar Post"});

    }

    setLoadingSendPost(false);
  }

  async function getFeed() {

    setLoadingFeed(true);
    try {
      const response = await get("/social-media/feed");
      setFeed(response.data);
    } catch (error: any) {

      showToast({ message: "Erro ao carregar feed", status: 'error', title: "Feed"});
    }
    setLoadingFeed(false);
  }

  async function getEvent() {

    try {
      const response = await get("/social-media/community-event/random-event");
      setEvent(response.data);
    } catch (error: any) {

      showToast({ message: "Erro ao carregar Evento", status: 'error', title: "Evento"});
    }
  }

  async function getCommunities() {

    try {
      const response = await get("/social-media/community?page=1");
      setCommunities(response.data);
    } catch (error: any) {

      showToast({ message: "Erro ao carregar Comunidades", status: 'error', title: "Comunidades"});
    }
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 min-w-0">

        <ListStories />
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full min-w-0 lg:flex-1 mb-4">
              <Container className="flex flex-row gap-2 mb-4 items-center rounded-card">
                {myInfo && (

                  <>
                    <RingImage>

                      <Image
                        src={ myInfo.photo ?? '/imgs/placeholder.png'}
                        alt=""
                        className="rounded-full w-[50px] aspect-square object-cover"
                        width={50}
                        height={50}
                        sizes="50px"
                      />
                    </RingImage>

                    {/* button (e não div) para ser focável e acionável por teclado */}
                    <button
                      type="button"
                      onClick={() => setModalNewPost(true)}
                      className="w-full rounded-full bg-surface-2 p-4 text-left text-sm text-content-muted
                        hover:bg-surface-3 transition-colors cursor-pointer
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                      Como você está se sentindo hoje?
                    </button>
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
              {!loadingFeed && feed.length === 0 && (
                <Container className="flex flex-col items-center gap-3 rounded-card py-10 text-center">
                  <PhotoIcon className="size-10 text-content-subtle" />
                  <h2 className="text-base font-semibold">Seu feed está vazio</h2>
                  <p className="max-w-xs text-sm text-content-muted">
                    Publique algo ou siga outras pessoas para começar a ver
                    novidades por aqui.
                  </p>
                  <ColorButtom
                    className="px-4 text-sm font-semibold"
                    onClick={() => setModalNewPost(true)}
                  >
                    Criar primeiro post
                  </ColorButtom>
                </Container>
              )}

              <Feed feed={feed} />

            </div>
            <aside
              aria-label="Sugestões"
              className="hidden lg:block relative w-[320px] shrink-0"
            >
                {/* {event && (
                  <Container className="mb-4 rounded-card">
                  
                    <div className="flex flex-row justify-between">

                      <h2 className="text-sm font-semibold mb-4">Próximo Evento</h2>
                      <CalendarIcon />
                    </div>

                    <CardEvent event={event} />
                  </Container>
                )} */}

                {event?.length === 0 && (
                  <Container className="mb-4 rounded-card">
                    <div className="flex flex-row justify-between">

                      <h2 className="text-sm font-semibold mb-4">Próximo Evento</h2>
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
                  <Container className="mb-4 rounded-card">
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

              <Container className="mb-4 rounded-card">
                <div className="flex flex-row justify-between mb-4">
                  <h2 className="text-sm font-semibold">Eventos sugeridos</h2>
                  <CalendarIcon />
                </div>
                <div className="flex flex-col gap-4">
                  {suggestedEvents.map((event) => (
                    
                    <CardEvent event={event} key={event.id} />
                  ))}
                </div>
                
                <ShowMore onClick={() => router.push('/social-media/events')} />

              </Container>
              <Container className="mb-4 rounded-card">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-sm font-semibold">Conecte com outras pessoas</h2>
                    <UsersIcon className="size-5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                      {suggestedFriends.map((friend) => (
                          <CardUser user={friend} key={friend.id} />
                      ))}
                  </div>
                  <ShowMore onClick={() => router.push('/social-media/events')} />

              </Container>
              <Container className="mb-4 rounded-card">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-sm font-semibold">Comunidades</h2>
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
                        
                        <Card className="flex flex-col justify-center mt-4 cursor-pointer transition-shadow hover:shadow-md" key={index}>
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
                              <h3 className="text-xs font-semibold">{community.name}</h3>
                              <p className="text-xs font-normal w-full" 

                              >
                                {community.description && community.description.length > 30
                                ? community.description.slice(0, 30) + "..."
                                : community.description}
                                {/* {community.description} */}
                              </p>
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center border-t border-line p-1">
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
                            <span className="text-xs font-semibold ml-auto">243 join</span>
                          </div>
                        </Card>
                      

                      );

                    } 
                  ))}
                  <ShowMore onClick={() => router.push('/social-media/communities')} />
              </Container>
              <SidebarFooter />
            </aside>
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
            alt=""
            className="rounded-full w-[40px] aspect-square object-cover"
            width={40}
            height={40}
            sizes="40px"
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{myInfo?.name}</span>
            <select
              aria-label="Visibilidade do post"
              className="rounded-full bg-surface-2 text-content text-xs p-1"
            >
              <option>Privado</option>
              <option>Publico</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row w-full py-4 gap-2 mb-2">
          <input
            type="text"
            aria-label="Descrição do post"
            value={newPost.description}
            placeholder="Como você está se sentindo hoje?"
            className="w-full rounded-full bg-transparent text-content placeholder:text-content-subtle
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
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
        <span className="text-sm mb-2 text-content-muted">Adicionar ao post</span>
        <div className="flex flex-row mb-2 gap-2">
          <Button onClick={handleButtonClick} aria-label="Adicionar foto">
            <PhotoIcon className="size-6" />
          </Button>
          <Button onClick={() => {}} aria-label="Adicionar localização">
            <PinIcon className="size-6" />
          </Button>
        </div>
        <div className="flex flex-row justify-end">
          {loadingSendPost && (
            <div className="w-full flex flex-row p-2 justify-center">
              <LoadingSpinner />
            </div>
          )}
          <ColorButtom
            onClick={(e) => handlePost(e)}
            disabled={loadingSendPost}
            aria-label="Publicar post"
          >
            <AirPlaneIcon className="size-6" />
          </ColorButtom>
        </div>
      </Modal>
    </>
  );
}
