
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ExpandingMenuProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ExpandingMenu = ({ title, children, className }: ExpandingMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between 
                 bg-black/40 backdrop-blur-sm border border-white/10
                 press-effect interaction-feedback"
      >
        <span>{title}</span>
        <ChevronDown 
          className={cn(
            "transform transition-transform duration-300",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </button>
      
      <div
        className={cn(
          "menu-expand overflow-hidden bg-black/20",
          isExpanded ? "max-h-96" : "max-h-0"
        )}
        style={{ transition: "max-height 0.3s ease-in-out" }}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export { ExpandingMenu };
