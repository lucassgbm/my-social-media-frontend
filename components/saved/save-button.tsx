'use client';

import { useEffect, useState } from "react";
import BookMarkIcon from "../icons/book-mark";
import { useToaster } from "../../providers/toaster-provider";
import { post, remove } from "@/api/services/request";
import { SAVED_ENDPOINT, type SavedType } from "../../utils/saved";

type SaveButtonProps = {
    type: SavedType;
    itemId: number;
    /** Estado que veio da API (`viewer_saved`). */
    saved?: boolean;
    /** Avisa o pai depois que a API confirma — a lista de salvos usa para tirar o item da tela. */
    onChange?: (saved: boolean) => void;
    /**
     * `plain` acompanha o fundo da tela (barra de ações do post);
     * `chip` é o botão redondo do canto de um card do tema;
     * `floating` é a mesma pastilha, escura, para quando o card é uma foto.
     */
    variant?: "plain" | "chip" | "floating";
    /** Texto ao lado do ícone. Sem ele o botão fica só com o marcador. */
    label?: string;
    className?: string;
    iconClassName?: string;
};

const base = `inline-flex items-center justify-center gap-2 transition-colors cursor-pointer
    focus-visible:outline-2 focus-visible:outline-offset-2
    disabled:pointer-events-none disabled:opacity-50`;

const variants = {
    plain: `rounded-field py-2 text-content-muted hover:bg-surface-2 hover:text-content
        focus-visible:outline-brand-ring`,
    chip: `rounded-full bg-surface-3 p-2 text-content hover:bg-line-strong
        focus-visible:outline-brand-ring`,
    floating: `rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70
        focus-visible:outline-white`,
};

/**
 * Marcador de "salvar para ver depois", usado no post do feed, no card de
 * evento e na própria lista de salvos.
 *
 * O clique é otimista: o marcador muda na hora e volta atrás se a API recusar.
 * Guardar um item é uma ação sem consequência para mais ninguém — esperar a
 * resposta para pintar o ícone só faria a tela parecer travada.
 */
export default function SaveButton({
    type,
    itemId,
    saved = false,
    onChange,
    variant = "plain",
    label,
    className = "",
    iconClassName = "size-5",
}: SaveButtonProps) {
    const { showToast } = useToaster();

    const [isSaved, setIsSaved] = useState(saved);
    const [sending, setSending] = useState(false);

    // a lista pode ser recarregada (mudar de aba, paginar) e trazer outro
    // estado para o mesmo card
    useEffect(() => {
        setIsSaved(saved);
    }, [saved]);

    async function toggle() {
        const next = !isSaved;

        setIsSaved(next);
        setSending(true);

        try {
            if (next) {
                // post() engole o erro e devolve undefined
                const response = await post(SAVED_ENDPOINT, { type, id: itemId });
                if (!response) throw new Error("save failed");
            } else {
                await remove(`${SAVED_ENDPOINT}/${type}/${itemId}`);
            }

            onChange?.(next);
        } catch {
            setIsSaved(!next);

            showToast({
                title: "Salvos",
                message: next
                    ? "Não foi possível salvar este item."
                    : "Não foi possível remover este item dos salvos.",
                status: "error",
            });
        } finally {
            setSending(false);
        }
    }

    const action = isSaved ? "Remover dos salvos" : "Salvar";

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={sending}
            aria-pressed={isSaved}
            aria-label={label ? undefined : action}
            title={action}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {/* a cor do estado salvo vai no ícone, e não no botão: quem chama
                passa a própria classe de texto (a barra de ações do post, por
                exemplo) e as duas brigariam no mesmo elemento */}
            <BookMarkIcon
                className={`${iconClassName} ${isSaved && variant !== "floating" ? "text-brand" : ""}`}
                filled={isSaved}
            />
            {label && <span>{label}</span>}
        </button>
    );
}
