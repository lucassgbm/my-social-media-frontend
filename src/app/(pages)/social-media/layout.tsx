'use client';

import { get } from "@/api/services/request";
import { createContext, useEffect, useState } from "react";
import Header from "../../../../components/header";
import BottomMenu from "../../../../components/bottom-menu";
import Messages from "../../../../components/messages";

/**
 * Espelha App\Http\Resources\UserResource (GET /social-media/user).
 * Os campos nullable no banco chegam como null — daí os opcionais.
 */
export type MyInfo = {
  id: number;
  name: string;
  email: string;
  /** URL assinada e temporária do R2 (10 min). Vazia quando não há foto. */
  photo: string;
  /** Caminho cru no bucket, sem assinatura. */
  photo_url?: string | null;
  autodescription: string;
  birthdate?: string | null;
  age?: number | null;
  city?: string | null;
  uf?: string | null;
  phone?: string | null;
};

type AppContextType = {
  myInfo: MyInfo | null;
  setMyInfo: React.Dispatch<React.SetStateAction<MyInfo | null>>;
  openMessages: boolean;
  setOpenMessages: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
  const [openMessages, setOpenMessages] = useState(false);

  useEffect(() => {
    getMyInfo();
  }, []);

  async function getMyInfo() {
    try {
      const response = await get("/social-media/user");
      setMyInfo(response.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <AppContext.Provider value={{ myInfo, setMyInfo, openMessages, setOpenMessages }}>
      <Header />

      <div className="min-h-screen bg-canvas text-content">
        {/*
          Layout em flex: a Sidebar controla a própria largura (w-20 / lg:w-60) e o
          conteúdo ocupa o restante. Antes era um grid de 10 colunas arbitrário, que
          espremia a sidebar em 1/10 e obrigava a usar frações como w-5/7.
          pb-24 no mobile reserva espaço para o BottomMenu fixo.
        */}
        <div className="mx-auto flex w-full max-w-7xl gap-4 p-4 pb-24 md:pb-6 lg:gap-6 lg:p-6 lg:pb-6">
          {children}
        </div>

        {openMessages && (
          <Messages openMessages={openMessages} setOpenMessages={setOpenMessages} />
        )}
      </div>

      <BottomMenu />
    </AppContext.Provider>
  );
}
