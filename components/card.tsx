import { ReactNode } from "react";
interface CardProps {
  className?: string;
  children?: ReactNode;
  gradient?: boolean
}

export default function Card({ className, gradient, children }: CardProps)
{
    return (
        <div 
            className={`
            dark:bg-neutral-800 
            dark:text-white
            dark:shadow-neutral-md
            bg-white 
            text-gray 
            p-2 
            shadow-md
            ${className || ""}
            ${gradient ? "bg-gradient-to-br from-gray-100 to-neutral-200 dark:bg-gradient-to-br dark:from-gray-800 dark:to-neutral-900 " : ""}`
            }
            >
            {children}
        </div>
    )
}