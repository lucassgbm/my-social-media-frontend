'use client';

import { useCallback, useEffect, useState } from "react";
import CardUser from "./card-user";
import Skeleton from "../skeleton";
import UsersIcon from "../icons/users";
import { get } from "@/api/services/request";
import type { FriendshipStatus, Person } from "../../utils/friendship";

type PeopleSuggestionsProps = {
    /** Quantas pessoas pedir à API. */
    limit?: number;
    /** Classe do grid — cada tela tem uma largura de coluna diferente. */
    gridClassName?: string;
};

const DEFAULT_GRID = "grid grid-cols-2 gap-3";

/**
 * Pessoas que o usuário ainda não adicionou.
 *
 * Os três painéis de sugestão da aplicação (feed, lista de amigos e perfil)
 * mostravam o mesmo array fixo de sete pessoas fictícias. Agora vêm de
 * /social-media/friends/suggestions, que já exclui amigos e convites em
 * qualquer direção — quem foi convidado some da lista no próximo carregamento.
 */
export default function PeopleSuggestions({
    limit = 6,
    gridClassName = DEFAULT_GRID,
}: PeopleSuggestionsProps) {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        get(`/social-media/friends/suggestions?limit=${limit}`).then((response) => {
            if (!active) return;

            // get() engole o erro e devolve undefined — lista vazia é o fallback
            setPeople(response?.data ?? []);
            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, [limit]);

    /** Depois de convidar, a pessoa sai da lista de sugestões. */
    const handleStatusChange = useCallback((personId: number, status: FriendshipStatus) => {
        if (status === "none") return;
        setPeople((current) => current.filter((person) => person.id !== personId));
    }, []);

    if (loading) {
        return (
            <div className={gridClassName}>
                {/* mesma caixa do CardUser: sem o min-h a lista pula de altura
                    quando os cards entram */}
                {Array.from({ length: Math.min(limit, 4) }).map((_, index) => (
                    <Skeleton
                        key={index}
                        width="w-full"
                        rounded="card"
                        className="aspect-square min-h-[170px]"
                    />
                ))}
            </div>
        );
    }

    if (people.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
                <UsersIcon className="size-8 text-content-subtle" />
                <p className="max-w-xs text-sm text-content-muted">
                    Nenhuma sugestão por agora — você já se conectou com todo mundo por aqui.
                </p>
            </div>
        );
    }

    return (
        <div className={gridClassName}>
            {people.map((person) => (
                <CardUser key={person.id} user={person} onStatusChange={handleStatusChange} />
            ))}
        </div>
    );
}
