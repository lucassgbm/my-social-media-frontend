'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import {
    REALTIME_URL,
    type AppNotification,
    type ChatMessage,
    type Conversation,
} from "../utils/realtime";

type SendResult = { ok: true; message: ChatMessage } | { ok: false; error: string };

type RealtimeContextType = {
    connected: boolean;
    conversations: Conversation[];
    notifications: AppNotification[];
    /** Mensagens já carregadas, por conversa. */
    threads: Record<number, ChatMessage[]>;
    /** Ids de quem está digitando, por conversa. */
    typingIn: Record<number, boolean>;
    unreadMessages: number;
    unreadNotifications: number;
    loading: boolean;

    openConversation: (conversationId: number) => Promise<void>;
    /** Nenhuma conversa em foco — o painel chama ao fechar. */
    closeConversation: () => void;
    startConversation: (userId: number) => Promise<number | null>;
    sendMessage: (to: number, body: string) => Promise<SendResult>;
    setTyping: (conversationId: number, typing: boolean) => void;
    markNotificationsRead: (id?: number) => Promise<void>;
    reload: () => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextType>({} as RealtimeContextType);

export function useRealtime(): RealtimeContextType {
    return useContext(RealtimeContext);
}

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
    try {
        const response = await fetch(`${REALTIME_URL}${path}`, {
            // o cookie do Sanctum é o que autentica; sem credentials o serviço
            // responde 401
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            ...init,
        });

        if (!response.ok) return null;

        return (await response.json()) as T;
    } catch {
        // serviço fora do ar não pode quebrar a página: o painel abre vazio
        return null;
    }
}

