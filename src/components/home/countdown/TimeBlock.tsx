
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TimeBlockProps {
  value: number;
  label: string;
  pulsing?: boolean;
  highlight?: boolean;
}

// Component for each time block (days, hours, minutes, seconds)
export default function TimeBlock({ value, label, pulsing = false, highlight = false }: TimeBlockProps) {
  const formattedValue = value.toString().padStart(2, "0");
  
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "font-orbitron text-xs tracking-widest mb-1 text-center",
        highlight ? "text-purple-300" : "text-purple-300/80"
      )}>
        {label}
      </div>
      
      <motion.div
        className={cn(
          "relative w-full aspect-square flex items-center justify-center overflow-hidden",
          "rounded-lg border backdrop-blur-md",
          highlight ? "border-purple-500/50" : "border-purple-500/30"
        )}
        style={{
          background: "linear-gradient(145deg, rgba(0,0,0,0.9) 0%, rgba(76, 29, 149, 0.15) 100%)",
          boxShadow: pulsing && highlight
            ? "0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 5px rgba(139, 92, 246, 0.3)"
            : "0 0 10px rgba(139, 92, 246, 0.3), inset 0 0 5px rgba(139, 92, 246, 0.1)"
        }}
        animate={highlight ? {
          boxShadow: pulsing
            ? ["0 0 10px rgba(139, 92, 246, 0.3)", "0 0 25px rgba(139, 92, 246, 0.6)", "0 0 10px rgba(139, 92, 246, 0.3)"]
            : ["0 0 10px rgba(139, 92, 246, 0.3)", "0 0 15px rgba(139, 92, 246, 0.4)", "0 0 10px rgba(139, 92, 246, 0.3)"]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Light edge reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
        
        {/* Number display with animation */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={formattedValue}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              background: highlight 
                ? "linear-gradient(to bottom, #c4b5fd, #8b5cf6, #7c3aed)"
                : "linear-gradient(to bottom, #c4b5fd, #8b5cf6, #4c1d95)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: highlight 
                ? "0 0 10px rgba(139, 92, 246, 0.8)"
                : "0 0 8px rgba(139, 92, 246, 0.6)"
            }}
          >
            {formattedValue}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
