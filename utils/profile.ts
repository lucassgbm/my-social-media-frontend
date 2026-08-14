import type { FriendshipStatus, Person } from "./friendship";
import type { Community } from "./community";

/**
 * Vocabulário da tela de perfil.
 *
 * Os tipos moraram dentro de `components/profile/user-profile.tsx` enquanto ele
 * era o único a buscar esses dados. Agora as consultas vivem em
 * `hooks/use-profile.ts` e os dois precisam das mesmas formas.
 */

/** Espelha App\Http\Resources\PublicProfileResource. */
export type PublicProfile = Person & {
    cover?: string | null;
    friendship_status: FriendshipStatus;
    friends_count: number;
    photos_count: number;
    communities_count: number;
    friends: Person[];
    communities: Community[];
};

export type UserPhoto = {
    id: number;
    photo_path: string;
    created_at: string;
};

export type ProfilePostAuthor = {
    name: string;
    photo?: string | null;
};

/** Item do feed recortado por autor (GET /social-media/feed?user_id=). */
export type ProfilePost = {
    id: number;
    description: string;
    photo_path?: string | null;
    created_at: string;
    user: ProfilePostAuthor;
    likes: { count: number };
    comments: { count: number };
};
