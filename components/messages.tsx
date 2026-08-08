'use client';

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "./remote-image";
import Button from "./button";
import ColorButton from "./color-button";
import AirPlaneIcon from "./icons/airplane";
import ArrowLeftIcon from "./icons/arrow-left";
import BellIcon from "./icons/bell";
import CloseIcon from "./icons/close";
import CommunityIcon from "./icons/community";
import HeartIcon from "./icons/heart";
import MessageIcon from "./icons/message";
import SearchIcon from "./icons/search";
import UsersIcon from "./icons/users";
import { AppContext } from "@/app/(pages)/social-media/layout";
import {
    mockConversations,
    mockNotifications,
    type AppNotification,
    type ChatMessage,
    type Conversation,
    type NotificationType,
} from "../mocks/messages";

type MessagesProps = {
    openMessages?: boolean;
    setOpenMessages: (open: boolean) => void;
};

type Tab = "messages" | "notifications";

/**
 * Cada tipo de notificação tem a própria cor. As tintas usam opacidade sobre a
 * cor pura (`/10`), o que mantém o contraste do ícone nos dois temas sem
 * precisar de uma variante `dark:` para cada uma.
 */
const NOTIFICATION_STYLES: Record<
    NotificationType,
    { icon: typeof HeartIcon; className: string }
> = {
    like: { icon: HeartIcon, className: "bg-rose-500/10 text-rose-500" },
    comment: { icon: MessageIcon, className: "bg-sky-500/10 text-sky-500" },
    friend: { icon: UsersIcon, className: "bg-brand/10 text-brand" },
    community: { icon: CommunityIcon, className: "bg-amber-500/10 text-amber-500" },
};

