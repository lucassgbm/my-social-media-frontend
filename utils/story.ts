import type { Person } from "./friendship";

/**
 * Vocabulário dos stories (GET /social-media/story).
 *
 * Espelha App\Http\Controllers\StoryController: a API já devolve agrupado por
 * autor, que é como a barra desenha os anéis — um por pessoa, não por foto —
 * e só traz os stories dos amigos e os do próprio usuário.
 */

/** Quanto tempo um story fica no ar; o corte de verdade é do backend. */
export const STORY_LIFETIME_HOURS = 24;

/** Tempo de cada foto no visualizador. */
export const STORY_DURATION_MS = 5000;

/** Limite da legenda, igual ao da validação do backend. */
export const STORY_CAPTION_MAX = 255;

export type Story = {
    id: number;
    uuid: string;
    user_id: number;
    description?: string | null;
    /** URL assinada e temporária do R2. */
    photo: string | null;
    created_at: string;
    /** Quando sai do ar. */
    expires_at: string | null;
    /** Quem está vendo já assistiu. */
    seen: boolean;
    /** É story de quem está vendo. */
    can_delete: boolean;
};

export type StoryGroup = {
    user: Person;
    /** É o próprio usuário logado. */
    is_mine: boolean;
    /** Tem story ainda não aberto — é o que acende o anel. */
    has_unseen: boolean;
    stories: Story[];
    last_story_at: string;
};

/**
 * "agora", "12 min", "3 h".
 *
 * Como o story vive 24h, nunca precisa passar de horas.
 */
export function timeAgo(iso?: string | null): string {
    if (!iso) return "";

    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes} min`;

    return `${Math.floor(minutes / 60)} h`;
}

/** Primeiro nome — é o que cabe embaixo do avatar na barra. */
export function firstName(name?: string | null): string {
    return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/**
 * Marca um story como visto na lista que está na tela.
 *
 * O anel é do grupo, então marcar uma foto também recalcula o `has_unseen` do
 * autor — sem isso o anel só apagaria depois de recarregar a página.
 */
export function markStorySeen(groups: StoryGroup[], storyId: number): StoryGroup[] {
    return groups.map((group) => {
        if (!group.stories.some((story) => story.id === storyId)) return group;

        const stories = group.stories.map((story) =>
            story.id === storyId ? { ...story, seen: true } : story
        );

        return { ...group, stories, has_unseen: stories.some((story) => !story.seen) };
    });
}

/**
 * Tira um story da lista, e o autor junto quando era o último dele.
 */
export function removeStory(groups: StoryGroup[], storyId: number): StoryGroup[] {
    return groups
        .map((group) => {
            if (!group.stories.some((story) => story.id === storyId)) return group;

            const stories = group.stories.filter((story) => story.id !== storyId);

            return { ...group, stories, has_unseen: stories.some((story) => !story.seen) };
        })
        .filter((group) => group.stories.length > 0);
}
