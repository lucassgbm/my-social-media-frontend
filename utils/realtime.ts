/**
 * Contratos do serviço de tempo real (projeto `realtime/`).
 *
 * Espelham realtime/src/types.ts. São dois projetos separados, então o
 * alinhamento é por convenção — mudar um lado pede mudar o outro.
 */

export type RealtimeUser = {
    id: number;
    name: string;
    photo: string | null;
};

export type ChatMessage = {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    /** Enviada por quem está vendo. */
    mine: boolean;
    read_at: string | null;
    created_at: string;
};

export type Conversation = {
    id: number;
    participant: RealtimeUser;
    last_message: Pick<ChatMessage, "body" | "sender_id" | "created_at"> | null;
    unread: number;
    online: boolean;
};

export type NotificationType =
    | "message"
    | "friend"
    | "comment"
    | "community"
    | "like";

export type AppNotification = {
    id: number;
    type: NotificationType;
    body: string;
    url: string | null;
    actor: RealtimeUser | null;
    data: unknown | null;
    read_at: string | null;
    created_at: string;
};

export const REALTIME_URL =
    process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:3333";

/**
 * "14:32" para hoje, "23/05" para os dias anteriores.
 *
 * A API manda `created_at` como "YYYY-MM-DD HH:MM:SS" no horário do servidor.
 * O `T` é o que faz o Safari aceitar o formato; sem ele, `new Date()` devolve
 * Invalid Date lá.
 */
export function formatMessageTime(value: string): string {
    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const sameDay =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    return sameDay
        ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
