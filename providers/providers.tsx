"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ToasterProvider } from "./toaster-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Na raiz para que login e área logada compartilhem a mesma pilha de avisos */}
      <ToasterProvider>{children}</ToasterProvider>
    </ThemeProvider>
  );
}
