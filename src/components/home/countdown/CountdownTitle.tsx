
import { motion } from "framer-motion";

interface CountdownTitleProps {
  text: string;
}

export default function CountdownTitle({ text }: CountdownTitleProps) {
  return (
    <motion.h2
      className="font-orbitron text-center mb-6 text-xl md:text-3xl tracking-widest"
      style={{
        background: "linear-gradient(90deg, #9b87f5, #7c3aed, #4c1d95)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 0 15px rgba(139, 92, 246, 0.7)"
      }}
      animate={{
        textShadow: [
          "0 0 5px rgba(139, 92, 246, 0.3)",
          "0 0 15px rgba(139, 92, 246, 0.8)",
          "0 0 5px rgba(139, 92, 246, 0.3)"
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {text}
    </motion.h2>
  );
}
