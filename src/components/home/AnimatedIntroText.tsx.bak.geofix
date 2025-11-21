
import { motion } from "framer-motion";

const LINES = [
  "Un premio attende chi sa vedere oltre.",
  "Gli indizi non sono nascosti: sono camuffati.",
  "Serve logica, freddezza e visione.",
  "La sfida è iniziata. Questa è M1SSION.",
];

// Split text into words for advanced animation
const SplitWords = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ");
  
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {words.map((word, i) => {
        // Add highlights for specific keywords
        const isKeyword = 
          word.includes("M1SSION") || 
          word.includes("premio") ||
          word === "sfida" ||
          word === "visione" ||
          word === "logica";

        const className = isKeyword 
          ? "font-bold inline-block animate-neon-pulse mx-0.5"
          : "inline-block mx-0.5";
        
        const textClass = isKeyword 
          ? word.includes("M1SSION") 
            ? "neon-text-magenta" 
            : word.includes("premio")
              ? "neon-text-cyan"
              : word === "sfida" || word === "visione" || word === "logica"
                ? "text-yellow-400"
                : ""
          : "";
          
        return (
          <motion.span 
            key={i} 
            className={className}
            initial={{ 
              opacity: 0, 
              y: 20,
            }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.4, 
              delay: 0.05 * i + delay,
              ease: [0.19, 1, 0.22, 1]
            }}
          >
            <span className={textClass}>{word}</span>{" "}
          </motion.span>
        );
      })}
    </motion.p>
  );
};

export default function AnimatedIntroText() {
  return (
    <div 
      className="glass-card px-8 py-8 rounded-2xl max-w-2xl text-lg md:text-xl text-center shadow-2xl flex flex-col gap-4 transform-gpu"
      style={{
        background: "rgba(8,8,24,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,229,255,0.4)",
        boxShadow: "0 20px 60px 0 rgba(0,229,255,0.12), inset 0 0 20px 0 rgba(0,229,255,0.05)"
      }}
    >
      {LINES.map((line, idx) => (
        <motion.div
          key={idx}
          className="mb-0.5 leading-relaxed"
        >
          <SplitWords text={line} delay={0.3 + idx * 0.2} />
        </motion.div>
      ))}

      {/* Decorative accent lines */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ transformOrigin: "left" }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ transformOrigin: "right" }}
      />
    </div>
  );
}
