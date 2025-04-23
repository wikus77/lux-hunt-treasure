
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  colorClass?: string;
}

export const ProgressBar = ({ 
  value, 
  max, 
  label, 
  showPercentage = true, 
  className = "",
  size = "md",
  colorClass = "bg-gradient-to-r from-projectx-blue via-blue-500 to-projectx-blue"
}: ProgressBarProps) => {
  const percentage = useMemo(() => {
    return Math.min(100, Math.round((value / max) * 100));
  }, [value, max]);

  const heightClass = useMemo(() => {
    switch(size) {
      case "sm": return "h-2";
      case "lg": return "h-6";
      default: return "h-4";
    }
  }, [size]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1 text-xs text-white/80">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-mono">{percentage}%</span>
          )}
        </div>
      )}
      <div className="relative w-full">
        <Progress 
          value={percentage} 
          className={`${heightClass} bg-white/10 rounded-full border border-white/5`} 
        />
        <div 
          className={`absolute top-0 left-0 h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
          style={{ 
            width: `${percentage}%`,
            opacity: 0.9,
            filter: "blur(0px)"
          }}
        />
        {size === "lg" && showPercentage && (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
