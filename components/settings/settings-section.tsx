import type { ComponentType, ReactNode } from "react";

type SettingsSectionProps = {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    /** Selo à direita do título (ex.: "Ativa"/"Desativada" no 2FA). */
    badge?: ReactNode;
    children: ReactNode;
};

/**
 * Bloco da tela de configurações: ícone, título, explicação e o controle.
 *
 * As quatro seções (senha, duas etapas, bloqueados e aparência) têm o mesmo
 * cabeçalho — sem isto, cada uma repetiria a mesma marcação e elas divergiriam
 * na primeira alteração de espaçamento.
 */
export default function SettingsSection({
    icon: Icon,
    title,
    description,
    badge,
    children,
}: SettingsSectionProps) {
    return (
        <section className="rounded-card border border-line bg-surface-2 p-4 sm:p-5">
            <div className="flex flex-row items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-card
                    bg-brand-subtle text-brand">
                    <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">{title}</h2>
                        {badge}
                    </div>

                    {description && (
                        <p className="mt-1 text-sm text-content-muted">{description}</p>
                    )}

                    <div className="mt-4">{children}</div>
                </div>
            </div>
        </section>
    );
}
