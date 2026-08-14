'use client';

import Link from "next/link";
import Image from "./remote-image";
import { usePathname } from "next/navigation";
import { useMyInfo } from "../stores/use-session-store";
import { primaryNavItems, isNavItemActive, type NavItem } from "./nav-items";

/**
 * Fora da barra do mobile — continua na sidebar e no menu do cabeçalho.
 * A lista é a mesma (primaryNavItems) para os rótulos e ícones não divergirem;
 * só o recorte é daqui.
 */
const HIDDEN_HREFS = ["/social-media/friends"];

/** Item em destaque: fica no meio da barra e um pouco maior que os demais. */
const FEATURED_HREF = "/social-media/events";

/**
 * Reordena para o item em destaque cair no meio da barra.
 *
 * A foto do perfil ocupa a primeira posição, então a barra tem
 * `items.length + 1` alvos e o índice do meio no array é um a menos que o
 * índice do meio na barra.
 */
function withFeaturedCentered(items: NavItem[]): NavItem[] {
    const featured = items.find((item) => item.href === FEATURED_HREF);

    if (!featured) return items;

    const rest = items.filter((item) => item.href !== FEATURED_HREF);
    const center = Math.floor((items.length + 1) / 2) - 1;

    return [...rest.slice(0, center), featured, ...rest.slice(center)];
}

export default function BottomMenu() {
    const pathname = usePathname();
    const myInfo = useMyInfo();

    const profileHref = myInfo?.name
        ? `/social-media/profile/${myInfo.name}`
        : "/social-media/profile";

    const menuItems = withFeaturedCentered(
        primaryNavItems.filter((item) => !HIDDEN_HREFS.includes(item.href))
    );

    return (
        // fixed inset-x-0: independente do padding do container pai
        // (antes usava -ml-6 para compensar, o que quebrava em outras larguras)
        <nav
            aria-label="Navegação principal"
            className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line
                bg-surface pb-[env(safe-area-inset-bottom)]"
        >
            <ul className="flex list-none items-center justify-around px-2 py-1.5">
                <li>
                    <Link
                        href={profileHref}
                        aria-label="Meu perfil"
                        className="flex items-center justify-center rounded-full p-1.5
                            hover:bg-surface-2 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        <Image
                            src={myInfo?.photo ?? '/imgs/placeholder.png'}
                            alt=""
                            className="w-9 h-9 rounded-full aspect-square object-cover"
                            width={36}
                            height={36}
                            sizes="36px"
                        />
                    </Link>
                </li>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(item.href, pathname);
                    const featured = item.href === FEATURED_HREF;

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex items-center justify-center rounded-full
                                    transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                    ${featured ? "p-3" : "p-2.5"}
                                    ${active
                                        ? "bg-brand-subtle text-brand"
                                        : "text-content hover:bg-surface-2"
                                    }`}
                            >
                                <Icon className={featured ? "size-7" : "size-6"} />
                                {item.badge ? (
                                    <span
                                        className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center
                                            rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
                                        aria-hidden="true"
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
