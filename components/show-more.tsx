interface ButtonProps {
    className?: string;
    onClick?: () => void;
}

export default function ShowMore({ onClick, className }: ButtonProps) {
    return (
        <button className={`w-full mt-4 mb-2 rounded-md text-sm font-semibold cursor-pointer ${className?? '' }`} onClick={onClick}>
            Ver mais 
        </button>
    )
}