export default function CalendarIcon(props: { className?: string }) {
    return (
            // as aspas dentro do template viravam classes inválidas ("w-5 e gray-400"),
        // e o h-5 restante vazava por cima do tamanho pedido pelo chamador
        <svg className={props.className || "size-5 text-content-muted"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>

    )
}