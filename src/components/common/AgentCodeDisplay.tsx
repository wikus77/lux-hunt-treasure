
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AgentCodeDisplayProps {
  className?: string;
  showLabel?: boolean;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ 
  className = "", 
  showLabel = true 
}) => {
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  // Always display X0197 as the official agent code
  const agentCode = "X0197";
  
  useEffect(() => {
    // Typewriter effect for agent dossier - increased to 2 seconds
    const timer = setTimeout(() => {
      setIsCodeVisible(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-[#00E5FF]/20 px-3 py-1 rounded-md inline-flex items-center ${className}`}>
      {showLabel && (
        <span className="text-cyan-400 font-mono text-sm mr-1">DOSSIER:</span>
      )}
      <motion.span 
        className="font-mono text-white bg-cyan-900/30 px-2 py-0.5 rounded text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isCodeVisible ? 1 : 0 }}
        transition={{ duration: 1.0 }}
      >
        {agentCode}
      </motion.span>
    </div>
  );
};

export default AgentCodeDisplay;
