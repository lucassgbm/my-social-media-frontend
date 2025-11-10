interface ButtonProps{
    label: string
    onClick?: (e: React.FormEvent) => void
    className?: string
    type: "submit" | "button"
}

export default function FormButtom({ className, onClick, label, type }: ButtonProps) {
    return (
        <button type={type} className={`${className}` + " px-6 py-2 rounded-sm bg-blue-500 hover:opacity-90 text-white font-semibold transition cursor-pointer"} onClick={onClick}>
            <div>{label}</div>
        </button>
    )
}