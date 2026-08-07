'use client';

import Link from "next/link";
import Image from "./remote-image";
import { useContext } from "react";
import { usePathname } from "next/navigation";
import { AppContext } from "@/app/(pages)/social-media/layout";
import { primaryNavItems, isNavItemActive } from "./nav-items";

export default function BottomMenu() {
    const context = useContext(AppContext);
    const pathname = usePathname();
    const { myInfo } = context;

    const profileHref = myInfo?.name
        ? `/social-media/profile/${myInfo.name}`
        : "/social-media/profile";

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

                {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(item.href, pathname);

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex items-center justify-center rounded-full p-2.5
                                    transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                    ${active
                                        ? "bg-brand-subtle text-brand"
                                        : "text-content hover:bg-surface-2"
                                    }`}
                            >
                                <Icon className="size-6" />
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
