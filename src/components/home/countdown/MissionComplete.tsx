
import { motion } from "framer-motion";

interface MissionCompleteProps {
  showFinalMessage: boolean;
}

export default function MissionComplete({ showFinalMessage }: MissionCompleteProps) {
  if (!showFinalMessage) {
    return null;
  }
  
  return (
    <motion.div 
      className="absolute inset-0 z-20 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.img
        src="/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png"
        alt="M1SSION Logo"
        className="w-40 h-auto mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          filter: ["drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))", "drop-shadow(0 0 20px rgba(124, 58, 237, 0.8))", "drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))"]
        }}
        transition={{ 
          delay: 0.3, 
          duration: 0.5,
          filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      <motion.div 
        className="text-2xl md:text-4xl font-orbitron tracking-widest"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          background: "linear-gradient(90deg, #9b87f5, #7c3aed, #4c1d95)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 15px rgba(124, 58, 237, 0.8)"
        }}
      >
        IT IS POSSIBLE
      </motion.div>
    </motion.div>
  );
}
