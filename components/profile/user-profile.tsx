'use client';

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "../remote-image";
import Container from "../container";
import Card from "../card";
import RingImage from "../ring-image";
import Button from "../button";
import ColorButton from "../color-button";
import BorderButton from "../border-button";
import Modal from "../modal";
import Skeleton from "../skeleton";
import LoadingSpinner from "../loading-spinner";
import CardUser from "../users/card-user";
import Sidebar from "../sidebar";
import SidebarFooter from "../sidebar-footer";
import ProfileIcon from "../icons/profile";
import MessageIcon from "../icons/message";
import PencilSquareIcon from "../icons/pencil-square";
import CameraIcon from "../icons/camera";
import PhotoIcon from "../icons/photo";
import AirPlaneIcon from "../icons/airplane";
import EllipsisVerticalIcon from "../icons/ellipsis";
import ArrowLeftIcon from "../icons/arrow-left";
import ArrowRightIcon from "../icons/arrow-right";
import HeartIcon from "../icons/heart";
import PinIcon from "../icons/pin";
import UsersIcon from "../icons/users";
import CommunityIcon from "../icons/community";
import { AppContext } from "@/app/(pages)/social-media/layout";
import { get, postFormData } from "@/api/services/request";
import { suggestedFriends, suggestedCommunities } from "../../mocks/suggestions";
import { useToaster } from "../../providers/toaster-provider";

interface UserPhoto {
    id: number;
    photo_path: string;
    created_at: string;
}

interface PostAuthor {
    name: string;
    photo?: string | null;
}

interface Post {
    id: number;
    description: string;
    photo_path?: string | null;
    created_at: string;
    user: PostAuthor;
    likes: { count: number };
    comments: { count: number };
}

type Tab = "friends" | "photos" | "communities";

const TABS: { id: Tab; label: string; icon: typeof UsersIcon }[] = [
    { id: "friends", label: "Amigos", icon: UsersIcon },
    { id: "photos", label: "Fotos", icon: PhotoIcon },
    { id: "communities", label: "Comunidades", icon: CommunityIcon },
];

/**
 * Tela de perfil compartilhada por /social-media/user/[userId],
 * /social-media/profile/[profileId] e /social-media/friends/[friendId].
 * As três rotas eram cópias byte a byte deste arquivo — qualquer ajuste
 * precisava ser repetido três vezes e elas já haviam divergido.
 */
