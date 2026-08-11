import type { Community, CommunityEvent } from "./community";
import type { Person } from "./friendship";

/**
 * Vocabulário da busca global (GET /social-media/search).
 *
 * Espelha App\Http\Controllers\SearchController: a API sempre manda as três
 * listas e as três contagens, mesmo vazias, para as telas não precisarem
 * tratar chave ausente.
 */

/** Abaixo disso a API devolve vazio — uma letra só casaria com quase tudo. */
export const MIN_SEARCH_LENGTH = 2;

export type SearchType = "people" | "communities" | "events";

export type SearchCounts = Record<SearchType, number> & {
    /** Soma das três — decide se a tela mostra resultado ou estado vazio. */
    total: number;
};

export type SearchResults = {
    query: string;
    people: Person[];
    communities: Community[];
    events: CommunityEvent[];
    /** Total que casa no banco, e não o que coube no limite pedido. */
    counts: SearchCounts;
};

export const EMPTY_SEARCH_RESULTS: SearchResults = {
    query: "",
    people: [],
    communities: [],
    events: [],
    counts: { people: 0, communities: 0, events: 0, total: 0 },
};

/** Rótulos das seções e das abas, no singular e no plural. */
export const SEARCH_TYPE_LABELS: Record<SearchType, { one: string; many: string }> = {
    people: { one: "Pessoa", many: "Pessoas" },
    communities: { one: "Comunidade", many: "Comunidades" },
    events: { one: "Evento", many: "Eventos" },
};

/** Página de resultados para um termo. */
export function searchPageHref(term: string): string {
    return `/social-media/search?q=${encodeURIComponent(term)}`;
}

/** Monta a URL da API com o limite por tipo. */
export function searchApiUrl(term: string, limit: number): string {
    return `/social-media/search?q=${encodeURIComponent(term)}&limit=${limit}`;
}

/**
 * Normaliza a resposta da API.
 *
 * `get()` engole o erro e devolve `undefined`, então toda tela precisaria do
 * mesmo encadeamento de fallbacks — ele mora aqui.
 */
export function toSearchResults(response: unknown, term: string): SearchResults {
    const data = (response as { data?: Partial<SearchResults> } | undefined)?.data;

    if (!data) return { ...EMPTY_SEARCH_RESULTS, query: term };

    return {
        query: data.query ?? term,
        people: data.people ?? [],
        communities: data.communities ?? [],
        events: data.events ?? [],
        counts: data.counts ?? EMPTY_SEARCH_RESULTS.counts,
    };
}
