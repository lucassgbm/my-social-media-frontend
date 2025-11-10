/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { AppContext } from "@/app/(pages)/social-media/layout";
import Modal from "./modal";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CameraIcon from "./icons/camera";
import Container from "./container";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import PlusIcon from "./icons/plus";



const PlayIcon = ({ className }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"lucide lucide-play-icon lucide-play " + className}
    >
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  );
};

const PauseIcon = ({ className }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"lucide lucide-pause-icon lucide-pause " + className}
    >
      <rect x="14" y="3" width="5" height="18" rx="1" />
      <rect x="5" y="3" width="5" height="18" rx="1" />
    </svg>
  );
};

const HeartIcon = ({ className }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"lucide lucide-heart-icon lucide-heart " + className}
    >
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </svg>
  );
};

const Backdrop = ({ onClose }: any) => {
  return (
    <div
      className="flex fixed inset-0 z-[1000]"
      style={{
        pointerEvents: "auto",
        overflow: "hidden",
        backgroundColor: "rgba(1, 1, 1, 0.8)",
        opacity: 1,
      }}
      onClick={() => {
        onClose();
      }}
    />
  );
};

const ProgressBar = ({ slides, progress }: any) => {
  return (
    <div className="flex flex-row gap-1 px-4 py-2">
      {slides.map((_: any, i: number) => (
        <div
          key={i}
          className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-white transition-[width] ease-linear"
            style={
              { width: `${progress[i] || 0}%` }
            }
          />
        </div>
      ))
    }
    </div>
  );
};

const UserRow = ({ data, postingTime }: any) => {
  return (
    <div id="user">
      <div className="flex flex-row gap-3 items-center">
        <img
          src={data.avatarUrl}
          alt={data.user}
          className="w-7 h-7 rounded-full drop-shadow-xl"
        />
        <span className="text-white drop-shadow-2xl font-medium">
          {data.user}
        </span>
        <span className="text-white opacity-75 drop-shadow-2xl">
          {postingTime}
        </span>
      </div>
    </div>
  );
};

const Options = ({ isPlaying, setIsPlaying }: any) => {
  return (
    <div className="flex flex-row gap-4">
      <button
        className="cursor-pointer outline-0 hover:brightness-90 drop-shadow-2xl"
        onClick={() => {
          setIsPlaying(!isPlaying);
        }}
      >
        {isPlaying && <PauseIcon className="fill-white stroke-white w-4 h-4" />}
        {!isPlaying && <PlayIcon className="fill-white stroke-white w-4 h-4" />}
      </button>
    </div>
  );
};

const Topbar = ({
  slides,
  progress,
  showing,
  item,
  isPlaying,
  setIsPlaying,
}: any) => {
  return (
    <div className="flex flex-col gap-2 py-2 absolute z-20 w-full">
      <ProgressBar slides={slides} progress={progress} />
      <div className="flex flex-row items-center justify-between px-4">
        <UserRow data={item} postingTime={slides[showing].postingTime} />
        <Options isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
    </div>
  );
};

