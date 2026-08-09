/**
 * Vocabulário de amizade compartilhado pelas telas.
 *
 * Os valores são os mesmos das constantes STATUS_* de App\Models\UserFriend —
 * a API manda `friendship_status` em toda pessoa que aparece numa listagem.
 */
export type FriendshipStatus =
    | "none"
    | "request_sent"
    | "request_received"
    | "friends"
    | "self";

/** Pessoa como a API devolve em UserSummaryResource. */
export type Person = {
    id: number;
    name: string;
    photo?: string | null;
    autodescription?: string | null;
    city?: string | null;
    uf?: string | null;
    friendship_status?: FriendshipStatus | null;
};

/** "Brasília - DF", "Brasília" ou "" — o que houver preenchido. */
export function locationOf(person: Pick<Person, "city" | "uf">): string {
    return [person.city, person.uf].filter(Boolean).join(" - ");
}
