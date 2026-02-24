
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string,
};

export default function BorderButton({ className, onClick, children }: ButtonProps) {

  return (
    <button className={` px-3 py-2 rounded-full text-green-500 border-2 border-green-500 text-xs hover:opacity-80 transition cursor-pointer ${className}`} onClick={onClick}>
      
        <div>{children}</div>
    </button>

  );
}
