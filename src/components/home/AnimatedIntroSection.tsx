
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const textLines = [
  "Nel futuro, la caccia al tesoro non è più un gioco… è una sfida globale.",
  "Ogni mese, una nuova auto di lusso scompare.",
  "Solo i più intuitivi, strategici e veloci sapranno interpretare gli indizi e scoprire dove si nasconde il premio.",
  "Entra in M1SSION. Vivi l'avventura. Trova il premio. Cambia il tuo destino."
];

export default function AnimatedIntroSection({ onEnd }: { onEnd: () => void }) {
  const [visibleLine, setVisibleLine] = useState(0);

  useEffect(() => {
    // Mostra la storia progressivamente
    if (visibleLine < textLines.length) {
      const t = setTimeout(() => setVisibleLine(visibleLine + 1), 920); // Mostra una frase ogni ~1s
      return () => clearTimeout(t);
    }
  }, [visibleLine]);

  useEffect(() => {
    // Timeout automatico (7s come fallback)
    const timer = setTimeout(() => {
      onEnd();
    }, 7000);

    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <motion.section
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#161845] via-[#181641] to-[#111124] text-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      {/* Animazione sfondo digitale */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(28)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#FFC300" : "#7E69AB",
              opacity: 0.7,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1.5px)"
            }}
            animate={{
              y: [0, -14, 0, 14, 0],
              opacity: [0.2, 0.8, 0.4, 0.7, 0.2]
            }}
            transition={{
              duration: Math.random() * 12 + 10,
              repeat: Infinity,
              delay: Math.random() * 4
            }}
          />
        ))}
      </div>

      {/* Logo e claim */}
      <motion.h1
        className="text-4xl sm:text-5xl font-orbitron neon-text mb-6 mt-8 tracking-[0.05em] animate-neon-pulse"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1 }}
      >
        M1SSION
      </motion.h1>
      
      {/* Storytelling testo riga per riga progressiva */}
      <div className="space-y-5 max-w-2xl mx-auto relative z-10 min-h-[200px] flex flex-col justify-center">
        {textLines.slice(0, visibleLine).map((line, idx) => (
          <motion.p
            key={idx}
            className="text-white font-light text-lg sm:text-2xl tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
      
      {/* TESTO AGGIORNATO - STARTS ON AUGUST 19 */}
      <motion.div
        className="text-white mt-8 text-lg sm:text-2xl font-orbitron"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5.25, duration: 0.8 }}
        style={{ fontWeight: 700 }}
      >
        STARTS ON AUGUST 19
      </motion.div>

      {/* Pulsante Skip */}
      <motion.button
        className="mt-14 bg-cyan-600/60 hover:bg-cyan-700/90 neon-button-cyan px-7 py-2 rounded-full text-lg font-bold text-black shadow-xl glass-card z-10 transition-all"
        onClick={onEnd}
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.8 }}
      >
        Inizia la tua M1SSION
      </motion.button>
    </motion.section>
  );
};
