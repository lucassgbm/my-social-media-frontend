type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | "card" | "field";
};

const roundedMap: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
  card: "rounded-card",
  field: "rounded-field",
};

export default function Skeleton({
  width = "w-full",
  height = "h-auto",
  className = "",
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`${width} ${height} animate-pulse bg-surface-3 ${roundedMap[rounded]} ${className}`}
    />
  );
}
