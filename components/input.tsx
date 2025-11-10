interface InputProps {
    type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
}

export default function Input(props: InputProps){
    return (

        <input
            type={props.type}
            name={props.name}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            className={`w-full text-sm text-gray-700 p-3 bg-white outline outline-neutral-200 dark:outline-neutral-800 focus:outline-blue-400 rounded-sm ${props.className}`}
        />
    )
}