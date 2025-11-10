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
                    <label className="w-1/2 text-sm font-semibold">Nome</label>
                    <label className="w-1/2 text-sm font-normal">Lucas Belfort</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">Idade</label>
                    <label className="w-1/2 text-sm font-normal">33 anos</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">Profissão</label>
                    <label className="w-1/2 text-sm font-normal">Analista de sistemas</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">Autodescrição</label>
                    <label className="w-1/2 text-sm font-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iusto doloremque ea quam non, dolor sint nesciunt doloribus aspernatur explicabo maxime, quos modi repudiandae perferendis fuga? Soluta hic quasi voluptate autem?</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">UF</label>
                    <label className="w-1/2 text-sm font-normal">DF</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">Cidade</label>
                    <label className="w-1/2 text-sm font-normal">Brasília</label>
                </div>
                <div className="flex flex-row text-left mb-2">
                    <label className="w-1/2 text-sm font-semibold">Telefone</label>
                    <label className="w-1/2 text-sm font-normal flex flex-row gap-2">
                        61 99999-9999
                        <WhatsappIcon className="dark:text-green-400"/>
                    </label>

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