
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
      className="absolute inset-0 z-20 backdrop-blur-xl flex flex-col items-center justify-center" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        background: "radial-gradient(circle at center, rgba(29, 5, 84, 0.9) 0%, rgba(0, 0, 0, 0.95) 80%)"
      }}
    >
      {/* 3D floating logo */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
          rotateY: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.img
          src="/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png"
          alt="M1SSION Logo"
          className="w-40 h-auto mb-6 relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1
          }}
          transition={{ 
            delay: 0.3, 
            duration: 0.8,
            ease: "easeOut"
          }}
        />
        
        {/* 3D glowing effect for the logo */}
        <motion.div
          className="absolute -inset-4 rounded-full z-0 blur-xl"
          style={{
            background: "radial-gradient(circle, rgba(0, 229, 255, 0.8) 0%, rgba(124, 58, 237, 0.6) 50%, transparent 80%)"
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* 3D Floating Text */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <motion.div 
          className="text-2xl md:text-4xl font-orbitron tracking-widest"
          animate={{
            y: [0, -5, 0],
            rotateX: [0, 5, 0],
            textShadow: [
              "0 0 5px rgba(0, 229, 255, 0.5), 0 0 10px rgba(0, 229, 255, 0.3)",
              "0 0 20px rgba(0, 229, 255, 0.8), 0 0 30px rgba(0, 229, 255, 0.5)",
              "0 0 5px rgba(0, 229, 255, 0.5), 0 0 10px rgba(0, 229, 255, 0.3)"
            ]
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            textShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            background: "linear-gradient(90deg, #4c1d95, #7c3aed, #00a3ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: "perspective(1000px)"
          }}
        >
          IT IS POSSIBLE
        </motion.div>
        
        {/* Ambient light reflection */}
        <div 
          className="absolute -inset-4 -z-10 opacity-40 blur-xl"
          style={{
            background: "radial-gradient(ellipse, rgba(0, 229, 255, 0.4) 0%, rgba(124, 58, 237, 0.2) 70%, transparent 100%)"
          }}
        />
      </motion.div>

      {/* Ambient floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            backgroundColor: i % 2 === 0 ? 'rgba(0, 229, 255, 0.8)' : 'rgba(124, 58, 237, 0.8)',
            boxShadow: i % 2 === 0 
              ? '0 0 5px rgba(0, 229, 255, 0.8), 0 0 10px rgba(0, 229, 255, 0.5)' 
              : '0 0 5px rgba(124, 58, 237, 0.8), 0 0 10px rgba(124, 58, 237, 0.5)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: Math.random() * 8 + 7,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      ))}
    </motion.div>
  );
}
