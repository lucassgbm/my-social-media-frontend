'use client';
import Image from "next/image";
import Container from "../../../../../../components/container";
import Button from "../../../../../../components/button";
import CloseIcon from "../../../../../../components/icons/close";
import CheckIcon from "../../../../../../components/icons/check";
import SearchIcon from "../../../../../../components/icons/search";
import PlusIcon from "../../../../../../components/icons/plus";
import ListCommunities from "../../../../../../components/communities/list-communities";
import Card from "../../../../../../components/card";
import FilterIcon from "../../../../../../components/icons/filter";
import { useState } from "react";
import Modal from "../../../../../../components/modal";
import FormButtom from "../../../../../../components/form-buttom";
import LoadingSpinner from "../../../../../../components/loading-spinner";
import ArrowLeftIcon from "../../../../../../components/icons/arrow-left";
import ArrowRightIcon from "../../../../../../components/icons/arrow-right";
import ColorButton from "../../../../../../components/color-button";

export default function Home(){
    
    const [modalNewCommunity, setModalNewCommunity] = useState(false);
    const [loading, setLoading] = useState(false);
    return(
        <>
        
            <div className="w-5/6 flex flex-col">
                <Container className="h-full " padding="p-0">

                    <div className="flex flex-col gap-2 flex-wrap">
                        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 p-4">
                            <p className="text-sm">
                                <span className="font-semibold text-neutral-400">
                                    <a href="/social-media">Home / </a> 
                                    <a href="/social-media/communities">Comunidades / </a> 
                                </span> Video games Brasília
                            </p>
                            
                        </div>

                        <div className="p-4">
                            <Card gradient className="w-full h-[200px] rounded-2xl"></Card>
                            
                        </div>
                    </div>
                </Container>

            </div>  

        </>
    )
}
