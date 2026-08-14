import type { ComponentType, ReactNode } from "react";

type PageHeaderProps = {
    icon: ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
    /** Ação principal da tela, alinhada à direita do título. */
    action?: ReactNode;
    /** Busca, atalhos e barra de filtros — empilhados abaixo do título. */
    children?: ReactNode;
};

/**
 * Cabeçalho-capa das telas de listagem (comunidades, amigos, eventos).
 *
 * Cada tela repetia um `h1` solto com um texto à direita. Aqui a seção ganha
 * uma faixa própria: fundo em degradê cinza, ícone em destaque e um lugar
 * definido para a busca e os filtros, que antes flutuavam no topo do conteúdo.
 *
 * Vai dentro de um Container com `padding="p-0"` — o `rounded-t-card` acompanha
 * o canto do container e o `overflow-hidden` corta o degradê nele.
 */
export default function PageHeader({
    icon: Icon,
    title,
    subtitle,
    action,
    children,
}: PageHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-t-card border-b border-line">
            
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-surface-1
                    dark:bg-linear-to-br dark:bg-surface-2"
            />
            {/* o brilho difuso acompanha o degradê: sem ele, no claro, sobrava
                um borrão cinza no canto de uma faixa chapada */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-24 hidden size-56 rounded-full
                    bg-content-subtle/20 blur-3xl dark:block"
            />

            <div className="relative flex flex-col gap-5 p-4 sm:p-6">
                <div className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-row items-center gap-3 min-w-0">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-card
                            bg-brand text-on-brand shadow-sm">
                            <Icon className="size-6" />
                        </span>

                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-content-muted">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {action}
                </div>

                {children}
            </div>
        </div>
    );
}