const BottomBar = ({
  item,
  setItems,
  showing,
  slides,
  likeStory,
  commentStory,
}: any) => {
  const [text, setText] = useState("");

  // Build a stable "storyId" for the backend (ownerId + index)
  const ownerId = item?.id;
  const storyId = ownerId != null ? `${ownerId}:${showing}` : null;

  const handleSubmit = async () => {
    if (!text.trim() || storyId == null) return;
    try {
      await commentStory(text.trim(), ownerId, storyId);
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async () => {
    if (storyId == null) return;
    // Optimistic UI: toggle immediately
    setItems((prev: any) =>
      prev.map((it: any) => {
        if (it.id !== item.id) return it;
        return {
          ...it,
          slides: it.slides.map((sl: any, idx: number) =>
            idx === showing ? { ...sl, liked: !sl.liked } : sl
          ),
        };
      })
    );
    try {
      await likeStory(ownerId, storyId);
    } catch (e) {
      console.error(e);
      // Revert on error
      setItems((prev: any) =>
        prev.map((it: any) => {
          if (it.id !== item.id) return it;
          return {
            ...it,
            slides: it.slides.map((sl: any, idx: number) =>
              idx === showing ? { ...sl, liked: !sl.liked } : sl
            ),
          };
        })
      );
    }
  };

  const liked = slides?.[showing]?.liked;

  return (
    <div className="absolute bottom-4 gap-8 w-full px-5 z-20 flex flex-row items-center justify-between">
      <input
        className="border-2 border-[#cecece] rounded-full py-2 px-4 outline-0 placeholder:text-white drop-shadow-2xl w-full text-md"
        placeholder={
          item?.user ? `Responda a ${item.user}...` : "Escreva um comentário..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />

      <button
        className="cursor-pointer drop-shadow-2xl"
        onClick={handleLike}
        aria-label={liked ? "Remover like" : "Curtir"}
      >
        <HeartIcon
          className={`w-8 h-8 drop-shadow-2xl ${
            liked ? "stroke-[#FF3140] fill-[#FF3140]" : "stroke-white"
          }`}
        />
      </button>
    </div>
  );
};

export function Stories({
  data = {},
  onClose,
  setItems,
  items,
  likeStory,
  commentStory,
}: any) {
  /**
   * Features:
   * - Shows user's stories.
   * - Like on story shown and save on backend.
   * - Comment on story shown and save on backend.
   * - Press to play/pause image.
   * - Opens user selected to see its stories.
   *
   *
   * Usage example:
   *  {story.show && ( <Stories data={story.data} setItems={setItems} items={items} onClose={() => { setStory({ show: false, data: {} }); }} commentStory={commentStory} likeStory={likeStory} /> )}
   */

  const [showing, setShowing] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [didFinish, setDidFinish] = useState(false);
  const raf: any = useRef(null);
  const startRef: any = useRef(0);
  const elapsedRef: any = useRef(0);
  const downRef: any = useRef(0);
  const finishedRef: any = useRef(false);

  // --- derived
  const item = useMemo(
    () => items.find((it: any) => it.id === data.id) ?? data,
    [items, data.id]
  );
  const slides = item?.slides ?? [];
  const dur = slides[showing]?.durationMs || 0;

  // progress array (UI state)
  const [progress, setProgress] = useState(() =>
    new Array(slides.length).fill(0)
  );

  // --- helpers
  const TAP_MS = 180;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDidFinish(true);
  }, []);

  const advance = useCallback(
    (delta: any) =>
      setShowing((s) => {
        const next = s + delta;
        if (next < 0) return 0;
        if (next < slides.length) return next;
        finish();
        return s;
      }),
    [slides.length, finish]
  );

  // --- pointer handlers
  const handlePointerDown = (e: any) => {
    e.preventDefault();
    downRef.current = performance.now();
    setIsPlaying(false);
  };

  const handlePointerUp = (e: any) => {
    e.preventDefault();
    const dt = performance.now() - downRef.current;
    setIsPlaying(true);
    if (dt < TAP_MS) advance(1);
  };

  const resumeIfNeeded = () => setIsPlaying(true);

  // --- ticking
  const tick = useCallback(
    (t: any) => {
      const elapsed = elapsedRef.current + (t - startRef.current);
      const pct = Math.min((elapsed / dur) * 100, 100);

      setProgress((p) =>
        p.map((_, i) => (i === showing ? pct : i < showing ? 100 : 0))
      );

      if (pct >= 100) {
        elapsedRef.current = 0;
        if (showing < slides.length - 1) {
          setShowing((s) => s + 1);
        } else {
          finish();
        }
        return;
      }

      raf.current = requestAnimationFrame(tick);
    },
    [dur, showing, slides.length, finish]
  );

  // --- effects
  // Start/stop RAF
  useEffect(() => {
    if (!dur || didFinish || !isPlaying) return;
    startRef.current = performance.now();
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [dur, isPlaying, didFinish, tick]);

  // Pause bookkeeping
  useEffect(() => {
    if (isPlaying || didFinish || !dur || !startRef.current) return;
    elapsedRef.current += performance.now() - startRef.current;
  }, [isPlaying, didFinish, dur]);

  // When slide index changes, reset elapsed & progress for current
  useEffect(() => {
    setProgress((p) =>
      p.map((_, i) => (i < showing ? 100 : i === showing ? 0 : 0))
    );
    elapsedRef.current = 0;
  }, [showing, slides.length]);

  // When item changes, reset finish flags & slide index
  useEffect(() => {
    finishedRef.current = false;
    setDidFinish(false);
    setShowing(0);
    setProgress(new Array(slides.length).fill(0));
    elapsedRef.current = 0;
  }, [item.id, slides.length]);

  // On finish: mark seen & close
  useEffect(() => {
    if (!didFinish) return;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setItems((prev: any) =>
      prev.map((it: any) =>
        it.id === item.id ? { ...it, hasSeenAll: true } : it
      )
    );
    onClose?.();
  }, [didFinish, setItems, item.id, onClose]);

  return (
    <div>
      <Backdrop onClose={onClose} />
      <div
        className="
          bg-gray-500 w-full lg:w-[450px] md:w-[450px]
          h-full lg:h-[95%] md:h-[95%]
          fixed z-[1000] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
          rounded-md shadow-md overflow-hidden flex flex-col
        "
      >
        {!!slides.length && (
          <img
            src={slides[showing].src}
            alt={`${item.user}_story_${showing}`}
            className="z-0 w-full h-full object-cover touch-none cursor-pointer"
            style={{ touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={resumeIfNeeded}
            onPointerLeave={resumeIfNeeded}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-44 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-44 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

        <div className="absolute top-0 left-0 right-0">
          <Topbar
            slides={slides}
            progress={progress}
            showing={showing}
            item={item}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>

        <BottomBar
          item={item}
          setItems={setItems}
          showing={showing}
          slides={slides}
          likeStory={likeStory}
          commentStory={commentStory}
        />
      </div>
    </div>
  );
}

export function StoriesBar({ items = [], setStory, storyRingSize = 30 }: any) {

  const context = useContext(AppContext);
  const { myInfo } = context;
  const [isOpen, setModalNewStory] = useState(false);

  const imageUser = myInfo?.photo
    ? `${process.env.NEXT_PUBLIC_STORAGE_API?.replace(/\/$/, '')}/${myInfo.photo?.replace(/^\//, '')}`
    : null;
  /**
   * Features:
   * - Lists horizontally the users' stories.
   * - Sorts by unseen first.
   * - Sets story icon width and height.
   * - Opens user selected to see its stories.
   *
   * Usage example:
   *  <StoriesBar items={items} storyRingSize={58} setStory={setStory} />
   *
   */

  return (
    <>
      <Container className="flex flex-row w-full overflow-x-auto gap-3 scrollbar-hide mb-4" padding="p-2" transparent>
        
        <button
          className={`min-w-[60px] sm:min-w-[80px] aspect-[1/1] flex items-center justify-center cursor-pointer rounded-full
            drop-shadow-md
            transition-transform duration-300 hover:scale-110
            hover:brightness-90
            p-[3px]
            border-green-500/90 group
        `}
          style={{
            borderWidth: 3.5,
          }}
          aria-label={`New ${myInfo?.name}'s story`}
        >
          <img
            src={myInfo?.photo ?? "/imgs/placeholder.png"}
            alt={`Add new ${myInfo?.name}'s story`}
            className={`w-full aspect-[1/1] rounded-full object-cover`}
            style={{
              // width: storyRingSize,
              // height: storyRingSize,
              width: `full`,
              height: `full`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer" onClick={() => setModalNewStory(true)}>
              <CameraIcon className="size-10 text-white dark:text-neutral-300 "/>

          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <PlusIcon className="size-3"/>
          </div>
        </button>
        {items
          .sort((a: any, b: any) => a.hasSeenAll - b.hasSeenAll)
          .map((it: any) => {
            return (
              <button
                key={it.id}
                onClick={() => {
                  setStory({ show: true, data: it });
                }}
                className={`min-w-[60px] sm:min-w-[80px] aspect-[1/1] flex items-center justify-center cursor-pointer rounded-full
                  transition-transform duration-300 hover:scale-110
                  drop-shadow-md
                  hover:brightness-90
                  p-[3px]
                  ${!it.hasSeenAll ? "border-green-500/90" : "border-[#DBDBDB]"}
              `}
                style={{
                  borderWidth: 3.5,
                }}
                aria-label={`Open ${it.user}'s story`}
              >
                <img
                  src={it.avatarUrl}
                  alt={it.user}
                  className={`w-full aspect-[1/1] rounded-full object-cover `}
                  style={{
                    // width: storyRingSize,
                    // height: storyRingSize,
                    width: `full`,
                    height: `full`,
                  }}
                />
              </button>
            );
        })}
      
      </Container>
      <Modal 
          isOpen={isOpen} 
          onClose={() => setModalNewStory(false)}
          title="Novo story"
      >
          <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2">
                  <button onClick={() => setModalNewStory(false)} className="text-gray-500 hover:text-gray-700">
                      <span className="sr-only">Close</span>
                  </button>    
              </div>  
              
          </div>
      </Modal>
    </>
  );
}

export default function Page() {
  const [story, setStory]: any = React.useState({ show: false, data: {} });

  const [items, setItems] = React.useState([
    {
      id: "u1",
      user: "Sarah",
      avatarUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBQPMuNoK5SK9biSwayCuhWNufIjLF88ovmg&s",
      hasSeenAll: true,
      slides: [
        {
          type: "image",
          src: "/stories/s1-1.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: false,
        },
        {
          type: "image",
          src: "/stories/s1-1.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: false,
        },
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u2",
      user: "Michael",
      avatarUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIrcayxm7EZrNIkPciDCwVan0AnBMiWtxVwQ&s",
      hasSeenAll: false,
      slides: [
        {
          type: "image",
          src: "https://www.jessleephotos.com/images/xl/teton-overlook-autumn.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: true,
        },
        {
          type: "image",
          src: "https://i.redd.it/qvkg5jyfvywb1.jpg",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u3",
      user: "Ingrid",
      avatarUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqMOmqF3CHR7lPy8KqD9cjzZsm6Ell1hOOCQ&s",
      hasSeenAll: false,
      slides: [
        {
          type: "image",
          src: "/stories/s1-1.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: false,
        },
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u4",
      user: "Joaquim",
      avatarUrl: "https://img.freepik.com/psd-premium/ilustracao-de-avatar-3d-pro-gamer-isolado-no-fundo-transparente_846458-28.jpg?semt=ais_hybrid&w=740&q=80",
      hasSeenAll: false,
      slides: [
        {
          type: "image",
          src: "/stories/s1-1.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: false,
        },
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u5",
      user: "Pedro",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
      hasSeenAll: false,
      slides: [
        {
          type: "image",
          src: "/stories/s1-1.jpg",
          durationMs: 5000,
          caption: "Morning ☀️",
          postingTime: "15h",
          liked: false,
        },
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u6",
      user: "Pedro",
      avatarUrl:
        "https://img.freepik.com/free-photo/business-man-by-skyscraper_1303-13655.jpg?semt=ais_hybrid&w=740&q=80",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u7",
      user: "Pedro",
      avatarUrl:
        "https://img.freepik.com/free-photo/female-doctor-hospital-with-stethoscope_23-2148827774.jpg?semt=ais_hybrid&w=740&q=80",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u8",
      user: "Pedro",
      avatarUrl:
        "https://images.unsplash.com/photo-1701615004837-40d8573b6652?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u9",
      user: "Pedro",
      avatarUrl:
        "https://imgv3.fotor.com/images/homepage-feature-card/fotor-3d-avatar.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u10",
      user: "Pedro",
      avatarUrl:
        "https://img.freepik.com/free-photo/stylish-asian-woman-beanie-shows-tongue-winks-you-looks-carefree-stands-orange-sweatshi_1258-167281.jpg?semt=ais_hybrid&w=740&q=80",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u11",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u12",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u13",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u14",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
    {
      id: "u15",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },{
      id: "u16",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },{
      id: "u17",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },{
      id: "u18",
      user: "Pedro",
      avatarUrl:
        "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
      hasSeenAll: false,
      slides: [
        {
          type: "video",
          src: "/stories/s1-2.mp4",
          durationMs: 8000,
          caption: "Coffee time",
          postingTime: "20h",
          liked: false,
        },
      ],
    },
  ]);

  useEffect(() => {
    if (!story.show || !story.data?.id) return;
    const live = items.find((i) => i.id === (story.data as any).id);
    if (live && live.hasSeenAll !== (story.data as any).hasSeenAll) {
      setStory((s: any) => ({
        ...s,
        data: { ...(s.data as any), hasSeenAll: live.hasSeenAll },
      }));
    }
  }, [items, story.show, story.data]);

  const likeStory = async (userId: any, storyId: any) => {
    let req;
    try {
      req = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          storyId: storyId,
        }),
      }).then(async (res) => {
        return await res.json();
      });
    } catch (e) {
      console.log(e);
    }
  };

  const commentStory = async (comment: string, userId: any, storyId: any) => {
    let req;
    try {
      req = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          comment: comment,
          userId: userId,
          storyId: storyId,
        }),
      }).then(async (res) => {
        return await res.json();
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <StoriesBar items={items} storyRingSize={58} setStory={setStory} />

      {story.show && (
        <Stories
          data={story.data}
          setItems={setItems}
          items={items}
          onClose={() => {
            setStory({ show: false, data: {} });
          }}
          commentStory={commentStory}
          likeStory={likeStory}
        />
      )}
    </>
  );
}