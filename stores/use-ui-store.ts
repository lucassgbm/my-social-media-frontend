import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UiState = {
    /** Gaveta de mensagens: o cabeçalho abre, o layout é quem renderiza. */
    openMessages: boolean;
    setOpenMessages: (open: boolean) => void;
    toggleMessages: () => void;

    /** Sidebar recolhida no formato só-ícones. Preferência, não sessão: persiste. */
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
};

/**
 * Estado de interface que atravessa telas.
 *
 * Só entra aqui o que mais de um componente precisa enxergar ou o que sobrevive
 * ao recarregamento. Menu aberto, modal de filtro e afins continuam em
 * `useState` de quem os desenha — subir isso para cá só espalharia acoplamento.
 */
export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            openMessages: false,
            setOpenMessages: (open) => set({ openMessages: open }),
            toggleMessages: () => set((state) => ({ openMessages: !state.openMessages })),

            sidebarCollapsed: false,
            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        }),
        {
            name: "ui-preferences",
            storage: createJSONStorage(() => localStorage),

            /**
             * Só a preferência da sidebar atravessa o recarregamento — a gaveta
             * de mensagens reabrindo sozinha ao voltar ao site seria um susto.
             */
            partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),

            /**
             * A leitura do localStorage acontece depois da montagem, por conta
             * de `rehydrateUiPreferences()`.
             *
             * O HTML do servidor não tem como saber a preferência: se o store já
             * nascesse com ela, o primeiro render do cliente divergiria do
             * servidor e o React acusaria erro de hidratação. A sidebar começa
             * expandida nos dois lados e se ajusta no quadro seguinte.
             */
            skipHydration: true,
        }
    )
);

/** Chamado uma vez, depois da montagem — ver a nota de `skipHydration`. */
export function rehydrateUiPreferences() {
    void useUiStore.persist.rehydrate();
}
