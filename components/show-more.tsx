interface ShowMoreProps {
    className?: string;
    onClick?: () => void;
    label?: string;
}

export default function ShowMore({ onClick, className = "", label = "Ver mais" }: ShowMoreProps) {
    return (
        <button
            type="button"
            className={`w-full mt-4 mb-2 py-1 rounded-field text-sm font-semibold text-brand
                hover:bg-surface-2 transition-colors cursor-pointer
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ring
                ${className}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
