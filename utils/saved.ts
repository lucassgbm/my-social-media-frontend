import type { CommunityEvent } from "./community";

/**
 * O que dá para guardar em /social-media/items-saved.
 *
 * Espelha o morph map de App\Models\SavedItem: os mesmos apelidos viajam na
 * API, então acrescentar um tipo lá é acrescentar uma opção aqui.
 */
export type SavedType = "post" | "event";

/** Post como o FeedResource devolve — o mesmo formato que alimenta o feed. */
export type SavedPost = {
    id: number;
    description: string;
    photo_path?: string | null;
    created_at: string;
    user: { name: string; photo?: string | null };
    likes: { count: number };
    comments: {
        count: number;
        comment?: {
            id: number;
            comment: string;
            created_at?: string | null;
            user: { id?: number | null; name?: string | null; photo?: string | null };
        }[];
    };
    /** Já está nos salvos de quem está vendo. */
    viewer_saved?: boolean;
};

/** Uma linha da lista de salvos. O item vem no campo do próprio tipo. */
export type SavedItem = {
    id: number;
    type: SavedType;
    saved_at?: string | null;
    post?: SavedPost;
    event?: CommunityEvent;
};

/** Total por tipo, para as abas da tela. */
export type SavedCounts = {
    post: number;
    event: number;
    all: number;
};

export const SAVED_ENDPOINT = "/social-media/saved-items";
