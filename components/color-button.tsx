
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string,
  bgColor?: string
};

export default function ColorButton({ className, onClick, children, bgColor }: ButtonProps) {

  return (
    <button className={` p-2 rounded-full text-white ${bgColor ?? 'bg-green-500'} hover:opacity-80 transition cursor-pointer ${className}`} onClick={onClick}>
      
        <div>{children}</div>
    </button>

  );
}
