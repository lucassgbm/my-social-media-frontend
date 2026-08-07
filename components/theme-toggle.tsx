"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SunIcon from "./icons/sun";
import MoonIcon from "./icons/moon";
import Button from "./button";
import Skeleton from "./skeleton";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação: o tema real só é conhecido no cliente.
  useEffect(() => setMounted(true), []);

  // Placeholder do mesmo tamanho evita layout shift ao montar.
  if (!mounted) {
    return <Skeleton height="h-[40px]" width="w-[40px]" rounded="full" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {isDark ? <SunIcon className="size-6" /> : <MoonIcon className="size-6" />}
    </Button>
  );
}
