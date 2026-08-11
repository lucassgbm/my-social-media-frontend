'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "../remote-image";
import CloseIcon from "../icons/close";
import TrashIcon from "../icons/trash";
import ArrowLeftIcon from "../icons/arrow-left";
import ArrowRightIcon from "../icons/arrow-right";
import OverlayButton from "./overlay-button";
import { STORY_DURATION_MS, timeAgo, type StoryGroup } from "../../utils/story";

type StoryViewerProps = {
    groups: StoryGroup[];
    /** Autor por onde começar — o círculo em que a pessoa clicou. */
    startIndex: number;
    onClose: () => void;
    /** Chamado uma vez por story exibido. */
    onSeen: (storyId: number) => void;
    onDelete: (storyId: number) => void;
};

/** Toque mais longo que isto é "segurar para pausar", não um toque. */
const TAP_MS = 200;

/**
 * Visualizador de stories em tela cheia.
 *
 * Avança sozinho a cada {@link STORY_DURATION_MS}, encadeando os autores: ao
 * fim do último story de alguém, entra o próximo da barra.
 *
 * Toque/clique na metade esquerda volta, na direita avança, e segurar pausa.
 * Setas, espaço e Esc fazem o mesmo pelo teclado.
 */
export default function StoryViewer({
    groups,
    startIndex,
    onClose,
    onSeen,
    onDelete,
}: StoryViewerProps) {
    const [groupIndex, setGroupIndex] = useState(startIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    /**
     * O progresso também vive num ref: o laço de animação precisa saber de onde
     * retomar depois de uma pausa, e ler isso do estado traria o valor do
     * quadro anterior.
     */
    const progressRef = useRef(0);
    const pressedAt = useRef(0);

    const group = groups[groupIndex];
    const story = group?.stories[storyIndex];

    /** Zera o cronômetro — todo salto entre fotos passa por aqui. */
    const reset = useCallback(() => {
        progressRef.current = 0;
        setProgress(0);
    }, []);

    const goTo = useCallback((nextGroup: number, nextStory: number) => {
        reset();
        setGroupIndex(nextGroup);
        setStoryIndex(nextStory);
    }, [reset]);

    const goNext = useCallback(() => {
        if (!group) return onClose();

        if (storyIndex + 1 < group.stories.length) {
            return goTo(groupIndex, storyIndex + 1);
        }

        // acabou o autor: emenda no próximo da barra
        if (groupIndex + 1 < groups.length) {
            return goTo(groupIndex + 1, 0);
        }

        onClose();
    }, [group, groupIndex, groups.length, storyIndex, goTo, onClose]);

    const goPrevious = useCallback(() => {
        if (storyIndex > 0) {
            return goTo(groupIndex, storyIndex - 1);
        }

        if (groupIndex > 0) {
            const previous = groups[groupIndex - 1];

            // voltando, entra-se no último story do autor anterior
            return goTo(groupIndex - 1, Math.max(previous.stories.length - 1, 0));
        }

        // já no começo de tudo: reinicia a foto atual
        reset();
    }, [groupIndex, groups, storyIndex, goTo, reset]);

    // --- Cronômetro --------------------------------------------------------

    useEffect(() => {
        if (!story || paused) return;

        // retoma de onde parou: sem o desconto, despausar reiniciaria a barra
        const startedAt = performance.now() - progressRef.current * STORY_DURATION_MS;
        let frame = 0;

        function tick(now: number) {
            const ratio = Math.min((now - startedAt) / STORY_DURATION_MS, 1);

            progressRef.current = ratio;
            setProgress(ratio);

            if (ratio >= 1) {
                goNext();
                return;
            }

            frame = requestAnimationFrame(tick);
        }

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [story, paused, goNext]);

    /** Exibiu, então está visto — o anel do autor apaga na barra atrás. */
    useEffect(() => {
        if (story && !story.seen) onSeen(story.id);
    }, [story, onSeen]);

    /**
     * Apagar um story encolhe a lista embaixo do visualizador: sem reancorar,
     * o índice atual passaria a apontar para o vazio e a tela ficaria preta.
     */
    useEffect(() => {
        if (groups.length === 0) return onClose();

        const current = groups[groupIndex];

        // o autor saiu da lista (era o último story dele)
        if (!current) return goTo(Math.max(groups.length - 1, 0), 0);

        if (storyIndex >= current.stories.length) {
            goTo(groupIndex, Math.max(current.stories.length - 1, 0));
        }
    }, [groups, groupIndex, storyIndex, goTo, onClose]);

    // --- Teclado -----------------------------------------------------------

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") return onClose();
            if (event.key === "ArrowRight") return goNext();
            if (event.key === "ArrowLeft") return goPrevious();

            if (event.key === " ") {
                event.preventDefault();
                setPaused((current) => !current);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goNext, goPrevious, onClose]);

    /** A página atrás não deve rolar enquanto o visualizador está aberto. */
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    // --- Toque -------------------------------------------------------------

    function handlePointerDown() {
        pressedAt.current = performance.now();
        setPaused(true);
    }

    /** Solta: toque curto navega, toque longo era só uma pausa. */
    function handlePointerUp(direction: "previous" | "next") {
        const held = performance.now() - pressedAt.current;
        setPaused(false);

        if (held >= TAP_MS) return;

        if (direction === "next") goNext();
        else goPrevious();
    }

    const bars = useMemo(() => group?.stories ?? [], [group]);

    if (!group || !story) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Stories de ${group.user.name}`}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-0 sm:p-4"
        >
            {/* clicar fora do quadro fecha, como em qualquer modal da casa */}
            <button
                type="button"
                aria-label="Fechar stories"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <div
                className="relative flex h-full w-full max-w-[440px] flex-col overflow-hidden
                    bg-neutral-900 sm:h-[92vh] sm:rounded-card"
            >
                <Image
                    key={story.id}
                    src={story.photo || "/imgs/placeholder.png"}
                    alt={story.description || `Story de ${group.user.name}`}
                    fill
                    sizes="440px"
                    priority
                    className="object-cover"
                />

                {/* gradientes: é o que garante a leitura do topo e da legenda
                    sobre qualquer foto */}
                <div aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-40
                        bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                <div aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40
                        bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* zonas de toque, atrás da barra e dos botões */}
                <div className="absolute inset-0 flex">
                    <button
                        type="button"
                        aria-label="Story anterior"
                        onPointerDown={handlePointerDown}
                        onPointerUp={() => handlePointerUp("previous")}
                        onPointerCancel={() => setPaused(false)}
                        onPointerLeave={() => setPaused(false)}
                        className="h-full w-1/3 cursor-pointer focus-visible:outline-2
                            focus-visible:-outline-offset-4 focus-visible:outline-white"
                    />
                    <button
                        type="button"
                        aria-label="Próximo story"
                        onPointerDown={handlePointerDown}
                        onPointerUp={() => handlePointerUp("next")}
                        onPointerCancel={() => setPaused(false)}
                        onPointerLeave={() => setPaused(false)}
                        className="h-full w-2/3 cursor-pointer focus-visible:outline-2
                            focus-visible:-outline-offset-4 focus-visible:outline-white"
                    />
                </div>

                {/* --- Topo -------------------------------------------------- */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-3">
                    <div className="flex flex-row gap-1">
                        {bars.map((item, index) => (
                            <div key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                                <div
                                    className="h-full bg-white"
                                    style={{
                                        width: `${index < storyIndex ? 100 : index === storyIndex ? progress * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row items-center gap-3">
                        <Link
                            href={`/social-media/profile/${group.user.id}`}
                            onClick={onClose}
                            className="pointer-events-auto flex min-w-0 flex-1 flex-row items-center gap-2
                                rounded-full focus-visible:outline-2 focus-visible:outline-offset-2
                                focus-visible:outline-white"
                        >
                            <Image
                                src={group.user.photo || "/imgs/placeholder.png"}
                                alt=""
                                width={34}
                                height={34}
                                sizes="34px"
                                className="size-[34px] shrink-0 rounded-full object-cover ring-2 ring-white/70"
                            />

                            <span className="truncate text-sm font-semibold text-white drop-shadow">
                                {group.is_mine ? "Seu story" : group.user.name}
                            </span>
                            <span className="shrink-0 text-xs text-white/70 drop-shadow">
                                {timeAgo(story.created_at)}
                            </span>
                        </Link>

                        {story.can_delete && (
                            <OverlayButton
                                label="Apagar este story"
                                onClick={() => onDelete(story.id)}
                            >
                                <TrashIcon className="size-4" />
                            </OverlayButton>
                        )}

                        <OverlayButton label="Fechar stories" onClick={onClose}>
                            <CloseIcon className="size-4" />
                        </OverlayButton>
                    </div>
                </div>

                {/* --- Legenda ------------------------------------------------ */}
                {story.description && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-center
                        text-sm text-white drop-shadow-lg">
                        {story.description}
                    </p>
                )}

                {/* --- Setas (desktop) ---------------------------------------- */}
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center pl-2 sm:flex">
                    <OverlayButton label="Story anterior" onClick={goPrevious}>
                        <ArrowLeftIcon className="size-4" />
                    </OverlayButton>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-2 sm:flex">
                    <OverlayButton label="Próximo story" onClick={goNext}>
                        <ArrowRightIcon className="size-4" />
                    </OverlayButton>
                </div>
            </div>
        </div>
    );
}
