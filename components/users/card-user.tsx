import type { ReactNode } from "react";
import Image from "../remote-image";
import Link from "next/link";
import AddFriendButton from "./add-friend-button";
import { locationOf, type FriendshipStatus, type Person } from "../../utils/friendship";

type CardUserProps = {
    user: Person;
    onStatusChange?: (personId: number, status: FriendshipStatus) => void;
    /**
     * Botões extras da coluna do canto, abaixo do de amizade — a moderação da
     * comunidade entra por aqui.
     */
    actions?: ReactNode;
};

/**
 * Card de pessoa usado nas listas (amigos, sugestões, membros de comunidade).
 *
 * A altura é do card, não da foto: com `aspect-square` na <Image> o card
 * dependia da largura que a imagem conseguisse resolver — dentro do flex-item
 * sem largura definida ela ia a zero e sobrava só a faixa do overlay. Agora o
 * container manda na proporção e a foto preenche, então uma imagem que falhe
 * ao carregar não achata mais o card.
 *
 * O botão do canto era um "mais opções" sem ação nenhuma; agora é o de amizade,
 * e ele só aparece quando a API mandou o `friendship_status` daquela pessoa.
 */
export default function CardUser({ user, onStatusChange, actions }: CardUserProps) {
    const location = locationOf(user);
    const status = user.friendship_status;
    const showFriendButton = !!status && status !== "self";

    return (
        <div className="group relative w-full aspect-square min-h-[170px] overflow-hidden
            rounded-card border border-line bg-surface-2">

            <Image
                src={user.photo || '/imgs/placeholder.png'}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />

            {/* pt generoso: o gradiente precisa de espaço para nascer
                transparente, senão o texto encosta numa borda dura */}
            {/* navega por id: nome não é único e a API resolve os dois */}
            <Link
                href={`/social-media/profile/${user.id}`}
                className="absolute inset-x-0 bottom-0 flex flex-col
                    bg-linear-to-t from-black via-black/70 to-transparent p-3 pt-10 text-white
                    focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-ring"
            >
                <span className="text-sm font-semibold truncate">{user.name}</span>
                {/* {user.autodescription && (
                    <p className="text-xs font-normal text-gray-200 line-clamp-2">
                        {user.autodescription}
                    </p>
                )} */}
                {location && (
                    <p className="text-xs font-normal text-gray-300 truncate">{location}</p>
                )}
            </Link>

            {/* coluna única: as ações se empilham sozinhas sob o botão de
                amizade, sem ninguém precisar acertar deslocamentos à mão */}
            {(showFriendButton || actions) && (
                <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                    {showFriendButton && (
                        <AddFriendButton
                            person={user}
                            iconOnly
                            className="shadow-sm"
                            onStatusChange={onStatusChange}
                        />
                    )}
                    {actions}
                </div>
            )}
        </div>
    )
}
