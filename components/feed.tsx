'use client';

import Image from "next/image";
import HeartIcon from "./icons/heart";
import MessageIcon from "./icons/message";
import Container from "./container";
import AirPlaneIcon from "./icons/airplane";
import ModalPost from "./posts/modal-post";
import { useState } from "react";
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

export default function Feed({ feed }: FeedProps) {

  const [modalPost, setModalPost] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

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

              <div className="flex flex-row gap-2 w-full mt-4 items-center text-xs text-gray-400">
                <HeartIcon className="size-4" />
                  <span className="text-sm">{`${post.likes.count} users liked this`}</span>
              </div>
              <div className="w-full flex flex-row gap-4 items-center justify-between mt-4 text-gray-400 pt-2 border-t border-neutral-800">
                <button className="flex w-1/3 flex-row gap-1 items-center justify-center hover:bg-black/30 cursor-pointer transition duration-300 ease-in-out py-2 rounded-md">
                  <HeartIcon className="size-5" />
                  
                </button>
                <button onClick={() => {setModalPost(true); setPost(post)}} className="flex w-1/3 flex-row gap-1 items-center justify-center hover:bg-black/30 cursor-pointer transition duration-300 ease-in-out py-2 rounded-md">
                  <MessageIcon className="size-5" />
                  
                </button>
                <button className="flex w-1/3 flex-row gap-1 items-center justify-center hover:bg-black/30 cursor-pointer transition duration-300 ease-in-out py-2 rounded-md">
                  <AirPlaneIcon className="size-5"/>
                </button>
              </div>
            </Container>
          </div>
        );
      })}

      <Modal
        isOpen={modalPost}
        onClose={() => {
          setModalPost(false);
        }}
        title="Post"
      >

        <div className="w-full flex flex-row">
          <Image
            src={'/imgs/placeholder.png'}
            alt="Imagem do Post"
            className="w-2/3 aspect-[9/10] h-[50%] object-cover"
            width={500}
            height={500}
            unoptimized
          />
          <div className="w-1/3 h-[50%] p-4 text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, ducimus reiciendis in quo voluptatum quidem rem earum quos nulla error delectus magni incidunt? Debitis, repellendus omnis? Rem reprehenderit soluta nihil!
          </div>
        </div>

      </Modal>

    </>
  );
}
