import Button from "./button";
import CheckIcon from "./icons/check";
import CloseIcon from "./icons/close";
import InfoIcon from "./icons/info";
import QuestionIcon from "./icons/question";

interface ToasterProps {
  title?: string;
  message: string;
  status?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Toaster(props: { toaster: ToasterProps, setToaster: any }) {
    return (
        <div className="flex flex-row fixed bottom-4 right-4 border-1 border-neutral-300/30 dark:border-neutral-700/50 bg-gradient-to-r from-white to-neutral-100 dark:bg-gradient-to-r dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900 rounded-md dark:text-white w-[auto] min-w-[280px] h-[auto] text-sm p-2 shadow-2xl items-center z-50 gap-3">

          {props.toaster.status !== "" && (

            <div className={`border-3 border-neutral-200 dark:border-neutral-600 rounded-full p-1 ${props.toaster.status == "success" ? "bg-green-500" : "bg-red-500" } text-white`}>
              
              {props.toaster.status === "success" && <CheckIcon className="size-2"/>}
              {props.toaster.status !== "success" && <CloseIcon className="size-2"/>}
              
            </div>
          )}

          <div className="flex flex-col w-[80%]">

            {props.toaster.title != "" && (              
              <p className="text-md font-semibold">
                {props.toaster.title}
              </p>
            )}

            <p className="text-sm text-neutral-500 dark:text-neutral-200/60">
              {props.toaster.message}
            </p>
          </div>
          <div className="flex w-[20%] justify-end">
            <Button onClick={() => props.setToaster({...props.toaster, show: false})}>
                <CloseIcon className="size-3 dark:text-white text-neutral-800"/>
            </Button>
          </div>
        </div>
    )
}