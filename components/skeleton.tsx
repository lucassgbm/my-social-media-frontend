type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
};

export default function Skeleton({
  width = "w-full",
  height = "h-auto",
  className = "",
  rounded = "md",
}: SkeletonProps) {
  const roundedClass =
    rounded === "sm"
      ? "rounded-sm"
      : rounded === "md"
      ? "rounded-md"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "xl"
      ? "rounded-xl" 
      : rounded === "2xl"
      ? "rounded-2xl"
      : rounded === "3xl"
      ? "rounded-3xl"
      : "rounded-full";

  return (
    <div
      className={`${width} ${height} animate-pulse bg-neutral-300 dark:bg-neutral-700 ${roundedClass} ${className}`}
    />
  );
}
