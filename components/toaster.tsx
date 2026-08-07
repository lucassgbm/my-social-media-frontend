import Button from "./button";
import CheckIcon from "./icons/check";
import CloseIcon from "./icons/close";

interface ToasterProps {
  title?: string;
  message: string;
  status?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Toaster(props: { toaster: ToasterProps; setToaster: any }) {
  const isSuccess = props.toaster.status === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-row fixed bottom-4 right-4 border border-line
        bg-surface rounded-card text-content w-auto min-w-[280px] text-sm p-3
        shadow-2xl items-center z-50 gap-3"
    >
      {props.toaster.status !== "" && (
        <div
          className={`shrink-0 rounded-full p-1 text-white ${isSuccess ? "bg-success" : "bg-danger"}`}
        >
          {isSuccess ? (
            <CheckIcon className="size-3" />
          ) : (
            <CloseIcon className="size-3" />
          )}
        </div>
      )}

      <div className="flex flex-col flex-1">
        {props.toaster.title !== "" && (
          <p className="text-sm font-semibold">{props.toaster.title}</p>
        )}

        {/* text-content-muted garante contraste >= 4.5:1 nos dois temas */}
        <p className="text-sm text-content-muted">{props.toaster.message}</p>
      </div>

      <Button
        variant="ghost"
        onClick={() => props.setToaster({ ...props.toaster, show: false })}
        aria-label="Fechar notificação"
      >
        <CloseIcon className="size-3" />
      </Button>
    </div>
  );
}
