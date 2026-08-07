import Link from "next/link";
import WhatsappIcon from "../icons/whatsapp";
import Card from "../card";
import FormButtom from "../form-buttom";
import LoadingSpinner from "../loading-spinner";

export default function ProfileInfo() {
    return (
        <div className="w-full">
            <Card className="rounded-2xl text-center mb-4">
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Nome</span>
                    <span className="w-1/2 text-sm font-normal">Lucas Belfort</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Idade</span>
                    <span className="w-1/2 text-sm font-normal">33 anos</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Profissão</span>
                    <span className="w-1/2 text-sm font-normal">Analista de sistemas</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Autodescrição</span>
                    <span className="w-1/2 text-sm font-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iusto doloremque ea quam non, dolor sint nesciunt doloribus aspernatur explicabo maxime, quos modi repudiandae perferendis fuga? Soluta hic quasi voluptate autem?</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">UF</span>
                    <span className="w-1/2 text-sm font-normal">DF</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Cidade</span>
                    <span className="w-1/2 text-sm font-normal">Brasília</span>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <span className="w-1/2 text-sm font-semibold">Telefone</span>
                    <span className="w-1/2 text-sm font-normal flex flex-row gap-2">
                        61 99999-9999
                        <WhatsappIcon className="dark:text-green-400"/>
                    </span>

                </div>
                <div className="flex flex-row text-left mb-2 justify-end">
                    <Link href="profile/edit">
                    
                        <FormButtom label="Editar" type="button" onClick={() => { }} />

                    </Link>
                </div>

            </Card>
        </div>
    )
}