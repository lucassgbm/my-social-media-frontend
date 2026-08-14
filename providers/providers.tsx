"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToasterProvider } from "./toaster-provider";
import { rehydrateUiPreferences } from "../stores/use-ui-store";

/**
 * Padrões do cache de servidor.
 *
 * `staleTime` de 1 minuto é o que faz sair e voltar de uma tela reaproveitar o
 * que já está em memória em vez de refazer o GET — hoje cada montagem dispara
 * a requisição de novo.
 *
 * `refetchOnWindowFocus` fica desligado por causa das imagens: as URLs do R2
 * são assinadas a cada resposta, então revalidar ao voltar para a aba trocaria
 * todas as fotos da tela de uma vez. Telas que queiram esse comportamento
 * (feed, notificações) podem ligá-lo na própria query.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // Um cliente por montagem, e não um no escopo do módulo: no servidor o
  // módulo é compartilhado entre requisições e o cache de um usuário vazaria
  // para o próximo.
  const [queryClient] = useState(makeQueryClient);

  // As preferências salvas entram depois do primeiro render — ver a nota de
  // `skipHydration` em stores/use-ui-store.ts.
  useEffect(() => {
    rehydrateUiPreferences();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Na raiz para que login e área logada compartilhem a mesma pilha de avisos */}
        <ToasterProvider>{children}</ToasterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
