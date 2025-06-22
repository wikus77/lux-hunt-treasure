
import React from "react";
import { cn } from "@/lib/utils";

interface GradientBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientBox = React.forwardRef<HTMLDivElement, GradientBoxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden relative",
          "border border-white/10 shadow-lg",
          "bg-gradient-to-br from-[#1C1C1F] via-[#1C1C1F] to-[#1C1C1F]/95",
          "before:absolute before:top-0 before:left-0 before:w-full before:h-[1px]",
          "before:bg-gradient-to-r before:from-[#FC1EFF] before:via-[#365EFF] before:to-[#FACC15]",
          className
        )}
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GradientBox.displayName = "GradientBox";

export default GradientBox;
