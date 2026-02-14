'use client';

import { useContext, useState } from "react";
import SearchIcon from "./icons/search";
import CloseIcon from "./icons/close";
import MenuIcon from "./icons/menu";
import ThemeToggle from "./theme-toggle";
import MessageIcon from "./icons/message";
import InboxIcon from "./icons/inbox";
import { AppContext } from "@/app/(pages)/social-media/layout";
import Image from "next/image";
import Skeleton from "./skeleton";
import Button from "./button";
import RingImage from "./ring-image";
import Submenu from "./submenu";
import PhotoIcon from "./icons/photo";
import UsersIcon from "./icons/users";
import SettingsIcon from "./icons/settings";
import ArrowRightIcon from "./icons/arrow-right";

export default function Header() {

    const [open, setOpen] = useState(false);
    const context = useContext(AppContext);

    const submenuItems = [
        { label: 'Meu perfil', link: "/social-media/profile", icon: <UsersIcon /> },
        { label: 'Preferências', link: "/social-media/settings", icon: <SettingsIcon /> },
        { label: 'Sair', link: "", icon: <ArrowRightIcon /> },
    ]

    const { myInfo, openMessages, setOpenMessages } = context;

    const [mobileOpen, setMobileOpen] = useState(false);

    const imageUser = myInfo?.photo ?? '/imgs/placeholder.png';

    return (
        <header className="flex w-full bg-white dark:bg-neutral-900 justify-center">
            <nav className="w-full max-w-7xl shadow-md px-6 py-2 flex items-center justify-between">

                <div className="w-1/4 text-xl font-bold dark:text-white text-neutral-800">Logo</div>

                <div className="w-2/4 hidden md:flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg px-5 pl-5">
                    <SearchIcon className="dark:text-white" />
                    <input className="ml-2 w-full focus:outline-none w-full text-gray-600 dark:text-white rounded-sm ml-2 pr-4" type="text" placeholder="Search"></input>
                </div>

                <div className="hidden md:flex w-1/4 justify-end items-center gap-4">
                    <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => { setOpenMessages(!openMessages) }}
                        >
                            <InboxIcon className="size-6 dark:text-white" />
                        </Button>
                        <ThemeToggle />
                    </div>

                    {myInfo && (
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600 dark:text-white">{`Olá, ${myInfo?.name}`}</span>
                            <ul>
                                <li className="cursor-pointer" onClick={() => setOpen(!open)}>

                                    <RingImage>
                                        <Image
                                            src={imageUser}
                                            alt="Foto de perfil"
                                            className="rounded-full w-[45px] aspect-[1/1]"
                                            width={50}
                                            height={50}
                                        />
                                    </RingImage>
                                </li>
                                {open && (
                                    <div className="w-full sm:w-[300px] absolute right-0 mt-4 dark:bg-neutral-900 dark:text-white bg-white text-neutral-800 rounded-lg shadow-md p-4 z-50">

                                        <div className="flex flex-row gap-2 p-4 border-b dark:border-neutral-700 border-neutral-200 mb-2">
                                            <label>teste</label>
                                        </div>
                                        <ul>
                                            <Submenu items={submenuItems} />

                                        </ul>
                                    </div>
                                )}
                            </ul>
                        </div>
                    )}

                    {!myInfo && (
                        <div className="flex flex-row items-center gap-2">
                            <Skeleton rounded="sm" height={"h-[25px]"} width={"w-[120px]"} />
                            <Skeleton height={"h-[55px]"} width={"w-[55px]"} rounded="full" className="aspect-[1/1]" />
                        </div>

                    )}
                </div>

                <Button
                    className="md:hidden p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <CloseIcon className="dark:text-white cursor-pointer size-6" /> : <MenuIcon className="dark:text-white cursor-pointer" />}
                </Button>

                {mobileOpen && (
                    <div className="absolute top-14 left-0 w-full dark:bg-neutral-900 bg-white shadow-md flex flex-col p-4 gap-4 md:hidden z-100">
                        <div className="flex w-full bg-neutral-100 dark:bg-neutral-700 p-2 rounded-2xl px-5 pl-5">
                            <SearchIcon className="dark:text-white" />
                            <input className="ml-2 w-full focus:outline-none w-full text-gray-600 dark:text-white rounded-sm ml-2 pr-4" type="text" placeholder="Search"></input>
                        </div>
                        <div className="flex flex-col w-full">

                            <div className="flex w-full justify-end p-2 border-b border-neutral-700">
                                <ThemeToggle />
                            </div>
                            <ul className="text-gray-800 dark:text-white mt-2">
                                <Submenu items={submenuItems} />
                            </ul>
                        </div>
                    </div>
                )}
            </nav>
        </header>

    );
}