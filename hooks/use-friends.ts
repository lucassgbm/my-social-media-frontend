import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
    type QueryKey,
} from "@tanstack/react-query";
import api from "@/api/services/request";
import { profileKeys } from "./use-profile";
import type { FriendshipStatus, Person } from "../utils/friendship";

/**
 * Chaves do cache de amizade.
 *
 * Todas descendem de `all`, então uma invalidação só (`queryKey: friendKeys.all`)
 * alcança lista, solicitações e sugestões — que é o que qualquer ação de
 * amizade muda ao mesmo tempo. Montar as chaves aqui, e não à mão em cada
 * chamada, é o que impede uma tela de assinar `["friends"]` e outra
 * `["friends", "list"]` para o mesmo dado.
 */
export const friendKeys = {
    all: ["friends"] as const,
    list: () => [...friendKeys.all, "list"] as const,
    requests: () => [...friendKeys.all, "requests"] as const,
    suggestions: (limit: number) => [...friendKeys.all, "suggestions", limit] as const,
};

type FriendshipResponse = {
    message?: string;
    status?: FriendshipStatus;
};

/**
 * Busca uma listagem de pessoas.
 *
 * Usa a instância do axios direto, e não o `get()` de services/request: aquele
 * captura o erro e devolve `undefined`, o que faria toda falha de rede chegar
 * aqui como sucesso com lista vazia. O React Query precisa que a promessa
 * rejeite para distinguir "não tem ninguém" de "não deu para carregar".
 */
async function fetchPeople(url: string): Promise<Person[]> {
    const { data } = await api.get(url);

    return data?.data ?? [];
}

/** Amigos confirmados do usuário logado. */
export function useFriends() {
    return useQuery({
        queryKey: friendKeys.list(),
        queryFn: () => fetchPeople("/social-media/friends"),
    });
}

/** Convites recebidos, à espera de resposta. */
export function useFriendRequests() {
    return useQuery({
        queryKey: friendKeys.requests(),
        queryFn: () => fetchPeople("/social-media/friends/requests"),
    });
}

/** Pessoas sem vínculo nenhum — o backend já exclui amigos e convidados. */
export function useFriendSuggestions(limit: number) {
    return useQuery({
        queryKey: friendKeys.suggestions(limit),
        queryFn: () => fetchPeople(`/social-media/friends/suggestions?limit=${limit}`),
    });
}

/**
 * Tira a pessoa de uma lista que já está em cache.
 *
 * A invalidação logo abaixo traz a verdade do servidor, mas ela leva uma ida e
 * volta; sem esta poda o card confirmado continuaria na tela nesse intervalo.
 * Só roda depois do sucesso, então não existe caso de desfazer.
 */
function dropFromCachedList(client: QueryClient, key: QueryKey, personId: number) {
    client.setQueryData<Person[]>(key, (current) =>
        current?.filter((person) => person.id !== personId)
    );
}

/**
 * O que qualquer mudança de amizade torna obsoleto.
 *
 * O perfil entra junto porque ele publica `friendship_status`, `friends_count`
 * e a própria grade de amigos: sem invalidá-lo, desfazer uma amizade deixaria a
 * pessoa listada na aba "Amigos" do perfil até a próxima visita — era o que a
 * tela remendava buscando o perfil de novo na mão.
 */
function invalidateFriendship(client: QueryClient) {
    client.invalidateQueries({ queryKey: friendKeys.all });
    client.invalidateQueries({ queryKey: profileKeys.all });
}

/** Envia o convite. */
export function useSendFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (friendId: number): Promise<FriendshipResponse> => {
            const { data } = await api.post("/social-media/friends/send-request", {
                friend_id: friendId,
            });

            return data;
        },
        // quem foi convidado sai das sugestões; e o convite cruzado fecha
        // amizade direto no backend, o que também mexe na lista
        onSuccess: () => invalidateFriendship(queryClient),
    });
}

/** Aceita um convite recebido. */
export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: number): Promise<FriendshipResponse> => {
            const { data } = await api.post("/social-media/friends/accept", { user_id: userId });

            return data;
        },
        onSuccess: (_data, userId) => {
            dropFromCachedList(queryClient, friendKeys.requests(), userId);
            invalidateFriendship(queryClient);
        },
    });
}

/** Recusa um convite recebido. */
export function useDeclineFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: number): Promise<FriendshipResponse> => {
            const { data } = await api.post("/social-media/friends/decline", { user_id: userId });

            return data;
        },
        onSuccess: (_data, userId) => {
            dropFromCachedList(queryClient, friendKeys.requests(), userId);
            invalidateFriendship(queryClient);
        },
    });
}

/** Desfaz a amizade — as duas linhas caem no backend. */
export function useUnfriend() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personId: number): Promise<FriendshipResponse> => {
            const { data } = await api.delete(`/social-media/friends/${personId}`);

            return data;
        },
        onSuccess: (_data, personId) => {
            dropFromCachedList(queryClient, friendKeys.list(), personId);
            invalidateFriendship(queryClient);
        },
    });
}
