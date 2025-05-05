
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AgentCodeDisplayProps {
  agentCode: string;
  isMobile?: boolean;
}

const AgentCodeDisplay = ({ agentCode, isMobile = false }: AgentCodeDisplayProps) => {
  const [showCodeText, setShowCodeText] = useState(false);

  useEffect(() => {
    // Typewriter effect for agent dossier
    const timer = setTimeout(() => {
      setShowCodeText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (isMobile) {
    return (
      <motion.div 
        className="flex justify-center items-center pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span className="text-cyan-400 font-mono text-[10px] mr-1">DOSSIER AGENTE:</span>
        <motion.span 
          className="font-mono text-white bg-cyan-900/30 px-1.5 py-0.5 rounded text-[10px]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {agentCode}
        </motion.span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="hidden md:flex items-center mr-2"
    >
      <span className="text-cyan-400 font-mono text-xs mr-1">DOSSIER AGENTE:</span>
      <motion.span 
        className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded text-xs"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {agentCode}
      </motion.span>
    </motion.div>
  );
};

export default AgentCodeDisplay;
