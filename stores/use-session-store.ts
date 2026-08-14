import { create } from "zustand";
import { get } from "@/api/services/request";

/**
 * Espelha App\Http\Resources\UserResource (GET /social-media/user).
 * Os campos nullable no banco chegam como null — daí os opcionais.
 */
export type MyInfo = {
    id: number;
    name: string;
    email: string;
    /** URL assinada e temporária do R2 (10 min). Vazia quando não há foto. */
    photo: string;
    /** Caminho cru no bucket, sem assinatura. */
    photo_url?: string | null;
    /** Capa do perfil: URL assinada do R2, null enquanto o usuário não enviou uma. */
    cover?: string | null;
    cover_url?: string | null;
    autodescription: string;
    birthdate?: string | null;
    age?: number | null;
    city?: string | null;
    uf?: string | null;
    phone?: string | null;
    /** Contadores da sidebar — `loadCount` na rota GET /social-media/user. */
    friends_count?: number;
    communities_count?: number;
};

type SessionState = {
    myInfo: MyInfo | null;
    /** Requisição em andamento: o cabeçalho e a sidebar mostram o esqueleto. */
    loading: boolean;
    /** Já respondeu ao menos uma vez — separa "sem sessão" de "ainda não perguntei". */
    loaded: boolean;

    loadMyInfo: () => Promise<void>;
    setMyInfo: (myInfo: MyInfo | null) => void;
    /** Logout: zera antes de sair para a tela de login. */
    clear: () => void;
};

/**
 * Requisição em voo, compartilhada por quem chamar `loadMyInfo` enquanto ela
 * não volta.
 *
 * Vive fora do estado de propósito: não é algo que a interface desenhe, e
 * guardá-la no store faria cada chamada re-renderizar todo mundo à toa. Sem
 * essa trava, o StrictMode do desenvolvimento (que monta o layout duas vezes) e
 * qualquer segunda tela que peça a sessão disparariam GETs repetidos.
 */
let inFlight: Promise<void> | null = null;

/**
 * Sessão do usuário logado.
 *
 * Era um AppContext exportado de dentro do `layout.tsx` da área logada, o que o
 * App Router não aceita — o `tsc` reclamava do export a cada build. Além disso,
 * o contexto entregava o objeto inteiro: trocar a foto no editor de perfil
 * re-renderizava cabeçalho, sidebar, menu inferior e a página junto. Aqui cada
 * tela assina só o campo que usa.
 *
 * Atenção ao escolher no seletor: o zustand v5 compara por identidade, então
 * seletores que montam objeto novo (`(s) => ({ a: s.a })`) re-renderizam sempre.
 * Pegue um campo por vez, como em `useMyInfo`.
 */
export const useSessionStore = create<SessionState>((set) => ({
    myInfo: null,
    loading: false,
    loaded: false,

    loadMyInfo: () => {
        if (inFlight) return inFlight;

        set({ loading: true });

        // get() já engole o erro e devolve undefined; sem sessão o resultado é
        // o mesmo de "não carregou" e o middleware do axios manda para o login
        inFlight = get("/social-media/user")
            .then((response: { data?: MyInfo } | undefined) => {
                set({ myInfo: response?.data ?? null, loading: false, loaded: true });
            })
            .finally(() => {
                inFlight = null;
            });

        return inFlight;
    },

    setMyInfo: (myInfo) => set({ myInfo, loaded: true }),

    clear: () => set({ myInfo: null, loaded: false, loading: false }),
}));

/** Atalho do caso comum — quem só lê o usuário não assina o resto do store. */
export const useMyInfo = () => useSessionStore((state) => state.myInfo);
