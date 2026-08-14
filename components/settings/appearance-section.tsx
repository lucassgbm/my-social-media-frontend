'use client';

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import type { ComponentType } from "react";
import Skeleton from "../skeleton";
import SettingsSection from "./settings-section";
import PaintBrushIcon from "../icons/paint-brush";
import SunIcon from "../icons/sun";
import MoonIcon from "../icons/moon";
import SettingsIcon from "../icons/settings";
import CheckIcon from "../icons/check";

type ThemeOption = {
    value: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
};

/** Os mesmos valores aceitos pelo `setTheme` do next-themes. */
const OPTIONS: ThemeOption[] = [
    { value: "light", label: "Claro", description: "Sempre claro", icon: SunIcon },
    { value: "dark", label: "Escuro", description: "Sempre escuro", icon: MoonIcon },
    {
        value: "system",
        label: "Sistema",
        description: "Acompanha o aparelho",
        icon: SettingsIcon,
    },
];

/**
 * Escolha do tema.
 *
 * A preferência fica no navegador, guardada pelo próprio next-themes — é a
 * mesma escolha do botão de tema do cabeçalho, que alterna entre claro e
 * escuro. Aqui a opção "Sistema" também está disponível, e é ela que o botão
 * do cabeçalho não consegue oferecer.
 */
export default function AppearanceSection() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // o tema real só é conhecido no cliente: renderizar a seleção antes disso
    // dá erro de hidratação
    useEffect(() => setMounted(true), []);

    return (
        <SettingsSection
            icon={PaintBrushIcon}
            title="Aparência"
            description="Vale para este navegador. Em outro dispositivo, escolha de novo."
        >
            {!mounted ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:max-w-xl">
                    {OPTIONS.map((option) => (
                        <Skeleton key={option.value} height="h-[92px]" rounded="card" />
                    ))}
                </div>
            ) : (
                <div
                    role="radiogroup"
                    aria-label="Tema da interface"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:max-w-xl"
                >
                    {OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = theme === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setTheme(option.value)}
                                className={`relative flex flex-col items-start gap-2 rounded-card border
                                    p-3 text-left transition-colors cursor-pointer
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                    ${selected
                                        ? "border-brand bg-brand-subtle"
                                        : "border-line bg-surface hover:border-line-strong"}`}
                            >
                                {selected && (
                                    <CheckIcon className="absolute right-3 top-3 size-4 text-brand" />
                                )}

                                <Icon className={`size-5 ${selected ? "text-brand" : "text-content-muted"}`} />

                                <span className="text-sm font-semibold">{option.label}</span>
                                <span className="text-xs text-content-muted">{option.description}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {mounted && theme === "system" && (
                <p className="mt-3 text-xs text-content-subtle">
                    O seu aparelho está no tema {resolvedTheme === "dark" ? "escuro" : "claro"}.
                </p>
            )}
        </SettingsSection>
    );
}
