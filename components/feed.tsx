'use client';

import Image from "next/image";
import HeartIcon from "./icons/heart";
import MessageIcon from "./icons/message";
import Container from "./container";

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

export default function Feed({ feed }: FeedProps) {

  return (
    <>
      {feed.map((post) => {

        const imageUser = post.user.photo ?? '/imgs/placeholder.png';

        const imagePost = post.photo_path ?? null;

        return (
          <div key={post.id}>
            <Container key={post.id} className="mb-4">
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
            </Container>
          </div>
        );
      })}
    </>
  );
}
