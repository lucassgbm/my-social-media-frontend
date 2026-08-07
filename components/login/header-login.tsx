import Image from "../remote-image";
import Link from "next/link";

export default function HeaderLogin() {
    return (
        <div className="mb-6">
            <Link href="/" className="inline-flex">
                <Image
                    src="/imgs/logo_social_media.png"
                    alt="Social Media"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                    priority
                />
            </Link>
            <p className="text-xs mt-3 text-neutral-300">
                Participe de comunidades, divulgue o seu evento, faça amigos.
            </p>
        </div>
    );
}
