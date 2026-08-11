'use client';

import Link from "next/link";
import Image from "../remote-image";
import Container from "../container";
import Skeleton from "../skeleton";
import PlusIcon from "../icons/plus";
import { firstName, type StoryGroup } from "../../utils/story";

type StoriesBarProps = {
    /** Grupos da API, já na ordem em que devem aparecer. */
    groups: StoryGroup[];
    loading: boolean;
    /** Foto do usuário logado — o primeiro círculo é sempre dele. */
    myPhoto?: string | null;
    /** Abre o visualizador no autor de índice `index`. */
    onOpen: (index: number) => void;
    /** Abre a tela de publicar. */
    onCompose: () => void;
};

/**
 * Barra horizontal de stories dos amigos.
 *
 * O primeiro círculo é sempre o do usuário logado: com story no ar ele abre os
 * próprios (e o `+` publica outro); sem nenhum, o círculo inteiro publica.
 *
 * O anel colorido sai do `has_unseen` que vem da API — antes era um booleano
 * de um array fixo no código, e nunca mudava de estado.
 */
export default function StoriesBar({
    groups,
    loading,
    myPhoto,
    onOpen,
    onCompose,
}: StoriesBarProps) {
    const mineIndex = groups.findIndex((group) => group.is_mine);
    const mine = mineIndex >= 0 ? groups[mineIndex] : null;
    const others = groups.filter((group) => !group.is_mine);

    return (
        <Container className="mb-4 rounded-card" padding="p-3">
            <ul className="flex flex-row gap-4 overflow-x-auto scrollbar-hide list-none">

                <li className="shrink-0">
                    <div className="relative w-[72px]">
                        <StoryTile
                            photo={mine?.user.photo ?? myPhoto}
                            label="Seu story"
                            // sem story no ar, o círculo é o próprio atalho de publicar
                            ring={mine?.has_unseen ? "unseen" : mine ? "seen" : "none"}
                            onClick={() => (mine ? onOpen(mineIndex) : onCompose())}
                            ariaLabel={mine ? "Ver o seu story" : "Publicar um story"}
                        />

                        {/* botão à parte: com story no ar o círculo já abre o
                            seu, e ainda assim é preciso poder publicar outro */}
                        <button
                            type="button"
                            onClick={onCompose}
                            aria-label="Publicar um story"
                            className="absolute right-0 top-[44px] flex size-6 items-center justify-center
                                rounded-full border-2 border-surface bg-brand text-on-brand
                                cursor-pointer transition-colors hover:bg-brand-hover
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                        >
                            <PlusIcon className="size-3.5" />
                        </button>
                    </div>
                </li>

                {loading &&
                    Array.from({ length: 6 }).map((_, index) => (
                        <li key={index} className="shrink-0">
                            <div className="flex w-[72px] flex-col items-center gap-1.5">
                                <Skeleton width="w-16" height="h-16" rounded="full" />
                                <Skeleton width="w-12" height="h-2.5" rounded="full" />
                            </div>
                        </li>
                    ))}

                {!loading &&
                    others.map((group) => (
                        <li key={group.user.id} className="shrink-0">
                            <StoryTile
                                photo={group.user.photo}
                                label={firstName(group.user.name)}
                                ring={group.has_unseen ? "unseen" : "seen"}
                                onClick={() => onOpen(groups.indexOf(group))}
                                ariaLabel={`Ver os stories de ${group.user.name}`}
                            />
                        </li>
                    ))}

                {!loading && others.length === 0 && (
                    <li className="flex min-h-16 flex-1 items-center">
                        {/* a barra só traz amigos: sem nenhum, o caminho é a
                            tela de amigos, não esperar alguém publicar */}
                        <p className="text-xs text-content-muted">
                            Nenhum amigo publicou nas últimas 24h.{" "}
                            <Link
                                href="/social-media/friends"
                                className="font-semibold text-brand hover:underline
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                            >
                                Encontre pessoas
                            </Link>{" "}
                            ou publique o seu.
                        </p>
                    </li>
                )}
            </ul>
        </Container>
    );
}

type StoryTileProps = {
    photo?: string | null;
    label: string;
    /** `unseen` acende o anel; `seen` deixa cinza; `none` some com ele. */
    ring: "unseen" | "seen" | "none";
    onClick: () => void;
    ariaLabel: string;
};

/** Um círculo da barra: anel, foto e nome. */
function StoryTile({ photo, label, ring, onClick, ariaLabel }: StoryTileProps) {
    // o degradê é o anel "tem novidade"; visto vira só uma borda apagada
    const ringClass =
        ring === "unseen"
            ? "bg-gradient-to-tr from-green-400 via-brand to-green-600"
            : ring === "seen"
                ? "bg-line-strong"
                : "bg-transparent";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className="flex w-[72px] flex-col items-center gap-1.5 cursor-pointer rounded-card
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
        >
            <span className={`rounded-full p-[2.5px] transition-transform duration-200
                hover:scale-105 ${ringClass}`}>
                {/* anel interno na cor da superfície: é o que separa o degradê
                    da foto, senão eles encostam e o anel some */}
                <span className="block rounded-full bg-surface p-[2px]">
                    <Image
                        src={photo || "/imgs/placeholder.png"}
                        alt=""
                        width={60}
                        height={60}
                        sizes="60px"
                        className="size-[60px] rounded-full object-cover bg-surface-2"
                    />
                </span>
            </span>

            <span className="w-full truncate text-center text-[11px] text-content-muted">
                {label}
            </span>
        </button>
    );
}
