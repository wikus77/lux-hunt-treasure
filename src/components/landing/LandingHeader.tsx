
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import M1ssionText from "@/components/logo/M1ssionText";

const LandingHeader = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <motion.div 
      className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <M1ssionText />
      
      <Button
        onClick={handleLoginClick}
        className="flex items-center rounded-lg font-semibold text-xs shadow-lg transition-all duration-150 px-3 py-1.5 scale-70 transform origin-right"
        style={{
          background: "linear-gradient(90deg, #00E5FF 0%, #007BFF 100%)",
          color: "#000",
          boxShadow: "0 1px 6px 0 rgba(0,229,255,0.4), 0 0.5px 2px #00E5FF",
          transform: "scale(0.7)",
          transformOrigin: "right"
        }}
      >
        <ArrowRight className="mr-1" size={14} />
        Accedi
      </Button>
    </motion.div>
  );
};

export default LandingHeader;