/**
 * Conexão única com o serviço de tempo real.
 *
 * Fica no provider, e não no painel de mensagens, porque a conexão precisa
 * sobreviver ao fechamento da gaveta — é ela que alimenta o contador de não
 * lidas do cabeçalho enquanto o painel está fechado.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null);

    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rawConversations, setConversations] = useState<Conversation[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [threads, setThreads] = useState<Record<number, ChatMessage[]>>({});
    const [typingIn, setTypingIn] = useState<Record<number, boolean>>({});

    /**
     * Quem está online, guardado à parte da lista de conversas.
     *
     * O `presence:sync` chega assim que o socket conecta, e o `reload()` é
     * assíncrono: gravar o online dentro das conversas fazia o sync se perder
     * quando chegava antes da lista, e todo mundo aparecia offline até alguém
     * conectar ou desconectar.
     */
    const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());

    /** Conversa aberta agora: mensagem que chega nela já entra como lida. */
    const activeConversation = useRef<number | null>(null);

    const reload = useCallback(async () => {
        const [conversationsResponse, notificationsResponse] = await Promise.all([
            api<{ data: Conversation[] }>("/conversations"),
            api<{ data: AppNotification[] }>("/notifications"),
        ]);

        const list = conversationsResponse?.data ?? [];

        setConversations(list);

        // o servidor manda o online de cada participante junto da listagem;
        // ele semeia o conjunto para quem carrega antes do socket conectar
        setOnlineIds((current) => {
            const merged = new Set(current);

            list.forEach((conversation) => {
                if (conversation.online) merged.add(conversation.participant.id);
            });

            return merged;
        });

        setNotifications(notificationsResponse?.data ?? []);
        setLoading(false);
    }, []);

    /** A lista que a tela consome: presença sempre vem do conjunto. */
    const conversations = useMemo(
        () =>
            rawConversations.map((conversation) => ({
                ...conversation,
                online: onlineIds.has(conversation.participant.id),
            })),
        [rawConversations, onlineIds]
    );

    useEffect(() => {
        reload();

        const socket = io(REALTIME_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("connect_error", () => {
            // token expirado ou serviço fora: o painel segue com o que já
            // carregou por HTTP em vez de ficar tentando para sempre
            setConnected(false);
        });

        socket.on("message:new", ({ conversation_id, message }: {
            conversation_id: number;
            message: ChatMessage;
        }) => {
            setThreads((current) => {
                const thread = current[conversation_id];

                // conversa ainda não aberta: não monta thread pela metade, o
                // openConversation busca o histórico completo depois
                if (!thread) return current;

                if (thread.some((item) => item.id === message.id)) return current;

                return { ...current, [conversation_id]: [...thread, message] };
            });

            const isActive = activeConversation.current === conversation_id;

            setConversations((current) => {
                const existing = current.find((item) => item.id === conversation_id);

                // primeira mensagem de uma conversa nova: só a listagem tem os
                // dados da pessoa, então recarrega
                if (!existing) {
                    void reload();
                    return current;
                }

                const updated = current.map((item) =>
                    item.id !== conversation_id
                        ? item
                        : {
                            ...item,
                            last_message: {
                                body: message.body,
                                sender_id: message.sender_id,
                                created_at: message.created_at,
                            },
                            unread:
                                message.mine || isActive ? item.unread : item.unread + 1,
                        }
                );

                // a mais recente sobe para o topo, como na listagem do servidor
                return [
                    ...updated.filter((item) => item.id === conversation_id),
                    ...updated.filter((item) => item.id !== conversation_id),
                ];
            });

            if (isActive && !message.mine) {
                socket.emit("message:read", { conversation_id });
            }
        });

        socket.on("message:read", ({ conversation_id }: { conversation_id: number }) => {
            setThreads((current) => {
                const thread = current[conversation_id];

                if (!thread) return current;

                const now = new Date().toISOString();

                return {
                    ...current,
                    [conversation_id]: thread.map((message) =>
                        message.mine && message.read_at === null
                            ? { ...message, read_at: now }
                            : message
                    ),
                };
            });
        });

        socket.on("typing", ({ conversation_id, typing }: {
            conversation_id: number;
            typing: boolean;
        }) => {
            setTypingIn((current) => ({ ...current, [conversation_id]: typing }));
        });

        socket.on("presence", ({ user_id, online }: { user_id: number; online: boolean }) => {
            setOnlineIds((current) => {
                const next = new Set(current);

                if (online) {
                    next.add(user_id);
                } else {
                    next.delete(user_id);
                }

                return next;
            });
        });

        socket.on("presence:sync", ({ online }: { online: number[] }) => {
            setOnlineIds(new Set(online));
        });

        socket.on("notification:new", ({ notification }: { notification: AppNotification }) => {
            setNotifications((current) => [notification, ...current]);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [reload]);

    /** Carrega o histórico e marca a conversa como lida. */
    const openConversation = useCallback(async (conversationId: number) => {
        activeConversation.current = conversationId;

        const response = await api<{ data: ChatMessage[] }>(
            `/conversations/${conversationId}/messages`
        );

        if (response) {
            setThreads((current) => ({ ...current, [conversationId]: response.data }));
        }

        socketRef.current?.emit("message:read", { conversation_id: conversationId });

        setConversations((current) =>
            current.map((item) =>
                item.id === conversationId ? { ...item, unread: 0 } : item
            )
        );
    }, []);

    /**
     * Tira a conversa de foco.
     *
     * Sem isto, a última conversa aberta continuava "em foco" com a gaveta
     * fechada: mensagem nova chegava marcada como lida e nunca entrava no
     * contador de não lidas do cabeçalho.
     */
    const closeConversation = useCallback(() => {
        activeConversation.current = null;
    }, []);

    /** Abre (ou reencontra) a conversa com alguém e devolve o id. */
    const startConversation = useCallback(async (userId: number): Promise<number | null> => {
        const response = await api<{ data: { conversation_id: number } }>("/conversations", {
            method: "POST",
            body: JSON.stringify({ user_id: userId }),
        });

        if (!response) return null;

        await reload();

        return response.data.conversation_id;
    }, [reload]);

    /**
     * Envia pelo socket e espera o ack.
     *
     * O ack é o que permite mostrar erro de validação (não são amigos, texto
     * vazio) — sem ele o envio seria sempre "otimista" e falharia calado.
     */
    const sendMessage = useCallback((to: number, body: string): Promise<SendResult> => {
        return new Promise((resolve) => {
            const socket = socketRef.current;

            if (!socket || !socket.connected) {
                resolve({ ok: false, error: "Sem conexão com o servidor de mensagens." });
                return;
            }

            socket.emit("message:send", { to, body }, (result: SendResult) => {
                resolve(result ?? { ok: false, error: "Não foi possível enviar." });
            });
        });
    }, []);

    const setTyping = useCallback((conversationId: number, typing: boolean) => {
        socketRef.current?.emit("typing", { conversation_id: conversationId, typing });
    }, []);

    const markNotificationsRead = useCallback(async (id?: number) => {
        await api("/notifications/read", {
            method: "POST",
            body: JSON.stringify(id === undefined ? {} : { id }),
        });

        const now = new Date().toISOString();

        setNotifications((current) =>
            current.map((notification) =>
                id === undefined || notification.id === id
                    ? { ...notification, read_at: notification.read_at ?? now }
                    : notification
            )
        );
    }, []);

    const unreadMessages = useMemo(
        () => conversations.reduce((total, item) => total + item.unread, 0),
        [conversations]
    );

    const unreadNotifications = useMemo(
        () => notifications.filter((item) => item.read_at === null).length,
        [notifications]
    );

    const value = useMemo<RealtimeContextType>(
        () => ({
            connected,
            conversations,
            notifications,
            threads,
            typingIn,
            unreadMessages,
            unreadNotifications,
            loading,
            openConversation,
            closeConversation,
            startConversation,
            sendMessage,
            setTyping,
            markNotificationsRead,
            reload,
        }),
        [
            connected,
            conversations,
            notifications,
            threads,
            typingIn,
            unreadMessages,
            unreadNotifications,
            loading,
            openConversation,
            closeConversation,
            startConversation,
            sendMessage,
            setTyping,
            markNotificationsRead,
            reload,
        ]
    );

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
