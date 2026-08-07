import Image from "./remote-image";
import Link from "next/link";

export default function SidebarFooter() {
    return (
        <footer className="w-full flex flex-col mt-6 p-4 text-xs justify-center items-center text-content-muted">
            <ul className="flex flex-row gap-2 mt-6 mb-4 flex-wrap justify-center">
                <li><a href="#" className="hover:text-content">Sobre nós</a></li> |
                <li><a href="#" className="hover:text-content">Política de Privacidade</a></li> |
                <li><a href="#" className="hover:text-content">Termos e condições</a></li> |
                <li><a href="#" className="hover:text-content">Fale conosco</a></li>
            </ul>
            <Link href="/social-media" aria-label="Página inicial">
            
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
            {/* antes text-neutral-200 fixo: quase invisível sobre fundo claro */}
            <p className="mt-2">Todos os direitos reservados</p>

        </footer>
    )
}