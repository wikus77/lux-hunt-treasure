
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  )
}

function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses} rounded-full border-2 border-t-transparent border-white/30 animate-spin`}></div>
    </div>
  );
}

export { Skeleton, LoadingSpinner }
