
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string
};

export default function Button({ className, onClick, children }: ButtonProps) {

  return (
    <button className={` p-2 rounded-full bg-neutral-200 dark:bg-neutral-700/70 hover:opacity-80 transition cursor-pointer ${className}`} onClick={onClick}>
      
        <div>{children}</div>
    </button>

  );
}
