import Link from "next/link";
import type { NavItem } from "./nav-items";

export default function Submenu({
    items,
    onNavigate,
}: {
    items: NavItem[];
    className?: string;
    /** Chamado ao clicar em um item — útil para fechar o menu que o contém. */
    onNavigate?: () => void;
}) {
    return (
        <>
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <li key={`${item.href}-${item.label}`}>
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            className="flex w-full items-center gap-3 rounded-field p-2 mb-1
                                text-content hover:bg-surface-2 transition-colors cursor-pointer
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring"
                        >
                            <span className="flex items-center justify-center rounded-full bg-surface-3 p-2">
                                <Icon className="size-4" />
                            </span>
                            <span className="text-sm font-semibold">{item.label}</span>
                        </Link>
                    </li>
                );
            })}
        </>
    );
}
