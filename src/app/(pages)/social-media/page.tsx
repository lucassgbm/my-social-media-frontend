'use client';

import Image from "../../../../components/remote-image";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Feed from "../../../../components/feed";
import Container from "../../../../components/container";
import Modal from "../../../../components/modal";
import PhotoIcon from "../../../../components/icons/photo";
import Button from "../../../../components/button";
import AirPlaneIcon from "../../../../components/icons/airplane";
import { post, get, postFormData } from "../../../api/services/request";
import Stories from "../../../../components/stories/stories";
import Skeleton from "../../../../components/skeleton";
import { useMyInfo } from "../../../../stores/use-session-store";
import RingImage from "../../../../components/ring-image";
import ColorButtom from "../../../../components/color-button";
import Card from "../../../../components/card";
import LoadingSpinner from "../../../../components/loading-spinner";
import CalendarIcon from "../../../../components/icons/calendar";
import PinIcon from "../../../../components/icons/pin";
import CommunityIcon from "../../../../components/icons/community";
import Sidebar from "../../../../components/sidebar";
import SidebarFooter from "../../../../components/sidebar-footer";
import UsersIcon from "../../../../components/icons/users";
import PeopleSuggestions from "../../../../components/users/people-suggestions";
import ShowMore from "../../../../components/show-more";
import EventCard from "../../../../components/communities/event-card";
import { useToaster } from "../../../../providers/toaster-provider";
import type { Community, CommunityEvent } from "../../../../utils/community";

interface NewPost {
  description: string;
  photo_path: File | "";
}


export default function Home() {
  const { showToast } = useToaster();


  useEffect(() => {
    getFeed();
    getEvents();
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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const myInfo = useMyInfo();
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

  /** Os próximos eventos das comunidades de que o usuário participa. */
  async function getEvents() {

    setLoadingEvents(true);
    try {
      const response = await get("/social-media/events?filter=upcoming");
      setEvents(response?.data ?? []);
    } catch {

      showToast({ message: "Erro ao carregar Eventos", status: 'error', title: "Eventos"});
    }
    setLoadingEvents(false);
  }

  async function getCommunities() {

    setLoadingCommunities(true);
    try {
      const response = await get("/social-media/community?page=1");
      setCommunities(response?.data ?? []);
    } catch {

      showToast({ message: "Erro ao carregar Comunidades", status: 'error', title: "Comunidades"});
    }
    setLoadingCommunities(false);
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 min-w-0">

        <Stories />
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
              <Container className="mb-4 rounded-card">
                <div className="flex flex-row justify-between mb-4">
                  <h2 className="text-sm font-semibold">Próximos eventos</h2>
                  <CalendarIcon />
                </div>

                {loadingEvents && (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton key={index} height="h-[150px]" rounded="card" />
                    ))}
                  </div>
                )}

                {!loadingEvents && events.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {/* a agenda inteira fica em /social-media/events; aqui só o
                        começo dela */}
                    {events.slice(0, 3).map((item) => (
                      <EventCard
                        key={item.id}
                        event={item}
                        href={`/social-media/events/${item.id}`}
                        showCommunity
                      />
                    ))}
                  </div>
                )}

                {!loadingEvents && events.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <CalendarIcon className="size-8 text-content-subtle" />
                    <p className="text-xs text-content-muted">
                      Nenhum evento marcado nas suas comunidades.
                    </p>
                  </div>
                )}

                <ShowMore onClick={() => router.push('/social-media/events')} />

              </Container>
              <Container className="mb-4 rounded-card">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-sm font-semibold">Conecte com outras pessoas</h2>
                    <UsersIcon className="size-5" />
                  </div>
                  <div className="pt-4">
                    <PeopleSuggestions limit={6} gridClassName="grid grid-cols-2 gap-2" />
                  </div>
                  <ShowMore onClick={() => router.push('/social-media/friends')} />

              </Container>
              <Container className="mb-4 rounded-card">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-sm font-semibold">Comunidades</h2>
                    <CommunityIcon className="size-5" />
                  </div>
                  {loadingCommunities && (
                    <>
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                      <Skeleton className="mt-4" width="w-full" rounded="xl" height="h-[94px]" />
                    </>
                  )}

                  {!loadingCommunities && communities.slice(0, 4).map((community) => (
                    <Link
                      href={`/social-media/communities/${community.id}`}
                      key={community.id}
                      className="block mt-4 rounded-card
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                      <Card className="flex flex-col justify-center transition-shadow hover:shadow-md">
                        <div className="flex flex-row items-center gap-2 rounded-sm mb-2 min-w-0">
                          <Image
                            src={community.photo ?? "/imgs/placeholder.png"}
                            alt=""
                            className="rounded-full w-10 aspect-square object-cover shrink-0"
                            width={40}
                            height={40}
                            sizes="40px"
                          />
                          <div className="flex flex-col text-left min-w-0">
                            <h3 className="text-xs font-semibold truncate">{community.name}</h3>
                            {community.description && (
                              <p className="text-xs font-normal text-content-muted line-clamp-2">
                                {community.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* o rodapé eram dois avatares fixos de /imgs/bmw.jpg e
                            um "243 join" cravado no código */}
                        <div className="w-full flex flex-row items-center gap-2 border-t border-line pt-2">
                          <UsersIcon className="size-4 text-content-muted" />
                          <span className="text-xs text-content-muted">
                            {community.members_count === 1
                              ? "1 membro"
                              : `${community.members_count ?? 0} membros`}
                          </span>

                          {["owner", "admin", "member"].includes(community.viewer_role) && (
                            <span className="ml-auto rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-semibold text-brand">
                              Participando
                            </span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}

                  {!loadingCommunities && communities.length === 0 && (
                    <p className="py-6 text-center text-xs text-content-muted">
                      Nenhuma comunidade por aqui ainda.
                    </p>
                  )}

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
