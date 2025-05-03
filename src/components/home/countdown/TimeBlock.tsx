
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TimeBlockProps {
  value: number;
  label: string;
  pulsing?: boolean;
  highlight?: boolean;
}

// Componente per ogni blocco di tempo (giorni, ore, minuti, secondi)
export default function TimeBlock({ value, label, pulsing = false, highlight = false }: TimeBlockProps) {
  const formattedValue = value.toString().padStart(2, "0");
  
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "font-orbitron text-xs tracking-widest mb-1 text-center",
        highlight ? "text-cyan-300" : "text-blue-300/90"
      )}>
        {label}
      </div>
      
      <motion.div
        className={cn(
          "relative w-full aspect-square flex items-center justify-center overflow-hidden",
          "rounded-lg backdrop-blur-md shadow-inner"
        )}
        style={{
          background: "linear-gradient(135deg, rgba(29,5,84,0.6) 0%, rgba(0,43,77,0.4) 100%)",
          border: `1px solid ${highlight ? 'rgba(0, 229, 255, 0.6)' : 'rgba(124, 58, 237, 0.4)'}`,
          boxShadow: pulsing 
            ? "0 0 25px rgba(0, 229, 255, 0.6), inset 0 0 10px rgba(124, 58, 237, 0.5)" 
            : "0 0 15px rgba(124, 58, 237, 0.4), inset 0 0 5px rgba(124, 58, 237, 0.3)",
          transform: "perspective(500px) rotateX(10deg)"
        }}
        animate={{
          boxShadow: pulsing
            ? ["0 0 15px rgba(0, 229, 255, 0.4)", "0 0 30px rgba(0, 229, 255, 0.7)", "0 0 15px rgba(0, 229, 255, 0.4)"]
            : ["0 0 15px rgba(124, 58, 237, 0.3)", "0 0 20px rgba(124, 58, 237, 0.5)", "0 0 15px rgba(124, 58, 237, 0.3)"],
          translateY: ["0px", "-5px", "0px"]
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          translateY: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Effetto di riflessione lucido 3D */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)"
          }}
        />
        
        {/* Riflesso del bordo luminoso */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"></div>
        
        {/* Bagliore della luce ambientale */}
        <div className="absolute inset-0 rounded-lg" style={{
          boxShadow: "inset 0 0 20px rgba(0, 229, 255, 0.2)",
          opacity: highlight ? 0.6 : 0.3
        }}></div>
        
        {/* Display numerico con animazione */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={formattedValue}
            initial={{ y: 20, opacity: 0, rotateX: -30 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -20, opacity: 0, rotateX: 30 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20
            }}
            className="relative font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              textShadow: highlight 
                ? "0 0 10px rgba(0, 229, 255, 0.8), 0 0 20px rgba(0, 229, 255, 0.4), 0 5px 15px rgba(124, 58, 237, 0.6)"
                : "0 0 8px rgba(124, 58, 237, 0.7), 0 0 16px rgba(124, 58, 237, 0.4), 0 5px 10px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Effetto numeri 3D con gradiente */}
            <span className="bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              {formattedValue}
            </span>
            
            {/* Ombra del testo per effetto 3D */}
            <span className="absolute inset-0 blur-[1px] text-cyan-600/20 translate-z-[-2px] translate-y-[2px]" aria-hidden="true">
              {formattedValue}
            </span>
          </motion.div>
        </AnimatePresence>
        
        {/* Particelle fluttuanti per effetto ambiente */}
        {highlight && (
          <>
            <motion.div 
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              animate={{
                top: ['10%', '70%', '30%'],
                left: ['20%', '80%', '50%'],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-1 h-1 rounded-full bg-purple-400"
              animate={{
                bottom: ['20%', '60%', '40%'],
                right: ['30%', '10%', '70%'],
                opacity: [0.7, 0.5, 0.7]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
