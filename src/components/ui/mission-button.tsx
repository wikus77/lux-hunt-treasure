
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MissionButtonProps {
  onClick?: () => void;
  className?: string;
}

const MissionButton = ({ onClick, className }: MissionButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Button
        onClick={onClick}
        className={cn("flex items-center rounded-lg font-semibold text-xs shadow-lg transition-all duration-150 px-3 py-1.5 scale-70 transform origin-right", className)}
        style={{
          background: "linear-gradient(90deg, #00E5FF 0%, #007BFF 100%)",
          color: "#000",
          boxShadow: "0 1px 6px 0 rgba(0,229,255,0.4), 0 0.5px 2px #00E5FF",
          transform: "scale(0.7)",
          transformOrigin: "right"
        }}
      >
        <ArrowRight className="mr-1" size={14} />
        M1SSION
      </Button>
    </motion.div>
  );
};

export default MissionButton;
