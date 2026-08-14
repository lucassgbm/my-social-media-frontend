'use client';

import { useEffect } from "react";
import Header from "../../../../components/header";
import BottomMenu from "../../../../components/bottom-menu";
import Messages from "../../../../components/messages";
import { RealtimeProvider } from "../../../../providers/realtime-provider";
import { useSessionStore } from "../../../../stores/use-session-store";
import { useUiStore } from "../../../../stores/use-ui-store";

/**
 * Casca da área logada.
 *
 * A sessão e a gaveta de mensagens moravam num `AppContext` criado e exportado
 * daqui. Um arquivo de layout do App Router só pode exportar o componente e as
 * chaves que o Next conhece (`metadata`, `generateStaticParams`...), então
 * aquele `export const AppContext` derrubava o `tsc` a cada verificação. Agora
 * são stores em `stores/`, importáveis de qualquer lugar sem passar pelo
 * arquivo de rota.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const loadMyInfo = useSessionStore((state) => state.loadMyInfo);
  const openMessages = useUiStore((state) => state.openMessages);

  useEffect(() => {
    loadMyInfo();
  }, [loadMyInfo]);

  return (
    <>
      {/* A conexão vive acima do painel: ela precisa continuar de pé com a
          gaveta fechada, senão o contador de não lidas do Header congela. */}
      <RealtimeProvider>
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

          {openMessages && <Messages />}
        </div>

        <BottomMenu />
      </RealtimeProvider>
    </>
  );
}
