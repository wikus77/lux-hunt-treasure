
import { motion } from "framer-motion";

interface CountdownTitleProps {
  text: string;
}

export default function CountdownTitle({ text }: CountdownTitleProps) {
  return (
    <motion.h2
      className="font-orbitron text-center mb-6 text-xl md:text-3xl tracking-widest relative"
      style={{
        background: "linear-gradient(90deg, #4c1d95, #7c3aed, #00a3ff)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 0 15px rgba(0, 229, 255, 0.7)",
        transform: "perspective(1000px) rotateX(5deg)"
      }}
      animate={{
        textShadow: [
          "0 0 5px rgba(0, 229, 255, 0.3)",
          "0 0 15px rgba(0, 229, 255, 0.8)",
          "0 0 5px rgba(0, 229, 255, 0.3)"
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Effetto fluttuante 3D con migliore performance */}
      <motion.span
        className="relative inline-block"
        animate={{ 
          y: [0, -2, 0, 2, 0],
          rotateX: [0, 1.5, 0, -1.5, 0],
          rotateY: [0, -0.5, 0, 0.5, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
      >
        {text}
      </motion.span>
      
      {/* Bagliore ambientale ottimizzato */}
      <motion.div
        className="absolute inset-0 -z-10 blur-xl opacity-30 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.8) 0%, rgba(124, 58, 237, 0.5) 50%, transparent 70%)"
        }}
        animate={{
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.h2>
  );
}
