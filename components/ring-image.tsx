export default function RingImage(props: {
    className?: string;
    children?: React.ReactNode;
    padding?: string;
}) {
    return (
        <div
            className={`p-[2px] rounded-full bg-gradient-to-r from-green-300 via-brand to-green-600 ${props.className ?? ""}`}
        >
            <div className={`rounded-full bg-surface ${props.padding || "p-[2px]"}`}>
                {props.children}
            </div>
        </div>
    );
}
