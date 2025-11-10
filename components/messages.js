import Image from "next/image";
import Container from "./container";
import Card from "./card";

import { useContext, useEffect, useState } from "react";
import AirPlaneIcon from "./icons/airplane";
import Button from "./button";
import ButtonNew from "./color-button";
import CloseIcon from "./icons/close";
import MessageIcon from "./icons/message";
import BellIcon from "./icons/bell";
import { AppContext } from "@/app/(pages)/social-media/layout";

export default function Messages(props) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [tab, setTab] = useState("messages");
  const context = useContext(AppContext);
  const { myInfo } = context;
  const [searchFriend, setSearchFriend] = useState("");

  useEffect(() => {

  }, []);
  const sendMessage = () => {

  };
  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-[650px] flex flex-col z-50">
      <Container className="flex flex-row h-screen border-l border-neutral-100 dark:border-neutral-700/30" padding="p-0">
        <div className="flex flex-col p-2 justify-between">

          <div className="flex flex-col">
            <Button onClick={() => props.setOpenMessages(false)}>
              <CloseIcon />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setTab("notifications")}>
              <BellIcon />
            </Button>
            <Button onClick={() => setTab("messages")}>
              <MessageIcon />
            </Button>

          </div>

        </div>
        <div className="w-full flex flex-col flex border-l border-neutral-100 dark:border-neutral-700/30">
          {/* <div className="flex justify-end">

                  <Button onClick={() => props.setOpenMessages(false)}>
                    <CloseIcon className="size-4 " />
                  </Button>
                </div> */}


          {tab === "messages" && (
            <>

              <div className="flex flex-row">
                <div className="w-[34%] flex flex-col p-2">
                  <input
                    className="w-full text-sm text-gray-700 dark:text-white py-2 px-3 bg-white dark:bg-neutral-800 focus:outline-neutral-400 rounded-md mb-2"
                    type="text"
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    placeholder="Procurar amigo"
                  />
                  <div className="flex flex-col h-screen gap-2 rounded-md">
                    <div className="w-full flex flex-row gap-4 items-center">
                      <Image
                        src="/imgs/placeholder.png"
                        alt="Foto de perfil"
                        width={50}
                        height={50}
                        className="w-[30px] rounded-full aspect-[1/1] object-cover"
                      />
                      <div className="flex flex-col w-full">
                        <div className="flex flex-row gap-2 justify-between">

                          <div className="flex flex-col">

                            <h3>Fulano</h3>
                            <span className="text-xs text-green-500">3 mensagens</span>
                          </div>
                          <span className="flex items-center text-xs text-neutral-500">22:45</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex flex-row gap-4 items-center">
                      <Image
                        src="/imgs/placeholder.png"
                        alt="Foto de perfil"
                        width={50}
                        height={50}
                        className="w-[30px] rounded-full aspect-[1/1] object-cover"
                      />
                      <div className="flex flex-col w-full">
                        <div className="flex flex-row gap-2 justify-between">

                          <div className="flex flex-col">

                            <h3>Ciclano</h3>
                            <span className="text-sm text-green-500"></span>
                          </div>
                          <span className="flex items-center text-xs text-neutral-500">8:17</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[66%] flex flex-col border-l border-neutral-100 dark:border-neutral-700/30 p-2 h-screen">
                  <div className="w-full flex flex-row gap-4">
                    <div className="relative">
                      <Image
                        src="/imgs/placeholder.png"
                        alt="Foto de perfil"
                        width={50}
                        height={50}
                        className="w-[30px] rounded-full aspect-[1/1] object-cover"
                      />
                      <div className={`absolute inset-0 after:content-[''] after:absolute after:w-4 after:h-4 after:bg-green-500 after:rounded-full after:border-2 after:border-white after:bottom-0 after:right-0`}></div>
                    </div>
                    <h1 className="font-bold text-lg mt-2">Nome fulano</h1>
                  </div>
                  <div className="flex flex-col h-full">
                    <Card className="mt-2 flex flex-col h-full">

                      <div id="messages" className="overflow-y-auto p-2 h-full">

                        {messages.map((msg, idx) => (
                          <div key={idx} className="flex flex-row text-sm">
                            {msg}
                          </div>
                        ))}
                        <div className="flex flex-row gap-2 mt-2 justify-start">
                          <p className="text-sm bg-amber-200 py-1 px-2 rounded-md text-neutral-800 border border-amber-300 shadow-md">Olá, tudo bem? <span className="text-[10px] text-neutral-600">9:00</span></p>
                        </div>
                        <div className="flex flex-row gap-2 mt-2 justify-end">
                          <p className="text-sm bg-amber-200 py-1 px-2 rounded-md text-neutral-800 border border-amber-300 shadow-md">tudo e com você? <span className="text-[10px] text-neutral-600">9:02</span></p>
                        </div>
                      </div>
                      <span className="flex flex-end text-xs">fulano está digitado...</span>

                    </Card>

                    <div className="flex flex-row bg-neutral-100 dark:bg-neutral-800 dark:text-white w-full rounded-full mt-2 p-2 gap-2">
                      <input
                        type="text"
                        placeholder="Digite uma mensagem"
                        className="w-full hover:text-border-0 ml-2 focus:outline-none rounded-full bg-neutral-100 dark:bg-neutral-800 dark:text-white text-neutral-800"
                        onChange={(e) => setInputMessage(e.target.value)}
                      />

                      <ButtonNew onClick={(e) => handlePost(e)}>
                        <AirPlaneIcon className="size-6 dark:text-white text-neutral-800" />
                      </ButtonNew>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}

          {tab === "notifications" && (
            <div className="flex flex-col h-screen">
              <Card className="flex">

                <div>Notifications</div>

              </Card>

            </div>
          )}
        </div>

      </Container>
    </div>
  )
}