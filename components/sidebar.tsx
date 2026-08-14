'use client';

import { type ComponentType } from "react";
import Image from "./remote-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./container";
import Skeleton from "./skeleton";
import { useMyInfo } from "../stores/use-session-store";
import { useUiStore } from "../stores/use-ui-store";
import Card from "./card";
import RingImage from "./ring-image";
import PinIcon from "./icons/pin";
import UsersIcon from "./icons/users";
import CommunityIcon from "./icons/community";
import ArrowLeftIcon from "./icons/arrow-left";
import ArrowRightIcon from "./icons/arrow-right";
import {
    primaryNavItems,
    secondaryNavItems,
    isNavItemActive,
    type NavItem,
} from "./nav-items";
import { compactCount } from "../utils/format";

function SidebarLink({
    item,
    active,
    expanded,
}: {
    item: NavItem;
    active: boolean;
    expanded: boolean;
}) {
    const Icon = item.icon;

    return (
        <li>
            <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={`relative flex w-full items-center gap-3 rounded-field px-3 py-2
                    transition-colors cursor-pointer
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                    ${expanded ? "lg:justify-start justify-center" : "justify-center"}
                    ${active
                        ? "bg-brand-subtle text-brand font-semibold"
                        : "text-content hover:bg-surface-2"
                    }`}
            >
                <span className="relative shrink-0">
                    <Icon className="size-5" />
                    {item.badge ? (
                        <span
                            className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center
                                rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
                            aria-hidden="true"
                        >
                            {item.badge}
                        </span>
                    ) : null}
                </span>

                {/* No modo recolhido o rótulo fica só no title/aria */}
                <span className={expanded ? "hidden lg:inline text-sm" : "sr-only"}>
                    {item.label}
                </span>

                {item.badge ? (
                    <span className="sr-only">{`${item.badge} não lidas`}</span>
                ) : null}
            </Link>
        </li>
    );
}

/**
 * Uma linha do quadro de números do perfil (amigos, comunidades).
 *
 * O valor vem de GET /social-media/user — antes eram 213 e 16 escritos à mão.
 * Recolhida, a sidebar mostra só o ícone e o número; o rótulo fica no `title`
 * e no leitor de tela.
 */
function SidebarCount({
    icon: Icon,
    label,
    value,
    loading,
    expanded,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value?: number;
    loading: boolean;
    expanded: boolean;
}) {
    return (
        <div className="flex w-full flex-row items-center justify-between gap-2" title={label}>
            <span className="flex items-center gap-2 text-content-muted">
                <Icon className="size-3.5 shrink-0" />
                <span className={expanded ? "hidden lg:inline text-[11px]" : "sr-only"}>
                    {label}
                </span>
            </span>

            {loading ? (
                <Skeleton height="h-3" width="w-6" rounded="sm" />
            ) : (
                // title com o número exato: o formato compacto arredonda para baixo
                <span className="text-[11px] font-semibold" title={String(value ?? 0)}>
                    {compactCount(value)}
                </span>
            )}
        </div>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const myInfo = useMyInfo();

    // Começa expandida no servidor e no primeiro render; a preferência salva é
    // aplicada depois da montagem para não gerar divergência de hidratação —
    // quem faz isso agora é o `persist` do store, com `skipHydration`.
    const collapsed = useUiStore((state) => state.sidebarCollapsed);
    const toggle = useUiStore((state) => state.toggleSidebar);

    const expanded = !collapsed;
    const imageUser = myInfo?.photo ?? '/imgs/placeholder.png';

    return (
        <aside
            aria-label="Navegação principal"
            className={`sticky top-4 hidden md:flex h-[calc(100vh-2rem)] shrink-0
                transition-[width] duration-200 ease-out
                ${expanded ? "w-20 lg:w-60" : "w-20"}`}
        >
            <Container className="flex w-full flex-col justify-between rounded-card overflow-hidden" padding="p-3">
                <div className="flex flex-col">

                    {/* Recolher/expandir só faz sentido a partir de lg, onde há espaço para os rótulos */}
                    <div className="hidden lg:flex justify-end mb-2">
                        <button
                            type="button"
                            onClick={toggle}
                            aria-label={expanded ? "Recolher menu" : "Expandir menu"}
                            aria-expanded={expanded}
                            title={expanded ? "Recolher menu" : "Expandir menu"}
                            className="rounded-full p-1.5 text-content-muted bg-surface-2 hover:bg-surface-3 hover:text-content
                                transition-colors cursor-pointer
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                        >
                            {expanded ? (
                                <ArrowLeftIcon className="size-4" />
                            ) : (
                                <ArrowRightIcon className="size-4" />
                            )}
                        </button>
                    </div>

                    {myInfo ? (
                        <div className={`flex flex-col ${expanded ? "items-center lg:items-start" : "items-center"}`}>
                            <Link
                                href={`/social-media/profile/${myInfo?.name}`}
                                title={myInfo.name}
                                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <RingImage className="relative w-[56px]">
                                    <Image
                                        src={imageUser}
                                        alt={`Foto de perfil de ${myInfo.name}`}
                                        className="rounded-full aspect-square object-cover"
                                        width={56}
                                        height={56}
                                        sizes="56px"
                                        priority
                                    />
                                </RingImage>
                            </Link>

                            <p className={`mt-2 w-full text-sm font-semibold truncate ${expanded ? "hidden lg:block" : "hidden"}`}>
                                {myInfo.name}
                            </p>

                            {/* a linha inteira sai quando não há UF: o pin
                                sozinho não diz nada. Era "DF" fixo no código */}
                            {myInfo.uf && (
                                <div className="flex mt-2 items-center gap-1">
                                    <PinIcon className="size-3 text-brand" />
                                    <span className="text-[11px] text-content-muted">
                                        {myInfo.uf}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-row items-center justify-center gap-2 mb-6">
                            <Skeleton height="h-[56px]" width="w-[56px]" rounded="full" className="aspect-square" />
                        </div>
                    )}

                    <Card className="flex flex-col gap-1.5 p-2.5 mt-4">
                        <SidebarCount
                            icon={UsersIcon}
                            label="Amigos"
                            value={myInfo?.friends_count}
                            loading={!myInfo}
                            expanded={expanded}
                        />
                        <SidebarCount
                            icon={CommunityIcon}
                            label="Comunidades"
                            value={myInfo?.communities_count}
                            loading={!myInfo}
                            expanded={expanded}
                        />
                    </Card>

                    <nav className="mt-6" aria-label="Seções">
                        <ul className="flex flex-col gap-1 list-none">
                            {primaryNavItems.map((item) => (
                                <SidebarLink
                                    key={item.href}
                                    item={item}
                                    expanded={expanded}
                                    active={isNavItemActive(item.href, pathname)}
                                />
                            ))}
                        </ul>
                    </nav>
                </div>

                <nav aria-label="Atalhos">
                    <ul className="flex flex-col gap-1 list-none">
                        {secondaryNavItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                expanded={expanded}
                                active={isNavItemActive(item.href, pathname)}
                            />
                        ))}
                    </ul>
                </nav>
            </Container>
        </aside>
    );
}
