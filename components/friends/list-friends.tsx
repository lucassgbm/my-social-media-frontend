import Image from "next/image";
import MessageIcon from "../icons/message";
import EllipsisVerticalIcon from "../icons/ellipsis";
import Button from "../button";
import RingImage from "../ring-image";

export default function ListFriends() {
    return (
        <>
            <div className="bg-neutral-100 bg-neutral-950/40 h-[auto] text-center rounded-2xl p-4">
                <div className="w-full flex flex-col gap-2 justify-center items-center">
                    <RingImage className="cursor-pointer">
                        <Image
                            src="/imgs/kratos.jpg"
                            alt="Foto de perfil"
                            className="rounded-full w-[100px] hover:opacity-90"
                            width={120}
                            height={120}
                            priority
                        />
                    </RingImage>

                    <label className="w-[full] flex text-sm font-semibold justify-start">Nome fulano</label>
                    <div className="w-[full] flex gap-2">

                        {/* <Button>
                            <MessageIcon 
                                className={"size-4"}
                            />
                        </Button>

                        <Button>
                            <EllipsisVerticalIcon 
                                className={"size-4"}
                            />
                        </Button> */}
                        
                    </div>
                </div>
            </div>
            
        </>
    );
}