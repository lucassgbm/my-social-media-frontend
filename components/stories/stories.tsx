'use client';

import { useCallback, useEffect, useState } from "react";
import { useMyInfo } from "../../stores/use-session-store";
import { get, post, remove } from "@/api/services/request";
import { useToaster } from "../../providers/toaster-provider";
import StoriesBar from "./stories-bar";
import StoryComposer from "./story-composer";
import StoryViewer from "./story-viewer";
import { markStorySeen, removeStory, type StoryGroup } from "../../utils/story";

/**
 * Stories do feed: a barra de anéis, o visualizador e a tela de publicar.
 *
 * Este componente é o dono do estado — a barra e o visualizador só desenham o
 * que recebem. Antes tudo isso vivia num arquivo de mil linhas, com um array
 * de dezenas de pessoas fictícias escrito à mão e nenhuma chamada à API.
 */
export default function Stories() {
    const myInfo = useMyInfo();
    const { showToast } = useToaster();

    const [groups, setGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    /** Índice do autor aberto no visualizador; null com ele fechado. */
    const [viewing, setViewing] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);

        // get() engole o erro e devolve undefined
        const response = await get("/social-media/story");

        setGroups(response?.data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    /**
     * Marca como visto.
     *
     * O estado local muda na hora, sem esperar a resposta: o anel apagando só
     * depois do ida-e-volta pareceria travamento, e reenviar é inofensivo — o
     * endpoint é idempotente.
     */
    const handleSeen = useCallback((storyId: number) => {
        setGroups((current) => markStorySeen(current, storyId));

        post(`/social-media/story/${storyId}/seen`, {});
    }, []);

    const handleDelete = useCallback(
        async (storyId: number) => {
            try {
                await remove(`/social-media/story/${storyId}`);

                setGroups((current) => removeStory(current, storyId));

                showToast({ title: "Story", message: "Story removido.", status: "success" });
            } catch {
                showToast({
                    title: "Story",
                    message: "Não foi possível remover o story.",
                    status: "error",
                });
            }
        },
        [showToast]
    );

    return (
        <>
            <StoriesBar
                groups={groups}
                loading={loading}
                myPhoto={myInfo?.photo}
                onOpen={setViewing}
                onCompose={() => setComposing(true)}
            />

            {viewing !== null && groups.length > 0 && (
                <StoryViewer
                    groups={groups}
                    startIndex={viewing}
                    onClose={() => setViewing(null)}
                    onSeen={handleSeen}
                    onDelete={handleDelete}
                />
            )}

            {composing && (
                <StoryComposer onClose={() => setComposing(false)} onCreated={load} />
            )}
        </>
    );
}
