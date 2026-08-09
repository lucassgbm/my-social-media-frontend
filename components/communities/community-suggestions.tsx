'use client';

import { useEffect, useState } from "react";
import CommunityCard from "./community-card";
import Skeleton from "../skeleton";
import CommunityIcon from "../icons/community";
import { get } from "@/api/services/request";
import type { Community } from "../../utils/community";

type CommunitySuggestionsProps = {
    limit?: number;
    /** Classe do grid — cada tela tem uma largura de coluna diferente. */
    gridClassName?: string;
};

const DEFAULT_GRID = "grid grid-cols-1 gap-3";

/**
 * Comunidades para entrar.
 *
 * Os painéis de "comunidades sugeridas" mostravam o mesmo trio fixo de
 * comunidades fictícias; agora vêm de /social-media/community/suggestions, que
 * já exclui as que a pessoa participa (e aquelas de onde foi bloqueada).
 */
export default function CommunitySuggestions({
    limit = 4,
    gridClassName = DEFAULT_GRID,
}: CommunitySuggestionsProps) {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        get(`/social-media/community/suggestions?limit=${limit}`).then((response) => {
            if (!active) return;

            // get() engole o erro e devolve undefined — lista vazia é o fallback
            setCommunities(response?.data ?? []);
            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, [limit]);

    if (loading) {
        return (
            <div className={gridClassName}>
                {Array.from({ length: Math.min(limit, 3) }).map((_, index) => (
                    <Skeleton key={index} height="h-[72px]" rounded="card" />
                ))}
            </div>
        );
    }

    if (communities.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CommunityIcon className="size-8 text-content-subtle" />
                <p className="max-w-xs text-sm text-content-muted">
                    Nenhuma sugestão por agora — você já participa de todas as comunidades daqui.
                </p>
            </div>
        );
    }

    return (
        <div className={gridClassName}>
            {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
            ))}
        </div>
    );
}
