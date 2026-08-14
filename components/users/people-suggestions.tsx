'use client';

import CardUser from "./card-user";
import Skeleton from "../skeleton";
import UsersIcon from "../icons/users";
import { useFriendSuggestions } from "../../hooks/use-friends";

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
 * qualquer direção.
 *
 * Quem é convidado some da lista sem ninguém aqui mandar: a mutação do botão
 * invalida as chaves de amizade e esta consulta se refaz. Antes o componente
 * filtrava a pessoa localmente, o que era um palpite sobre o que o servidor
 * faria — e ficava errado no convite cruzado, que fecha amizade em vez de
 * deixar o convite pendente.
 */
export default function PeopleSuggestions({
    limit = 6,
    gridClassName = DEFAULT_GRID,
}: PeopleSuggestionsProps) {
    const { data, isPending } = useFriendSuggestions(limit);

    const people = data ?? [];

    if (isPending) {
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
                <CardUser key={person.id} user={person} />
            ))}
        </div>
    );
}