export default function UserProfile({ profileName }: { profileName: string }) {
    const { showToast } = useToaster();

    const { myInfo } = useContext(AppContext);

    // Só existe endpoint para o usuário logado (/social-media/user). Enquanto
    // não houver um "buscar usuário por nome", o perfil de terceiros mostra o
    // nome da rota e os dados ficam vazios em vez de exibir os seus.
    const isOwnProfile = !!myInfo && myInfo.name === profileName;
    const profilePhoto = isOwnProfile ? myInfo?.photo ?? "/imgs/placeholder.png" : "/imgs/placeholder.png";
    const profileBio = isOwnProfile ? myInfo?.autodescription : "";

    const [tab, setTab] = useState<Tab>("friends");

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);

    const [modalNewPhoto, setModalNewPhoto] = useState(false);
    const [newPhoto, setNewPhoto] = useState<{ photo_path: File | string | null }>({
        photo_path: null,
    });
    const [loadingSendPhoto, setLoadingSendPhoto] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Carrossel de posts: 1 por vez no mobile, 2 no desktop
    const postsRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    useEffect(() => {
        getUserPhotos();
        getUserPosts();
    }, []);

    useEffect(() => {
        updateScrollButtons();

        window.addEventListener("resize", updateScrollButtons);
        return () => window.removeEventListener("resize", updateScrollButtons);
    }, [userPosts]);

    function updateScrollButtons() {
        const track = postsRef.current;
        if (!track) return;

        // margem de 8px absorve arredondamento de subpixel no fim da rolagem
        setCanScrollPrev(track.scrollLeft > 8);
        setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
    }

    function scrollPosts(direction: -1 | 1) {
        const track = postsRef.current;
        if (!track) return;

        track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
    }

    async function getUserPosts() {
        setLoadingPosts(true);
        const response = await get("/social-media/feed");

        if (!response) {
            showToast({ message: "Erro ao carregar posts", status: "error", title: "Posts" });
        }

        setUserPosts(response?.data ?? []);
        setLoadingPosts(false);
    }

    async function getUserPhotos() {
        setLoadingPhotos(true);
        const response = await get("/social-media/user-photos");

        if (!response) {
            showToast({ message: "Erro ao carregar fotos", status: "error", title: "Fotos" });
        }

        setUserPhotos(response?.data ?? []);
        setLoadingPhotos(false);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setNewPhoto({ ...newPhoto, photo_path: file });

        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
    };

    async function handlePhoto(e: React.SyntheticEvent) {
        e.preventDefault();

        if (newPhoto.photo_path === null) {
            showToast({ message: "Escolha uma foto", status: "error", title: "Nova Foto" });
            return;
        }

        setLoadingSendPhoto(true);

        const formData = new FormData();
        formData.append("photo_path", newPhoto.photo_path);
        formData.append("description", "");

        try {
            await postFormData("/social-media/user-photos", formData);
            showToast({ message: "Foto enviada com sucesso!", status: "success", title: "Nova Foto" });
            setNewPhoto({ photo_path: null });
            setModalNewPhoto(false);
            setPreview(null);
            getUserPhotos();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({
                message: "Erro ao enviar foto: " + (error?.response?.data?.message ?? ""),
                status: "error",
                title: "Nova Foto",
            });
        }

        setLoadingSendPhoto(false);
    }

    const tabClass = (active: boolean) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${active ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2"}`;

    return (
        <>
            {/* A navegação lateral estava ausente nas páginas de perfil,
                diferente do resto da aplicação */}
            <Sidebar />

            {/* Conteúdo e sugestões precisam de um wrapper próprio: são dois
                filhos do flex-row do layout e, sem isso, o <aside> w-full
                shrink-0 estourava a largura no mobile. A coluna de sugestões
                só entra ao lado a partir de xl — em lg ela roubava espaço
                demais da coluna principal. */}
            <div className="flex flex-1 min-w-0 flex-col xl:flex-row gap-4">

            <div className="flex-1 min-w-0 flex flex-col gap-4">

                {/* ---------------------------------------------------------
                    Cabeçalho: capa + avatar sobreposto. Antes a capa era
                    position:absolute com z-40 e o avatar ficava abaixo dela,
                    apoiado num espaçador vazio de 80px.
                --------------------------------------------------------- */}
                <Container className="rounded-card overflow-hidden" padding="p-0" as="section">
                    <div className="relative h-36 sm:h-52 w-full">
                        <Image
                            src="/imgs/cover-profile.jpg"
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 800px"
                            priority
                        />
                    </div>

                    {/* relative z-10 é obrigatório: a capa é uma <Image fill>,
                        ou seja, posicionada. Na ordem de pintura do CSS os
                        elementos posicionados vêm depois dos blocos estáticos,
                        então a capa cobria o avatar mesmo vindo antes no DOM. */}
                    <div className="relative z-10 px-4 pb-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div className="-mt-14 sm:-mt-20">
                                <RingImage className="w-[112px] sm:w-[150px]">
                                    <Image
                                        src={profilePhoto}
                                        alt={`Foto de perfil de ${profileName}`}
                                        width={150}
                                        height={150}
                                        sizes="150px"
                                        className="w-full aspect-square object-cover rounded-full"
                                        priority
                                    />
                                </RingImage>
                            </div>

                            {/* No mobile as ações ocupam a linha inteira; a partir
                                de sm acompanham a base do avatar */}
                            <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:pb-2">
                                {isOwnProfile ? (
                                    <Link href="/social-media/profile/edit" className="flex-1 sm:flex-none">
                                        <BorderButton className="w-full px-4">
                                            <PencilSquareIcon className="size-4 shrink-0" />
                                            Editar perfil
                                        </BorderButton>
                                    </Link>
                                ) : (
                                    <>
                                        <ColorButton className="flex-1 sm:flex-none px-4 text-sm font-semibold">
                                            <ProfileIcon className="size-4 shrink-0" />
                                            Seguir
                                        </ColorButton>
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            className="flex-1 sm:flex-none font-semibold"
                                        >
                                            <MessageIcon className="size-4 shrink-0" />
                                            <span className="truncate">Mensagem</span>
                                        </Button>
                                    </>
                                )}

                                <Button aria-label="Mais opções" className="shrink-0">
                                    <EllipsisVerticalIcon className="size-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold">{profileName}</h1>

                            <div className="flex flex-row items-center gap-1 text-content-muted">
                                <PinIcon className="size-3" />
                                <span className="text-sm">Brasília - DF</span>
                            </div>

                            {profileBio && <p className="text-sm text-content-muted">{profileBio}</p>}

                            {/* Estatísticas em linha, com o número em destaque */}
                            <dl className="mt-2 flex flex-row flex-wrap gap-6">
                                <div className="flex flex-col">
                                    <dt className="sr-only">Seguidores</dt>
                                    <dd className="text-lg font-semibold">2.000</dd>
                                    <span className="text-xs text-content-muted">Seguidores</span>
                                </div>
                                <div className="flex flex-col">
                                    <dt className="sr-only">Amigos</dt>
                                    <dd className="text-lg font-semibold">{suggestedFriends.length}</dd>
                                    <span className="text-xs text-content-muted">Amigos</span>
                                </div>
                                <div className="flex flex-col">
                                    <dt className="sr-only">Fotos</dt>
                                    <dd className="text-lg font-semibold">{userPhotos.length}</dd>
                                    <span className="text-xs text-content-muted">Fotos</span>
                                </div>
                            </dl>
                        </div>
                    </div>
                </Container>

                {/* ---------------------------------------------------------
                    Abas funcionais. Antes eram três botões só com ícone,
                    sem rótulo, sem estado e com bg-black/30 fixo.
                --------------------------------------------------------- */}
                <Container className="rounded-card" padding="p-0" as="section">
                    {/* Rolagem horizontal em telas estreitas em vez de quebrar
                        as abas em duas linhas */}
                    <div
                        role="tablist"
                        aria-label="Seções do perfil"
                        className="flex flex-row gap-2 overflow-x-auto scrollbar-hide border-b border-line p-4"
                    >
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={tab === id}
                                onClick={() => setTab(id)}
                                className={`${tabClass(tab === id)} shrink-0 whitespace-nowrap`}
                            >
                                <Icon className="size-4 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        {tab === "friends" && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                    {suggestedFriends.slice(0, 8).map((friend) => (
                                        <CardUser key={friend.id} user={friend} />
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <Link
                                        href="/social-media/friends"
                                        className="mt-4 rounded-field px-3 py-1 text-sm font-semibold text-brand
                                            hover:bg-surface-2 transition-colors
                                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                    >
                                        Ver todos
                                    </Link>
                                </div>
                            </>
                        )}

                        {tab === "photos" && (
                            <>
                                {isOwnProfile && (
                                    <div className="flex justify-end mb-4">
                                        <BorderButton onClick={() => setModalNewPhoto(true)} className="px-4">
                                            <PhotoIcon className="size-4" />
                                            Adicionar foto
                                        </BorderButton>
                                    </div>
                                )}

                                {loadingPhotos && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                        {Array.from({ length: 8 }).map((_, index) => (
                                            <Skeleton key={index} className="w-full aspect-square" rounded="card" />
                                        ))}
                                    </div>
                                )}

                                {!loadingPhotos && userPhotos.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                        {userPhotos.map((photo) => (
                                            <Image
                                                key={photo.id}
                                                src={photo.photo_path ?? "/imgs/placeholder.png"}
                                                alt={`Foto de ${profileName}`}
                                                width={400}
                                                height={400}
                                                sizes="(max-width: 640px) 50vw, 200px"
                                                className="w-full aspect-square object-cover rounded-card"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Antes a ausência de fotos renderizava skeletons para sempre */}
                                {!loadingPhotos && userPhotos.length === 0 && (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <PhotoIcon className="size-10 text-content-subtle" />
                                        <h3 className="text-base font-semibold">Nenhuma foto por aqui</h3>
                                        <p className="max-w-xs text-sm text-content-muted">
                                            {isOwnProfile
                                                ? "Adicione fotos para montar a sua galeria."
                                                : `${profileName} ainda não publicou fotos.`}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {tab === "communities" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
                                {suggestedCommunities.map((community) => (
                                    <Card
                                        key={community.id}
                                        className="flex flex-row items-center gap-3 p-3 transition-shadow hover:shadow-md"
                                    >
                                        <Image
                                            src={community.photo_path}
                                            alt=""
                                            width={56}
                                            height={56}
                                            sizes="56px"
                                            className="w-14 aspect-square rounded-full object-cover shrink-0"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="text-sm font-semibold truncate">{community.name}</h3>
                                            <p className="text-xs text-content-muted truncate">
                                                {community.description}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>

                {/* ---------------------------------------------------------
                    Posts em carrossel: 1 por vez no mobile, 2 no desktop.
                    Rolagem nativa com scroll-snap + botões próprios, para os
                    controles seguirem o tema (as setas padrão do Splide não
                    seguiam) e responderem a teclado.
                --------------------------------------------------------- */}
                <Container className="rounded-card" padding="p-4" as="section">
                    <div className="flex flex-row items-center justify-between gap-2 mb-4">
                        <h2 className="text-lg font-semibold">Posts</h2>

                        {!loadingPosts && userPosts.length > 0 && (
                            <div className="flex flex-row gap-2">
                                <Button
                                    onClick={() => scrollPosts(-1)}
                                    disabled={!canScrollPrev}
                                    aria-label="Posts anteriores"
                                >
                                    <ArrowLeftIcon className="size-4" />
                                </Button>
                                <Button
                                    onClick={() => scrollPosts(1)}
                                    disabled={!canScrollNext}
                                    aria-label="Próximos posts"
                                >
                                    <ArrowRightIcon className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {loadingPosts && (
                        <div className="flex flex-row gap-4">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="w-full md:w-[calc(50%-0.5rem)] h-[220px] shrink-0"
                                    rounded="card"
                                />
                            ))}
                        </div>
                    )}

                    {!loadingPosts && userPosts.length > 0 && (
                        <div
                            ref={postsRef}
                            onScroll={updateScrollButtons}
                            className="flex flex-row gap-4 overflow-x-auto scrollbar-hide
                                snap-x snap-mandatory scroll-smooth"
                        >
                            {userPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="flex flex-col rounded-card border border-line p-4
                                        w-full md:w-[calc(50%-0.5rem)] shrink-0 snap-start"
                                >
                                    <div className="flex flex-row gap-3 items-center mb-3">
                                        <Image
                                            src={post.user.photo ?? "/imgs/placeholder.png"}
                                            alt=""
                                            className="rounded-full aspect-square object-cover"
                                            width={40}
                                            height={40}
                                            sizes="40px"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold truncate">{post.user.name}</span>
                                            <span className="text-xs text-content-muted">{post.created_at}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3 line-clamp-3">{post.description}</p>

                                    {post.photo_path && (
                                        <Image
                                            src={post.photo_path}
                                            alt=""
                                            className="w-full aspect-video object-cover rounded-card"
                                            width={500}
                                            height={280}
                                            sizes="(max-width: 1024px) 100vw, 380px"
                                        />
                                    )}

                                    <div className="w-full flex flex-row gap-4 items-center mt-3 text-content-muted">
                                        <span className="flex flex-row gap-1 items-center">
                                            <HeartIcon className="size-4" />
                                            <span className="text-sm font-semibold">{post.likes.count}</span>
                                        </span>
                                        <span className="flex flex-row gap-1 items-center">
                                            <MessageIcon className="size-4" />
                                            <span className="text-sm font-semibold">{post.comments.count}</span>
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!loadingPosts && userPosts.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <PencilSquareIcon className="size-10 text-content-subtle" />
                            <h3 className="text-base font-semibold">Nenhum post ainda</h3>
                            <p className="max-w-xs text-sm text-content-muted">
                                As publicações aparecem aqui assim que forem criadas.
                            </p>
                        </div>
                    )}
                </Container>
            </div>

            <aside aria-label="Sugestões" className="w-full xl:w-[340px] xl:shrink-0 flex flex-col gap-4">
                <Container className="rounded-card" padding="p-4">
                    <h2 className="text-lg font-semibold mb-4">Siga outras pessoas</h2>
                    {/* Empilhada abaixo de xl a coluna ocupa a largura toda,
                        então cabem mais colunas nesse intervalo */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3">
                        {suggestedFriends.slice(0, 4).map((friend) => (
                            <CardUser key={friend.id} user={friend} />
                        ))}
                    </div>
                </Container>

                <Container className="rounded-card" padding="p-4">
                    <h2 className="text-lg font-semibold mb-4">Comunidades sugeridas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                        {suggestedCommunities.map((community) => (
                            <Link
                                href={`/social-media/communities/${community.id}`}
                                key={community.id}
                                className="rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <Card className="flex flex-row items-center gap-3 p-3 transition-shadow hover:shadow-md">
                                    <Image
                                        src={community.photo_path}
                                        alt=""
                                        width={48}
                                        height={48}
                                        sizes="48px"
                                        className="w-12 aspect-square rounded-full object-cover shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-sm font-semibold truncate">{community.name}</h3>
                                        <p className="text-xs text-content-muted truncate">
                                            {community.description}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </Container>

                <SidebarFooter />
            </aside>

            </div>

            <Modal isOpen={modalNewPhoto} onClose={() => setModalNewPhoto(false)} title="Nova foto">
                <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="sr-only"
                    onChange={handleFileChange}
                />

                {preview ? (
                    <div className="w-full flex flex-col items-center">
                        <Image
                            src={preview}
                            className="w-full sm:w-[350px] aspect-square object-cover rounded-card"
                            alt="Pré-visualização da foto"
                            width={350}
                            height={350}
                        />
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center gap-2 rounded-card
                        border border-dashed border-line py-10 text-center text-content-muted">
                        <PhotoIcon className="size-8" />
                        <span className="text-sm">Nenhuma foto selecionada</span>
                    </div>
                )}

                <div className="flex flex-row items-center justify-between mt-4">
                    <div className="flex flex-row gap-2">
                        <Button onClick={() => inputRef.current?.click()} aria-label="Escolher arquivo">
                            <PhotoIcon className="size-6" />
                        </Button>
                        <Button onClick={() => {}} aria-label="Usar câmera">
                            <CameraIcon className="size-6" />
                        </Button>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        {loadingSendPhoto && <LoadingSpinner />}
                        <ColorButton
                            onClick={(e) => handlePhoto(e)}
                            disabled={loadingSendPhoto}
                            aria-label="Enviar foto"
                        >
                            <AirPlaneIcon className="size-6" />
                        </ColorButton>
                    </div>
                </div>
            </Modal>

        </>
    );
}
