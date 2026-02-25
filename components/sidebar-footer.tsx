import Image from "next/image";
import Link from "next/link";

export default function SidebarFooter() {
    return (
        <div className="w-full h-[100px] flex flex-col sticky right-0 top-0 mt-6 p-4 text-xs justify-center items-center">
            <ul className="flex flex-row gap-2 mt-6 mb-4 flex-wrap justify-center">
                <li><a href="#">Sobre nós</a></li> |
                <li><a href="#">Política de Privacidade</a></li> |
                <li><a href="#">Termos e condições</a></li> |
                <li><a href="#">Fale conosco</a></li>
            </ul>
            <Link href="/social-media">
            
            <Image 
                src="/imgs/logo_social_media.png" 
                alt="Logo" 
                width={100} 
                height={100} 
                className="w-[50px] h-auto hidden dark:block"
            />

            <Image 
                src="/imgs/logo_social_media_blank.png" 
                alt="Logo" 
                width={100} 
                height={100} 
                className="w-[50px] h-auto block dark:hidden"
            />
            </Link>
            <p className="text-neutral-200 dark:text-white mt-2">Todos os direitos reservados</p>
            
        </div>
    )
}