'use client';

import Image from "./remote-image";
import { useState } from "react";
import HeartIcon from "./icons/heart";
import MessageIcon from "./icons/message";
import Container from "./container";
import AirPlaneIcon from "./icons/airplane";
import Modal from "./modal";

interface User {
  name: string;
  photo?: string | null;
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

interface FeedProps {
  feed: Post[];
}

const actionButtonClass = `flex w-1/3 flex-row items-center justify-center gap-1 rounded-field py-2
  text-content-muted hover:bg-surface-2 hover:text-content transition-colors cursor-pointer
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring`;

export default function Feed({ feed }: FeedProps) {

  const [modalPost, setModalPost] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  return (
    <>
      {feed.map((post) => {

        const imageUser = post.user.photo ?? '/imgs/placeholder.png';
        const imagePost = post.photo_path ?? null;

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

            {post.likes.count > 0 && (
              <div className="flex flex-row gap-2 w-full mt-4 items-center text-content-muted">
                <HeartIcon className="size-4" />
                <span className="text-sm">
                  {post.likes.count === 1
                    ? "1 pessoa curtiu"
                    : `${post.likes.count} pessoas curtiram`}
                </span>
              </div>
            )}

            {/* border-line troca de cor com o tema — antes era border-neutral-800 fixo */}
            <div className="w-full flex flex-row items-center justify-between gap-4 mt-4 pt-2 border-t border-line">
              <button type="button" className={actionButtonClass} aria-label="Curtir">
                <HeartIcon className="size-5" />
              </button>
              <button
                type="button"
                aria-label={`Comentar (${post.comments.count})`}
                onClick={() => { setModalPost(true); setPost(post); }}
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

      <Modal
        isOpen={modalPost}
        onClose={() => setModalPost(false)}
        title="Post"
      >
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <Image
            src={post?.photo_path ?? '/imgs/placeholder.png'}
            alt=""
            className="w-full sm:w-2/3 aspect-[9/10] object-cover rounded-card"
            width={500}
            height={500}
            sizes="(max-width: 640px) 100vw, 400px"
          />
          <div className="w-full sm:w-1/3 text-sm">
            <p className="font-semibold mb-2">{post?.user.name}</p>
            <p className="text-content-muted whitespace-pre-line">
              {post?.description}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
