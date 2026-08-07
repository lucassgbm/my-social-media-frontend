import Image from "../remote-image";
import Button from "../button";
import TrophyIcon from "../icons/trophy";
import MoneyIcon from "../icons/money";
import PinIcon from "../icons/pin";

interface PropsEvent {
    image: string;
    title: string;
    date: string;
    time: string;
    location: string;

}

export default function CardEvent({event}: {event: PropsEvent}) {
    return (
        <div className="relative w-full flex flex-row gap-2 overflow-hidden group justify-between items-center border border-line rounded-card">

            <div className="flex flex-col items-center">

                <Image
                    src={event.image ?? '/imgs/placeholder.png'}
                    alt=""
                    className="w-full aspect-[10/5] rounded-card object-cover group-hover:scale-110 transition-all duration-300 ease-in-out"
                    width={320}
                    height={160}
                    sizes="320px"
                />
                <div className="absolute w-full h-auto bottom-0 left-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent rounded-b-card p-4 text-white">
                    <span className="text-sm font-semibold">{event.title}</span>
                    <p className="w-full flex text-xs font-normal text-wrap">{`${event.date} as ${event.time} `}</p>
                    {/* text-gray-300 sobre o gradiente escuro mantém contraste suficiente */}
                    <p className="flex flex-row gap-1 items-center text-xs font-normal text-gray-300">
                        <PinIcon className="size-3"/>
                        {event.location}
                    </p>

                </div>
                <div className="absolute right-2 top-2 flex flex-col gap-1">

                    <Button onClick={() => {}} aria-label={`Ver detalhes de ${event.title}`}>
                        <TrophyIcon className="size-4"/>
                    </Button>
                    <Button onClick={() => {}} aria-label={`Ingressos de ${event.title}`}>
                        <MoneyIcon className="size-4"/>
                    </Button>
                </div>

                
            </div>
        </div>
    )
}