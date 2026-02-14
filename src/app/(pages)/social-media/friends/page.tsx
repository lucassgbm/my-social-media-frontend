'use client';

import Container from "../../../../../components/container";
import ListFriends from "../../../../../components/friends/list-friends";
import PlusIcon from "../../../../../components/icons/plus";
import ColorButton from "../../../../../components/color-button";
import { useEffect, useState } from "react";
import { get, post } from "@/api/services/request";
import RequestFriend from "../../../../../components/friends/request-friend";
import { request } from "http";
import Toaster from "../../../../../components/toaster";

export default function Home() {

    const [activeTab, setActiveTab] = useState('list');
    const [friends, setFriends] = useState([]);
    const [toaster, setToaster] = useState({
        show: false,
        message: "",
        title: "",
        status: '',
    });

    const [requestsFriend, setRequestsFriend] = useState([]);

    useEffect(() => {
        getFriends();
    },[])
    
    async function getFriends() {
        
        try{

            const response = await get('/social-media/friends');

            setFriends(response.data);

        }catch(error){
            console.log(error);
        }
    }
    
    async function getBestFriends(){
        
    }

    async function getRequestsFriend(){
        try{

            const response = await get('/social-media/friends/requests');

            setRequestsFriend(response.data);

        }catch(error){
            console.log(error);
        }
    }

    async function acceptRequest(userId : number){ 
        try {
    
            const body = {
                user_id: userId
            }
            const response = await post("/social-media/friends/accept", body);
            setToaster({...toaster, show: true, message: "Vocês agora são amigos", status: 'success', title: "Amigo"});
            getFriends();
            setActiveTab('list');
        } catch (error: any) {
            console.log(error);
        }
    }

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
                            <button 
                                onClick={() => {setActiveTab("list"); getFriends()}} 
                                className={`p-2 hover:bg-neutral-800 border-b-4 cursor-pointer font-semibold ${activeTab == "list" ? "border-neutral-800" : "border-transparent"}`}>
                                    Todos
                            </button>
                            <button 
                                onClick={() => {setActiveTab("best-friends"); getBestFriends()}} 
                                className={`p-2 hover:bg-neutral-800 border-b-4 cursor-pointer font-semibold ${activeTab == "best-friends" ? "border-neutral-800" : "border-transparent"}`}>
                                    Melhores amigos
                            </button>
                            <button 
                                onClick={() => {setActiveTab("request-friend"); getRequestsFriend()}} 
                                className={`p-2 hover:bg-neutral-800 border-b-4 cursor-pointer font-semibold ${activeTab == "request-friend" ? "border-neutral-800" : "border-transparent"}`}>
                                    Pedido de amizade
                            </button>
                            <button 
                                onClick={() => setActiveTab("sugest-friend")} 
                                className={`p-2 hover:bg-neutral-800 border-b-4 cursor-pointer font-semibold ${activeTab == "sugest-friend" ? "border-neutral-800" : "border-transparent"}`}>
                                    Sugestão
                            </button>
                            <button 
                                onClick={() => setActiveTab("more")} 
                                className={`p-2 hover:bg-neutral-800 border-b-4 cursor-pointer font-semibold ${activeTab == "more" ? "border-neutral-800" : "border-transparent"}`}>
                                    Mais
                            </button>
                        </div>
                        <div className="col-span-3 p-4 mb-4">

                            {activeTab == "list" && (
                                <>
                                    <div className="flex flex-row mb-4">

                                        <h2 className="w-[200px] text-sm text-neutral-800 dark:text-white font-semibold">Todos os amigos</h2>
                                        <div className="w-full flex justify-end">

                                            <input className="text-sm text-gray-700 dark:text-white bg-white dark:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 rounded-lg pl-2 py-2" type="text" placeholder="Procurar"></input>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                        {friends && (
                                            <ListFriends friends={friends}/>
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab == "request-friend" && (
                                <>
                                    <div className="flex flex-row mb-4">

                                        <h2 className="w-[200px] text-sm text-neutral-800 dark:text-white font-semibold">Pedido de amizade</h2>
                                        <div className="w-full flex justify-end">

                                            <input className="text-sm text-gray-700 dark:text-white bg-white dark:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 rounded-lg pl-2 py-2" type="text" placeholder="Procurar"></input>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                        {requestsFriend && (
                                            <RequestFriend 
                                                friends={requestsFriend}
                                                acceptRequest={acceptRequest}
                                            />
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab == "best-friends" && (
                                <>
                                    <div className="flex flex-row mb-4">

                                        <h2 className="w-[200px] text-sm text-neutral-800 dark:text-white font-semibold">Melhores amigos</h2>
                                        <div className="w-full flex justify-end">

                                            <input className="text-sm text-gray-700 dark:text-white bg-white dark:bg-neutral-700 border border-neutral-200/50 dark:border-neutral-700/50 rounded-lg pl-2 py-2" type="text" placeholder="Procurar"></input>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                        {friends && (
                                            <ListFriends friends={friends}/>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                </Container>
            </div>
            {toaster.show && (
                <Toaster
                    toaster={toaster}
                    setToaster={setToaster}
                />
            )}

        </>
    )
}