/** Horário da mensagem recém-enviada, no mesmo formato dos mocks (HH:MM). */
function nowLabel(): string {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Painel lateral de mensagens e notificações, aberto pelo ícone do Header.
 *
 * Não há endpoint de chat na API: as conversas vêm de mocks/messages e o envio
 * só acrescenta a mensagem ao estado local. Toda a interação (busca, seleção,
 * não lidas, envio) é real para que trocar o mock pela API seja só substituir a
 * origem dos dados.
 */
export default function Messages({ setOpenMessages }: MessagesProps) {
    const { myInfo } = useContext(AppContext);

    const [tab, setTab] = useState<Tab>("messages");
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

    const [activeId, setActiveId] = useState<number | null>(mockConversations[0]?.id ?? null);
    // Abaixo de sm as duas colunas não cabem: a lista e a conversa se alternam
    const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);

    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState("");

    const panelRef = useRef<HTMLElement>(null);
    const threadEndRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    function close() {
        setOpenMessages(false);
    }

    // Esc fecha o painel e o foco volta para o botão do Header — antes só dava
    // para fechar clicando no X.
    useEffect(() => {
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        panelRef.current?.focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpenMessages(false);
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused.current?.focus();
        };
    }, [setOpenMessages]);

    // No mobile o painel cobre a tela inteira, então travar o scroll do body
    // evita rolar a página por baixo. No desktop ele é uma gaveta lateral e a
    // página continua utilizável.
    useEffect(() => {
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        if (!isMobile) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const active = useMemo(
        () => conversations.find((conversation) => conversation.id === activeId) ?? null,
        [conversations, activeId]
    );

    // Rola para a última mensagem ao abrir a conversa e a cada envio
    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ block: "end" });
    }, [activeId, active?.messages.length, tab]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (term === "") return conversations;

        return conversations.filter((conversation) => {
            const last = conversation.messages[conversation.messages.length - 1]?.text ?? "";

            return (
                conversation.name.toLowerCase().includes(term) ||
                last.toLowerCase().includes(term)
            );
        });
    }, [conversations, search]);

    const unreadMessages = conversations.reduce((total, item) => total + item.unread, 0);
    const unreadNotifications = notifications.filter((item) => !item.read).length;

    function selectConversation(id: number) {
        setActiveId(id);
        setShowThreadOnMobile(true);

        // abrir a conversa é o que marca como lida
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === id ? { ...conversation, unread: 0 } : conversation
            )
        );
    }

    function sendMessage(e: React.FormEvent) {
        e.preventDefault();

        const text = draft.trim();
        if (text === "" || !active) return;

        setConversations((current) =>
            current.map((conversation) =>
                conversation.id !== active.id
                    ? conversation
                    : {
                        ...conversation,
                        // sem API ainda: a mensagem só entra no estado local
                        messages: [
                            ...conversation.messages,
                            {
                                id: (conversation.messages.at(-1)?.id ?? 0) + 1,
                                mine: true,
                                text,
                                time: nowLabel(),
                            },
                        ],
                    }
            )
        );

        setDraft("");
    }

    const tabClass = (isActive: boolean) =>
        `relative flex items-center justify-center rounded-2xl p-2.5 transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
        ${isActive ? "bg-brand-subtle text-brand" : "text-content-muted hover:bg-surface-2 hover:text-content"}`;

    const badgeClass = `absolute -top-1 -right-1 min-w-[18px] rounded-full bg-danger px-1
        text-[10px] font-bold leading-[18px] text-white ring-2 ring-surface`;

    const myPhoto = myInfo?.photo || "/imgs/placeholder.png";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Fundo clicável: fechar tocando fora é o gesto esperado no mobile.
                O blur separa o painel da página sem escurecer demais. */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
                onClick={close}
                aria-hidden="true"
            />

            {/* No desktop o painel flutua com margem e cantos arredondados; no
                mobile ocupa a tela inteira */}
            <aside
                ref={panelRef}
                role="dialog"
                aria-label="Mensagens e notificações"
                tabIndex={-1}
                className="animate-slide-in-right relative flex h-full w-full max-w-full overflow-hidden
                    bg-surface text-content outline-none shadow-2xl
                    sm:my-3 sm:mr-3 sm:h-[calc(100%-1.5rem)] sm:w-[760px] sm:rounded-card sm:border sm:border-line"
            >
                {/* -------------------------------------------------- Barra de ações */}
                <div className="flex w-16 shrink-0 flex-col items-center justify-between gap-4
                    border-r border-line bg-surface-2/60 p-3">
                    <Button onClick={close} aria-label="Fechar mensagens">
                        <CloseIcon className="size-5" />
                    </Button>

                    <div
                        role="tablist"
                        aria-orientation="vertical"
                        aria-label="Seções do painel"
                        className="flex flex-1 flex-col gap-2"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === "messages"}
                            aria-label={`Mensagens${unreadMessages > 0 ? ` (${unreadMessages} não lidas)` : ""}`}
                            onClick={() => setTab("messages")}
                            className={tabClass(tab === "messages")}
                        >
                            <MessageIcon className="size-5" />
                            {unreadMessages > 0 && (
                                <span aria-hidden="true" className={badgeClass}>
                                    {unreadMessages}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === "notifications"}
                            aria-label={`Notificações${unreadNotifications > 0 ? ` (${unreadNotifications} não lidas)` : ""}`}
                            onClick={() => setTab("notifications")}
                            className={tabClass(tab === "notifications")}
                        >
                            <BellIcon className="size-5" />
                            {unreadNotifications > 0 && (
                                <span aria-hidden="true" className={badgeClass}>
                                    {unreadNotifications}
                                </span>
                            )}
                        </button>
                    </div>

                    <Image
                        src={myPhoto}
                        alt=""
                        width={36}
                        height={36}
                        sizes="36px"
                        className="w-9 aspect-square rounded-full object-cover ring-2 ring-line"
                    />
                </div>

                {tab === "messages" && (
                    <div className="flex min-w-0 flex-1 flex-row">

                        {/* ------------------------------------------ Lista de conversas */}
                        <div
                            className={`${showThreadOnMobile ? "hidden" : "flex"} sm:flex
                                w-full sm:w-[40%] sm:shrink-0 min-w-0 flex-col border-r border-line`}
                        >
                            <div className="flex flex-col gap-3 p-4 pb-3">
                                <div className="flex flex-row items-baseline justify-between gap-2">
                                    <h2 className="text-lg font-semibold">Mensagens</h2>
                                    {unreadMessages > 0 && (
                                        <span className="rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-semibold text-brand">
                                            {unreadMessages} nova{unreadMessages > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-2
                                    focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                                    <SearchIcon className="size-4 shrink-0 text-content-muted" />
                                    <input
                                        type="search"
                                        aria-label="Procurar conversa"
                                        placeholder="Procurar amigo"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent text-sm text-content
                                            placeholder:text-content-subtle outline-none"
                                    />
                                </div>
                            </div>

                            <ul className="scrollbar-slim flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-3">
                                {filtered.map((conversation) => {
                                    const last = conversation.messages.at(-1);
                                    const isActive = conversation.id === activeId;
                                    const hasUnread = conversation.unread > 0;

                                    return (
                                        <li key={conversation.id}>
                                            <button
                                                type="button"
                                                onClick={() => selectConversation(conversation.id)}
                                                aria-current={isActive || undefined}
                                                className={`group relative flex w-full flex-row items-center gap-3
                                                    rounded-card py-2.5 pl-4 pr-3 text-left transition-colors cursor-pointer
                                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                                                    ${isActive ? "bg-brand-subtle" : "hover:bg-surface-2"}`}
                                            >
                                                {/* barra de acento marca a conversa aberta sem
                                                    depender só da cor de fundo */}
                                                {isActive && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute left-1 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-brand"
                                                    />
                                                )}

                                                <span className="relative shrink-0">
                                                    <Image
                                                        src={conversation.photo_path}
                                                        alt=""
                                                        width={44}
                                                        height={44}
                                                        sizes="44px"
                                                        className={`w-11 aspect-square rounded-full object-cover
                                                            ${hasUnread ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
                                                    />
                                                    {conversation.online && (
                                                        <span
                                                            aria-hidden="true"
                                                            className="absolute bottom-0 right-0 size-3 rounded-full
                                                                bg-success ring-2 ring-surface"
                                                        />
                                                    )}
                                                </span>

                                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                    <span className="flex flex-row items-baseline justify-between gap-2">
                                                        <span className="truncate text-sm font-semibold">
                                                            {conversation.name}
                                                        </span>
                                                        <span
                                                            className={`shrink-0 text-[11px] ${hasUnread ? "font-semibold text-brand" : "text-content-muted"}`}
                                                        >
                                                            {last?.time}
                                                        </span>
                                                    </span>

                                                    <span className="flex flex-row items-center justify-between gap-2">
                                                        <span
                                                            className={`truncate text-xs ${hasUnread ? "font-medium text-content" : "text-content-muted"}`}
                                                        >
                                                            {last?.mine ? "Você: " : ""}
                                                            {last?.text}
                                                        </span>
                                                        {hasUnread && (
                                                            <span className="shrink-0 rounded-full bg-brand px-1.5 text-[10px]
                                                                font-bold leading-[18px] text-on-brand">
                                                                {conversation.unread}
                                                            </span>
                                                        )}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}

                                {filtered.length === 0 && (
                                    <li className="flex flex-col items-center gap-2 px-2 py-10 text-center">
                                        <span className="rounded-full bg-surface-2 p-3">
                                            <SearchIcon className="size-6 text-content-subtle" />
                                        </span>
                                        <p className="text-sm text-content-muted">
                                            Nenhuma conversa encontrada.
                                        </p>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* ------------------------------------------------- Conversa */}
                        <div
                            className={`${showThreadOnMobile ? "flex" : "hidden"} sm:flex
                                min-w-0 flex-1 flex-col bg-surface-2/40`}
                        >
                            {active ? (
                                <>
                                    <div className="flex flex-row items-center gap-3 border-b border-line bg-surface px-4 py-3">
                                        <Button
                                            onClick={() => setShowThreadOnMobile(false)}
                                            aria-label="Voltar para as conversas"
                                            className="sm:hidden"
                                        >
                                            <ArrowLeftIcon className="size-5" />
                                        </Button>

                                        <span className="relative shrink-0">
                                            <Image
                                                src={active.photo_path}
                                                alt=""
                                                width={40}
                                                height={40}
                                                sizes="40px"
                                                className="w-10 aspect-square rounded-full object-cover"
                                            />
                                            {active.online && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute bottom-0 right-0 size-3 rounded-full
                                                        bg-success ring-2 ring-surface"
                                                />
                                            )}
                                        </span>

                                        <div className="flex min-w-0 flex-col">
                                            <h2 className="truncate text-base font-semibold">{active.name}</h2>
                                            <span className="flex items-center gap-1.5 text-xs text-content-muted">
                                                {active.online && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-1.5 rounded-full bg-success"
                                                    />
                                                )}
                                                {active.online ? "Online agora" : "Offline"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* min-h-0 é o que permite a rolagem: sem isso o flex item
                                        cresce com o conteúdo e empurra o composer para fora */}
                                    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
                                        {active.messages.map((message, index) => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                previous={active.messages[index - 1]}
                                                next={active.messages[index + 1]}
                                                authorName={active.name}
                                                authorPhoto={active.photo_path}
                                            />
                                        ))}

                                        {active.typing && (
                                            <div className="mt-3 flex flex-row items-end gap-2">
                                                <Image
                                                    src={active.photo_path}
                                                    alt=""
                                                    width={28}
                                                    height={28}
                                                    sizes="28px"
                                                    className="w-7 aspect-square rounded-full object-cover shrink-0"
                                                />
                                                <div
                                                    className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line
                                                        bg-surface px-3 py-2.5"
                                                    aria-label={`${active.name} está digitando`}
                                                >
                                                    {[0, 150, 300].map((delay) => (
                                                        <span
                                                            key={delay}
                                                            className="size-1.5 animate-bounce rounded-full bg-content-subtle"
                                                            style={{ animationDelay: `${delay}ms` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div ref={threadEndRef} />
                                    </div>

                                    {/* <form> para o Enter enviar sem precisar de handler de tecla */}
                                    <form
                                        onSubmit={sendMessage}
                                        className="flex flex-row items-center gap-2 border-t border-line bg-surface px-4 py-3"
                                    >
                                        <div className="flex w-full items-center rounded-full border border-line bg-surface-2 px-4 py-2.5
                                            focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ring">
                                            <input
                                                type="text"
                                                aria-label={`Mensagem para ${active.name}`}
                                                placeholder="Digite uma mensagem"
                                                value={draft}
                                                onChange={(e) => setDraft(e.target.value)}
                                                className="w-full bg-transparent text-sm text-content
                                                    placeholder:text-content-subtle outline-none"
                                            />
                                        </div>

                                        <ColorButton
                                            type="submit"
                                            // o botão chamava handlePost, que não existia:
                                            // qualquer clique quebrava com ReferenceError
                                            disabled={draft.trim() === ""}
                                            aria-label="Enviar mensagem"
                                            className="size-10 shrink-0 shadow-sm transition-transform active:scale-95"
                                        >
                                            <AirPlaneIcon className="size-5" />
                                        </ColorButton>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                                    <span className="rounded-full bg-surface-2 p-5">
                                        <MessageIcon className="size-8 text-content-subtle" />
                                    </span>
                                    <h2 className="text-base font-semibold">Nenhuma conversa aberta</h2>
                                    <p className="max-w-xs text-sm text-content-muted">
                                        Escolha alguém na lista ao lado para começar a conversar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === "notifications" && (
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-row items-center justify-between gap-2 border-b border-line px-4 py-3">
                            <h2 className="text-lg font-semibold">Notificações</h2>

                            {/* botão simples em vez de <Button variant="ghost">: a variante
                                já define text-content e sobrescrever a cor por className
                                depende da ordem das utilities no CSS gerado */}
                            {unreadNotifications > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNotifications((current) =>
                                            current.map((item) => ({ ...item, read: true }))
                                        )
                                    }
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand
                                        transition-colors cursor-pointer hover:bg-brand-subtle
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        <ul className="scrollbar-slim flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                            {notifications.map((notification) => {
                                const { icon: Icon, className } = NOTIFICATION_STYLES[notification.type];

                                return (
                                    <li
                                        key={notification.id}
                                        className={`relative flex flex-row items-start gap-3 rounded-card p-3
                                            transition-colors hover:bg-surface-2
                                            ${notification.read ? "" : "bg-surface-2"}`}
                                    >
                                        <span className={`mt-0.5 shrink-0 rounded-full p-2.5 ${className}`}>
                                            <Icon className="size-4" />
                                        </span>

                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <p className="text-sm leading-snug">
                                                <span className="font-semibold">{notification.actor}</span>{" "}
                                                {notification.text}
                                            </p>
                                            <span className="text-xs text-content-muted">
                                                {notification.time}
                                            </span>
                                        </div>

                                        {!notification.read && (
                                            <span
                                                aria-label="Não lida"
                                                className="mt-2 size-2 shrink-0 rounded-full bg-brand"
                                            />
                                        )}
                                    </li>
                                );
                            })}

                            {notifications.length === 0 && (
                                <li className="flex flex-col items-center gap-3 py-12 text-center">
                                    <span className="rounded-full bg-surface-2 p-5">
                                        <BellIcon className="size-8 text-content-subtle" />
                                    </span>
                                    <h3 className="text-base font-semibold">Tudo em dia</h3>
                                    <p className="max-w-xs text-sm text-content-muted">
                                        Você não tem notificações novas.
                                    </p>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </aside>
        </div>
    );
}

/**
 * Bolha de mensagem.
 *
 * Mensagens seguidas do mesmo autor viram um bloco: o espaçamento encolhe, o
 * avatar aparece só na última e apenas ela ganha o canto "rabinho" e o horário
 * — é o que dá ritmo à conversa em vez de uma pilha de bolhas iguais.
 */
function MessageBubble({
    message,
    previous,
    next,
    authorName,
    authorPhoto,
}: {
    message: ChatMessage;
    previous?: ChatMessage;
    next?: ChatMessage;
    authorName: string;
    authorPhoto: string;
}) {
    const startsGroup = previous?.mine !== message.mine;
    const endsGroup = next?.mine !== message.mine;

    const corner = message.mine
        ? endsGroup ? "rounded-br-md" : ""
        : endsGroup ? "rounded-bl-md" : "";

    return (
        <div
            className={`flex flex-row items-end gap-2 ${startsGroup ? "mt-3 first:mt-0" : "mt-0.5"}
                ${message.mine ? "justify-end" : "justify-start"}`}
        >
            {!message.mine &&
                (endsGroup ? (
                    <Image
                        src={authorPhoto}
                        alt={`Foto de ${authorName}`}
                        width={28}
                        height={28}
                        sizes="28px"
                        className="w-7 aspect-square rounded-full object-cover shrink-0"
                    />
                ) : (
                    // espaçador mantém as bolhas do grupo alinhadas com a que tem avatar
                    <span aria-hidden="true" className="w-7 shrink-0" />
                ))}

            {/* cores por autor: antes as duas pontas usavam o mesmo amarelo fixo
                e não dava para diferenciar quem falou */}
            <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm break-words shadow-sm ${corner}
                    ${message.mine
                        ? "bg-brand text-on-brand"
                        : "border border-line bg-surface text-content"}`}
            >
                <p className="leading-relaxed">{message.text}</p>

                {endsGroup && (
                    <span
                        className={`mt-0.5 block text-right text-[10px] leading-none
                            ${message.mine ? "opacity-70" : "text-content-subtle"}`}
                    >
                        {message.time}
                    </span>
                )}
            </div>
        </div>
    );
}
