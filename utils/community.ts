import type { Person } from "./friendship";

/**
 * Papel de quem está vendo a comunidade, resolvido pela CommunityPolicy no
 * backend. O front não recalcula regra nenhuma: usa `can_*` para decidir os
 * botões e este papel só para rotular.
 */
export type CommunityRole = "owner" | "admin" | "member" | "blocked" | "none";

export type CommunityMember = Person & {
    community_role: "owner" | "admin" | "member";
    blocked: boolean;
    /** O visitante pode expulsar/bloquear esta pessoa. */
    can_moderate: boolean;
    /** O visitante pode promovê-la ou rebaixá-la (só o dono pode). */
    can_assign_role: boolean;
};

export type Community = {
    id: number;
    name: string;
    description?: string | null;
    photo?: string | null;
    category_id?: number | null;
    /** Privada: só entra quem recebe convite. */
    is_private?: boolean;
    owner_id: number;
    owner?: Person | null;
    members?: CommunityMember[];
    members_count?: number;
    topics_count?: number;
    photos_count?: number;
    events_count?: number;
    viewer_role: CommunityRole;
    /**
     * Ainda não participa e pode entrar por conta própria — falso numa
     * comunidade privada sem convite.
     */
    can_join?: boolean;
    /**
     * Pode ver tópicos, fotos, eventos e membros. Falso na privada para quem
     * está de fora: a tela mostra o aviso de conteúdo restrito.
     */
    can_view_content?: boolean;
    /** Privada, está de fora e ainda não pediu: cabe pedir para entrar. */
    can_request_join?: boolean;
    /** 'pending' enquanto o pedido espera resposta. */
    viewer_join_request?: "pending" | null;
    /** Pedidos à espera de aprovação — só chega para quem modera. */
    join_requests_count?: number;
    can_manage: boolean;
    can_moderate: boolean;
    can_participate: boolean;
    can_assign_roles: boolean;
};

export type CommunityTopicComment = {
    id: number;
    content: string;
    created_at: string;
    author?: Person | null;
    can_delete: boolean;
};

/** Recorte da comunidade que acompanha o tópico, para o cabeçalho da tela. */
export type CommunityBrief = {
    id: number;
    name: string;
    photo?: string | null;
};

export type CommunityTopic = {
    id: number;
    community_id: number;
    community?: CommunityBrief | null;
    title: string;
    description?: string | null;
    created_at: string;
    author?: Person | null;
    comments_count?: number;
    comments?: CommunityTopicComment[];
    can_delete: boolean;
    can_comment: boolean;
};

export type CommunityPhoto = {
    id: number;
    photo: string | null;
    description?: string | null;
    created_at: string;
    author?: Person | null;
    can_delete: boolean;
};

/** Resposta de presença. Sem resposta é a ausência de status, não um valor. */
export type AttendanceStatus = "going" | "maybe" | "declined";

export type CommunityEvent = {
    id: number;
    title: string;
    description: string;
    local: string;
    link?: string | null;
    date_start: string;
    date_end: string;
    time_start: string;
    time_end: string;
    photo?: string | null;
    can_delete: boolean;
    /** Presente na agenda geral, que mistura eventos de várias comunidades. */
    community?: CommunityBrief | null;
    /** Já terminou — o corte é por `date_end`. */
    is_past?: boolean;

    // --- Presença --------------------------------------------------------
    going_count?: number | null;
    maybe_count?: number | null;
    /** Resposta de quem está vendo; null quando ainda não respondeu. */
    viewer_attendance?: AttendanceStatus | null;
    /** Participa da comunidade e o evento ainda não terminou. */
    can_attend?: boolean;

    /** Já está nos salvos de quem está vendo (/social-media/items-saved). */
    viewer_saved?: boolean;
};

/** Pessoa na lista de presença, com a resposta que ela deu. */
export type EventAttendee = Person & {
    attendance_status: AttendanceStatus;
};

/** Situação de um amigo perante a comunidade, na tela de convite. */
export type InviteStatus = "none" | "invited" | "member" | "blocked";

export type InviteCandidate = Person & {
    invite_status: InviteStatus;
};

/**
 * Pedido de entrada numa comunidade privada, na fila de quem administra.
 *
 * É o caminho inverso do convite: aqui a iniciativa é de quem está de fora.
 */
export type CommunityJoinRequest = {
    id: number;
    created_at?: string | null;
    user: Person;
};

/** Convite de comunidade recebido, à espera de resposta. */
export type CommunityInvite = {
    id: number;
    created_at: string;
    community: {
        id: number;
        name: string;
        description?: string | null;
        photo?: string | null;
    };
    inviter?: {
        id: number;
        name: string;
        photo?: string | null;
    } | null;
};

/** Filtros da agenda pessoal (/social-media/events). */
export type EventFilter = "upcoming" | "past" | "all";

/** Rótulo do papel para os badges dos cards. */
export function roleLabel(role: CommunityMember["community_role"]): string | null {
    if (role === "owner") return "Dono";
    if (role === "admin") return "Admin";

    return null;
}

/** "2026-10-01" -> "01/10/2026"; devolve o original se vier em outro formato. */
export function formatDate(value?: string | null): string {
    if (!value) return "";

    const [date] = value.split("T");
    const parts = date.split("-");

    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

/** "18:00:00" -> "18:00" */
export function formatTime(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}
