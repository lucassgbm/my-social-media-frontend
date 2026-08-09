'use client';

import Image from "./remote-image";
import { useEffect, useRef, useState } from "react";
import HeartIcon from "./icons/heart";
import MessageIcon from "./icons/message";
import Container from "./container";
import AirPlaneIcon from "./icons/airplane";
import ColorButton from "./color-button";
import LoadingSpinner from "./loading-spinner";
import Modal from "./modal";
import { useToaster } from "../providers/toaster-provider";
import { post as sendRequest } from "@/api/services/request";

interface User {
  name: string;
  photo?: string | null;
}

interface Likes {
  count: number;
}

/** Espelha PostCommentResource. */
interface PostComment {
  id: number;
  comment: string;
  created_at?: string | null;
  user: {
    id?: number | null;
    name?: string | null;
    photo?: string | null;
  };
}

interface Comments {
  count: number;
  /** Lista completa: o feed já traz os comentários junto de cada post. */
  comment?: PostComment[];
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

interface FeedProps {
  feed: Post[];
}

const actionButtonClass = `flex w-1/3 flex-row items-center justify-center gap-1 rounded-field py-2
  text-content-muted hover:bg-surface-2 hover:text-content transition-colors cursor-pointer
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring`;

/**
 * Avatares do modal de comentários: um tamanho só. Antes o autor do post tinha
 * 40px e cada comentário 32px, então as linhas não alinhavam entre si.
 * As duas constantes andam juntas — w-10 é o equivalente em classe dos 40px.
 */
const MODAL_AVATAR_SIZE = 40;
const modalAvatarClass = "w-10 aspect-square rounded-full object-cover shrink-0";

/**
 * Altura da foto do post no modal. Valor fixo, igual em qualquer tela e para
 * qualquer post — junto com object-cover é o que garante que todo post abra o
 * modal do mesmo tamanho. Alturas em vh ou herdadas da coluna variavam com a
 * janela.
 */
const POST_IMAGE_HEIGHT = "h-[280px]";

export default function Feed({ feed }: FeedProps) {
  const { showToast } = useToaster();

  const [modalPost, setModalPost] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Comentários por post, semeados com o que veio no feed. Ficam aqui (e não no
  // objeto do feed, que é do componente pai) para o novo comentário aparecer na
  // lista e no contador do card sem recarregar o feed inteiro.
  const [commentsByPost, setCommentsByPost] = useState<Record<number, PostComment[]>>({});

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  // Marca o topo da lista, logo abaixo do cabeçalho do post: é onde o
  // comentário recém-enviado aparece.
  const listStartRef = useRef<HTMLDivElement>(null);
  const scrollToNewest = useRef(false);

  const activeComments = activePost ? commentsByPost[activePost.id] ?? [] : [];

  // Só rola depois de enviar. Ao abrir, a posição natural (topo) já mostra o
  // post e os comentários mais recentes logo abaixo.
  useEffect(() => {
    if (!scrollToNewest.current) return;

    scrollToNewest.current = false;
    listStartRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeComments.length]);

  function openComments(post: Post) {
    setActivePost(post);
    setDraft("");
    setModalPost(true);

    // só na primeira abertura: depois disso o estado local é a fonte da verdade
    setCommentsByPost((current) =>
      current[post.id] ? current : { ...current, [post.id]: post.comments.comment ?? [] }
    );
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();

    const comment = draft.trim();
    if (comment === "" || !activePost) return;

    setSending(true);

    // o helper engole o erro e devolve undefined
    const response = await sendRequest(`/social-media/post/${activePost.id}/comments`, { comment });

    if (!response?.data) {
      showToast({
        title: "Comentários",
        message: "Não foi possível publicar o seu comentário.",
        status: "error",
      });
      setSending(false);
      return;
    }

    // no topo: a lista vai do mais novo para o mais antigo
    setCommentsByPost((current) => ({
      ...current,
      [activePost.id]: [response.data as PostComment, ...(current[activePost.id] ?? [])],
    }));

    scrollToNewest.current = true;
    setDraft("");
    setSending(false);
  }

  return (
    <>
      {feed.map((post) => {

        const imageUser = post.user.photo ?? '/imgs/placeholder.png';
        const imagePost = post.photo_path ?? null;
        const commentCount = commentsByPost[post.id]?.length ?? post.comments.count;

        return (
          <Container as="article" key={post.id} className="mb-4 rounded-card">
            <div className="flex flex-row gap-4 items-center mb-4">
              <Image
                src={imageUser}
                alt=""
                className="rounded-full aspect-square object-cover"
                width={50}
                height={50}
                sizes="50px"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{post.user.name}</span>
                {/* text-content-muted mantém contraste >= 4.5:1 nos dois temas */}
                <span className="text-xs text-content-muted">{post.created_at}</span>
              </div>
            </div>

            <p className="text-sm py-4 whitespace-pre-line">{post.description}</p>

            {imagePost && (
              <Image
                src={imagePost}
                alt={post.description ? `Imagem do post: ${post.description}` : "Imagem do post"}
                className="w-full rounded-card object-cover"
                width={500}
                height={500}
                sizes="(max-width: 1024px) 100vw, 640px"
              />
            )}

            {(post.likes.count > 0 || commentCount > 0) && (
              <div className="flex flex-row gap-4 w-full mt-4 items-center text-content-muted">
                {post.likes.count > 0 && (
                  <span className="flex flex-row items-center gap-2">
                    <HeartIcon className="size-4" />
                    <span className="text-sm">
                      {post.likes.count === 1
                        ? "1 pessoa curtiu"
                        : `${post.likes.count} pessoas curtiram`}
                    </span>
                  </span>
                )}

                {commentCount > 0 && (
                  <button
                    type="button"
                    onClick={() => openComments(post)}
                    className="text-sm hover:text-content transition-colors cursor-pointer
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                  >
                    {commentCount === 1 ? "1 comentário" : `${commentCount} comentários`}
                  </button>
                )}
              </div>
            )}

            {/* border-line troca de cor com o tema — antes era border-neutral-800 fixo */}
            <div className="w-full flex flex-row items-center justify-between gap-4 mt-4 pt-2 border-t border-line">
              <button type="button" className={actionButtonClass} aria-label="Curtir">
                <HeartIcon className="size-5" />
              </button>
              <button
                type="button"
                aria-label={`Comentar (${commentCount})`}
                onClick={() => openComments(post)}
                className={actionButtonClass}
              >
                <MessageIcon className="size-5" />
              </button>
              <button type="button" className={actionButtonClass} aria-label="Compartilhar">
                <AirPlaneIcon className="size-5" />
              </button>
            </div>
          </Container>
        );
      })}

      {/* ---------------------------------------------------------------
          Modal de comentários. Antes só repetia a imagem e a descrição do
          post: o botão "Comentar" abria uma tela sem comentário nenhum e
          sem onde escrever.
      --------------------------------------------------------------- */}
      <Modal
        isOpen={modalPost}
        onClose={() => setModalPost(false)}
        title="Publicação"
        width={activePost?.photo_path ? "sm:w-[880px]" : "sm:w-[560px]"}
      >
        {activePost && (
          /* Altura definida (não max-height): é o que dá um limite real para a
             lista rolar por dentro e o campo de comentar ficar preso embaixo.
             No mobile herda a altura do painel.

             A partir de sm o valor é calculado a partir do teto do próprio
             painel (max-h-[90vh]) menos o que ele gasta com padding (2 × 1.5rem)
             e cabeçalho (~2.5rem + 1rem de margem) — 7rem cobre os dois com
             folga. Com 70vh fixos, em janela baixa a soma passava do teto e o
             painel inteiro ganhava barra de rolagem. */
          <div className="flex min-h-0 flex-1 flex-col gap-4 sm:h-[calc(90vh-7rem)] sm:flex-row">

            {/* Coluna do post: foto e autoria ficam ao lado dos comentários, não
                acima deles. A foto tem altura fixa (POST_IMAGE_HEIGHT) em vez de
                ocupar a coluna inteira — era o `h-full` que fazia a altura variar
                com a janela. O que sobra da coluna é da descrição. */}
            <div className="flex min-h-0 flex-col gap-3 sm:w-[30%] sm:shrink-0">

              {activePost.photo_path && (
                <div
                  className={`${POST_IMAGE_HEIGHT} w-full shrink-0 overflow-hidden rounded-card bg-surface-2`}
                >
                  <Image
                    src={activePost.photo_path}
                    alt={
                      activePost.description
                        ? `Imagem do post: ${activePost.description}`
                        : "Imagem do post"
                    }
                    // object-cover preenche a moldura por igual em qualquer
                    // proporção — é o que padroniza o tamanho entre os posts
                    className="h-full w-full object-cover"
                    width={700}
                    height={700}
                    sizes="(max-width: 640px) 100vw, 380px"
                  />
                </div>
              )}

              <div className="flex shrink-0 flex-row items-center gap-3">
                <Image
                  src={activePost.user.photo ?? "/imgs/placeholder.png"}
                  alt=""
                  width={MODAL_AVATAR_SIZE}
                  height={MODAL_AVATAR_SIZE}
                  sizes={`${MODAL_AVATAR_SIZE}px`}
                  className={modalAvatarClass}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{activePost.user.name}</span>
                  <span className="text-xs text-content-muted">{activePost.created_at}</span>
                </div>
              </div>

              {/* No mobile a descrição é limitada para não empurrar os
                  comentários; no desktop ela usa o que sobrou da coluna */}
              {activePost.description && (
                <p className="scrollbar-slim max-h-24 overflow-y-auto text-sm whitespace-pre-line
                  sm:max-h-none sm:min-h-0 sm:flex-1">
                  {activePost.description}
                </p>
              )}
            </div>

            {/* Coluna dos comentários */}
            <div className="flex min-h-0 w-full flex-1 flex-col">

              <div className="flex shrink-0 flex-row items-center gap-2 border-b border-line pb-2">
                <MessageIcon className="size-4 text-content-muted" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-content-muted">
                  {activeComments.length === 1
                    ? "1 comentário"
                    : `${activeComments.length} comentários`}
                </h3>
              </div>

              <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 pt-3">

                <div ref={listStartRef} />

                {activeComments.map((item) => (
                  <div key={item.id} className="flex flex-row items-start gap-2">
                    <Image
                      src={item.user.photo ?? "/imgs/placeholder.png"}
                      alt=""
                      width={MODAL_AVATAR_SIZE}
                      height={MODAL_AVATAR_SIZE}
                      sizes={`${MODAL_AVATAR_SIZE}px`}
                      className={modalAvatarClass}
                    />

                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="rounded-2xl rounded-tl-md bg-surface-2 px-3 py-2">
                        <p className="text-xs font-semibold">
                          {item.user.name ?? "Usuário"}
                        </p>
                        <p className="text-sm break-words whitespace-pre-line">{item.comment}</p>
                      </div>
                      {item.created_at && (
                        <span className="pl-3 text-[11px] text-content-muted">
                          {item.created_at}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {activeComments.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                    <span className="rounded-full bg-surface-2 p-4">
                      <MessageIcon className="size-6 text-content-subtle" />
                    </span>
                    <p className="text-sm text-content-muted">
                      Nenhum comentário ainda. Seja o primeiro.
                    </p>
                  </div>
                )}
              </div>

              {/* shrink-0: o campo fica preso no rodapé da coluna, fora da rolagem.
                  <form> para o Enter enviar. */}
              <form
                onSubmit={handleComment}
                className="mt-3 flex shrink-0 flex-row items-center gap-2 border-t border-line pt-3"
              >
                <div className="flex w-full items-center rounded-full border border-line bg-surface-2 px-4 py-2.5
                  focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                  <input
                    type="text"
                    aria-label="Escreva um comentário"
                    placeholder="Escreva um comentário..."
                    value={draft}
                    maxLength={1000}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full bg-transparent text-sm text-content
                      placeholder:text-content-subtle outline-none"
                  />
                </div>

                {sending && <LoadingSpinner />}

                <ColorButton
                  type="submit"
                  disabled={sending || draft.trim() === ""}
                  aria-label="Publicar comentário"
                  className="size-10 shrink-0 transition-transform active:scale-95"
                >
                  <AirPlaneIcon className="size-5" />
                </ColorButton>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
