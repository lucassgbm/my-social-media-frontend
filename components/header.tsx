'use client';

import { useContext, useEffect, useRef, useState } from "react";
import Image from "./remote-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CloseIcon from "./icons/close";
import MenuIcon from "./icons/menu";
import ThemeToggle from "./theme-toggle";
import InboxIcon from "./icons/inbox";
import { AppContext } from "@/app/(pages)/social-media/layout";
import Skeleton from "./skeleton";
import Button from "./button";
import RingImage from "./ring-image";
import Submenu from "./submenu";
import GlobalSearch from "./search/global-search";
import { accountNavItems, primaryNavItems, isNavItemActive } from "./nav-items";

export default function Header() {
    const context = useContext(AppContext);
    const pathname = usePathname();
    const { myInfo, openMessages, setOpenMessages } = context;

    const [accountOpen, setAccountOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const accountRef = useRef<HTMLDivElement>(null);
    const mobileRef = useRef<HTMLDivElement>(null);

    // Fecha os menus ao clicar fora ou pressionar Esc.
    useEffect(() => {
        if (!accountOpen && !mobileOpen) return;

        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (accountRef.current && !accountRef.current.contains(target)) {
                setAccountOpen(false);
            }
            if (mobileRef.current && !mobileRef.current.contains(target)) {
                setMobileOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAccountOpen(false);
                setMobileOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [accountOpen, mobileOpen]);

    const imageUser = myInfo?.photo ?? '/imgs/placeholder.png';

    return (
        <header className="relative flex w-full justify-center border-b border-line bg-surface">
            <nav className="flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 lg:px-6">

                <div className="flex shrink-0 items-center">
                    <Link
                        href="/social-media"
                        aria-label="Ir para a página inicial"
                        className="rounded-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                    >
                        <Image
                            src="/imgs/logo_social_media.png"
                            alt="Social Media"
                            width={100}
                            height={100}
                            className="w-[90px] h-auto hidden dark:block"
                            priority
                        />
                        <Image
                            src="/imgs/logo_social_media_blank.png"
                            alt="Social Media"
                            width={100}
                            height={100}
                            className="w-[90px] h-auto block dark:hidden"
                            priority
                        />
                    </Link>
                </div>

                <GlobalSearch className="hidden md:block flex-1 max-w-md" />

                <div className="hidden md:flex shrink-0 items-center gap-4">
                    <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => setOpenMessages(!openMessages)}
                            aria-label="Mensagens"
                            aria-expanded={openMessages}
                        >
                            <InboxIcon className="size-6" />
                        </Button>
                        <ThemeToggle />
                    </div>

                    {myInfo ? (
                        <div className="relative" ref={accountRef}>
                            <button
                                type="button"
                                onClick={() => setAccountOpen(!accountOpen)}
                                aria-label="Abrir menu da conta"
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                                className="flex rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                <RingImage>
                                    <Image
                                        src={imageUser}
                                        alt=""
                                        className="rounded-full w-[45px] aspect-square object-cover"
                                        width={45}
                                        height={45}
                                        sizes="45px"
                                    />
                                </RingImage>
                            </button>

                            {accountOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full mt-3 w-[280px] rounded-card border border-line
                                        bg-surface p-3 text-content shadow-lg z-50"
                                >
                                    <div className="flex flex-row items-center gap-3 border-b border-line p-2 pb-3 mb-2">
                                        <Image
                                            src={imageUser}
                                            alt=""
                                            className="rounded-full w-10 aspect-square object-cover"
                                            width={40}
                                            height={40}
                                            sizes="40px"
                                        />
                                        <span className="text-sm font-semibold truncate">{myInfo.name}</span>
                                    </div>
                                    <ul className="list-none">
                                        <Submenu
                                            items={accountNavItems}
                                            onNavigate={() => setAccountOpen(false)}
                                        />
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Skeleton height="h-[45px]" width="w-[45px]" rounded="full" className="aspect-square" />
                    )}
                </div>

                <div className="md:hidden" ref={mobileRef}>
                    <Button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
                    </Button>

                    {mobileOpen && (
                        // top-full ancora no header — antes era top-14 fixo,
                        // que quebrava se a altura do header mudasse.
                        <div className="absolute left-0 top-full w-full border-b border-line bg-surface p-4 shadow-lg z-50">
                            {/* fecha o menu ao escolher um resultado: sem isso
                                a gaveta continuaria aberta sobre a nova tela */}
                            <GlobalSearch onNavigate={() => setMobileOpen(false)} />

                            <div className="mt-4 flex w-full justify-end border-b border-line pb-3">
                                <ThemeToggle />
                            </div>

                            <ul className="mt-3 list-none">
                                {primaryNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isNavItemActive(item.href, pathname);

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={active ? "page" : undefined}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex w-full items-center gap-3 rounded-field p-2 mb-1 transition-colors
                                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                                    ${active
                                                        ? "bg-brand-subtle text-brand font-semibold"
                                                        : "text-content hover:bg-surface-2"
                                                    }`}
                                            >
                                                <span className="flex items-center justify-center rounded-full bg-surface-3 p-2">
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="text-sm font-semibold">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

                                <li aria-hidden="true" className="my-2 border-t border-line" />

                                <Submenu
                                    items={accountNavItems}
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            </ul>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
