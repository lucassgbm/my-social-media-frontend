import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { postFormData } from "@/api/services/request";
import type { ProfilePost, PublicProfile, UserPhoto } from "../utils/profile";

/**
 * Chaves do perfil público.
 *
 * A chave é o `identifier` da rota, que tanto pode ser o id quanto o nome — a
 * API resolve os dois, e as duas formas de chegar na mesma pessoa acabam em
 * entradas separadas do cache. É desperdício pequeno e previsível; unificar
 * exigiria conhecer o id antes de buscar.
 */
export const profileKeys = {
    all: ["profile"] as const,
    detail: (identifier: string) => [...profileKeys.all, identifier] as const,
};

export const userPhotoKeys = {
    all: ["user-photos"] as const,
    list: (userId: number) => [...userPhotoKeys.all, userId] as const,
};

export const userPostKeys = {
    all: ["user-posts"] as const,
    list: (userId: number) => [...userPostKeys.all, userId] as const,
};

/** Perfil que não existe — o 404 da API, separado de uma falha de rede. */
export function isNotFound(error: unknown): boolean {
    return (error as { response?: { status?: number } })?.response?.status === 404;
}

/**
 * Perfil público de alguém.
 *
 * Não repete a busca no 404: pessoa inexistente continua inexistente na
 * segunda tentativa, e a tela de "não encontrado" apareceria com o atraso de
 * uma ida e volta à toa.
 */
export function useProfile(identifier: string) {
    return useQuery({
        queryKey: profileKeys.detail(identifier),
        queryFn: async (): Promise<PublicProfile> => {
            const { data } = await api.get(
                `/social-media/users/${encodeURIComponent(identifier)}`
            );

            return data.data;
        },
        retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
    });
}

/** Fotos do álbum de alguém. Espera o perfil resolver o id. */
export function useUserPhotos(userId: number | undefined) {
    return useQuery({
        queryKey: userPhotoKeys.list(userId ?? 0),
        queryFn: async (): Promise<UserPhoto[]> => {
            const { data } = await api.get(`/social-media/user-photos?user_id=${userId}`);

            return data?.data ?? [];
        },
        enabled: userId !== undefined,
    });
}

/** Posts de alguém, do feed recortado por autor. */
export function useUserPosts(userId: number | undefined) {
    return useQuery({
        queryKey: userPostKeys.list(userId ?? 0),
        queryFn: async (): Promise<ProfilePost[]> => {
            const { data } = await api.get(`/social-media/feed?user_id=${userId}`);

            return data?.data ?? [];
        },
        enabled: userId !== undefined,
    });
}

/**
 * Publica uma foto no álbum.
 *
 * Invalida também o perfil: `photos_count` sai de lá, e sem isso o contador do
 * cabeçalho ficaria uma foto atrás do álbum.
 */
export function useUploadUserPhoto(userId: number | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File | string) => {
            const formData = new FormData();

            formData.append("photo_path", file);
            formData.append("description", "");

            return postFormData("/social-media/user-photos", formData);
        },
        onSuccess: () => {
            if (userId !== undefined) {
                queryClient.invalidateQueries({ queryKey: userPhotoKeys.list(userId) });
            }

            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}
