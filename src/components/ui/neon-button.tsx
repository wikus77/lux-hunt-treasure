
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

interface NeonButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const NeonButton = ({ className, children, ...props }: NeonButtonProps) => {
  return (
    <Button
      className={cn(
        "flex items-center rounded-lg font-semibold text-xs shadow-lg transition-all duration-150 px-3 py-1.5",
        "bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]",
        "scale-70 transform origin-right",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
