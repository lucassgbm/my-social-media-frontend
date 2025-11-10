

import Container from "../../../../../components/container";
import ListFriends from "../../../../../components/friends/list-friends";
import PlusIcon from "../../../../../components/icons/plus";
import Card from "../../../../../components/card";
import Modal from "../../../../../components/modal";
import ColorButton from "../../../../../components/color-button";

export default function Home() {
    return (
        <>

            <div className="col-span-full sm:col-span-8 gap-4">
                <Container className="w-full h-full " padding="p-0">
                    <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                        <div>

                            <h1 className="text-2xl font-semibold mb-4">Amigos</h1>
                        </div>
                    
                        <div className="flex flex-row gap-2">

                            <ColorButton>
                                <PlusIcon />
                            </ColorButton>
                        </div>
                    
                    </div>
                    
                    <div className="fle flex-col gap-4 p-4">

                        <div className="flex flex-row border-b border-neutral-200 dark:border-neutral-800 gap-2">
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-neutral-800 cursor-pointer font-semibold">Todos</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Melhores amigos</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Pedido de amizade</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Sugestão</div>
                            <div className="p-2 hover:bg-neutral-800 border-b-4 border-transparent cursor-pointer font-semibold">Mais</div>
                        </div>
                        <div className="col-span-3 p-4 mb-4">
                            <div className="flex flex-row mb-4">

                                <h2 className="w-[200px] text-sm text-neutral-800 dark:text-white font-semibold">Todos os amigos</h2>
                                <div className="w-full flex justify-end">

                                    <input className="text-sm text-gray-700 dark:text-white bg-white dark:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 rounded-lg pl-2 py-2" type="text" placeholder="Procurar"></input>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                                <ListFriends />
                            </div>
                        </div>
                    </div>
                    
                </Container>
            </div>

        </>
    )
}