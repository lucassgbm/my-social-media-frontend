import UsersIcon from "../icons/users";
import QuestionIcon from "../icons/question";
import type { CommunityEvent } from "../../utils/community";

type AttendanceSummaryProps = {
    event: CommunityEvent;
};

/**
 * Quantas pessoas responderam ao evento.
 *
 * Some quando o evento não vem anotado com presença (rotas antigas): mostrar
 * "0 confirmados" ali seria informação falsa, não ausência de informação.
 */
export default function AttendanceSummary({ event }: AttendanceSummaryProps) {
    if (typeof event.going_count !== "number") return null;

    const going = event.going_count;
    const maybe = event.maybe_count ?? 0;

    return (
        <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-sm text-content-muted">
            <span className="flex flex-row items-center gap-1.5">
                <UsersIcon className="size-4 shrink-0" />
                <span className="font-semibold text-content">{going}</span>
                {going === 1 ? "confirmado" : "confirmados"}
            </span>

            {maybe > 0 && (
                <span className="flex flex-row items-center gap-1.5">
                    <QuestionIcon className="size-4 shrink-0" />
                    <span className="font-semibold text-content">{maybe}</span>
                    talvez
                </span>
            )}
        </div>
    );
}
