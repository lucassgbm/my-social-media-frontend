import Link from "next/link";
import Button from "./button";

export default function Submenu(props: { items: any[]; className?: string; }) {
    return (
        <>
            {props.items.map((item, index) => (
                <Link href={item.link} key={index}>
                    <li className="flex w-full items-center gap-2 p-1 mb-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-green-400 cursor-pointer transition">
                        
                        <Button>
                            {item.icon}
                        </Button>
                        <label className="flex text-sm font-semibold">{item.label}</label>

                    </li>
                </Link>
            ))}
        </>
    )
}