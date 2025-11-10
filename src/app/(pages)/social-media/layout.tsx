'use client';

import { get } from "@/api/services/request";
import { createContext, useEffect, useState } from "react";
import Header from "../../../../components/header";
import Sidebar from "../../../../components/sidebar";
import BottomMenu from "../../../../components/bottom-menu";
import Footer from "../../../../components/footer";
import Messages from "../../../../components/messages";

type MyInfo = {
  name: string;
  photo: string;
  autodescription: string;
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

  useEffect(() => {
    getMyInfo();
  }, []);

  const [myInfo, setMyInfo] = useState<MyInfo | null>(null);

  const [openMessages, setOpenMessages] = useState(false);

  async function getMyInfo() {

    try {
      const response = await get("/social-media/user");
      setMyInfo(response.data);
    } catch (error: any) {

      console.log(error);
      // setToaster({ show: true, message: "Erro ao carregar informações" });
    }

  }

  return (
    /*openMessages, setOpenMessages*/
    <AppContext.Provider value={{ myInfo, setMyInfo, openMessages, setOpenMessages }}>
      <Header />
        <div className="dark:bg-neutral-950 bg-neutral-100">
          <div className="grid grid-cols-10 sm:flex-row min-h-screen p-6 gap-6 text-gray-600 max-w-7xl mx-auto">
            <Sidebar />
            {children}
            {openMessages && (

              <Messages openMessages={openMessages} setOpenMessages={setOpenMessages} />
            )}
            <Footer />
            <BottomMenu />
          </div>
        </div>
    </AppContext.Provider>

  );
}