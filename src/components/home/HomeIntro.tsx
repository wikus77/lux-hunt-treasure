
import { motion } from "framer-motion";

const textLines = [
  "Un premio attende chi sa vedere oltre.",
  "Gli indizi non sono nascosti: sono camuffati.",
  "Serve logica, freddezza e visione.",
  "La sfida è iniziata. Questa è M1SSION."
];

export default function HomeIntro({ onEnd }: { onEnd: () => void }) {
  return (
    <motion.section
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-gradient-to-br from-[#141535] via-[#181641] to-[#111124] text-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      {/* Background digital particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? "#00E5FF" : "#9b87f5",
              opacity: 0.7,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
              opacity: [0.2, 0.8, 0.5, 0.6, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 4
            }}
          />
        ))}
      </div>

      {/* Storytelling animated text */}
      <div className="relative z-10 mt-12 px-5 sm:px-0">
        <h1 className="text-4xl sm:text-5xl font-orbitron font-light neon-text-cyan mb-10 tracking-[0.04em] animate-fade-in">
          M1SSION
        </h1>
        <div className="space-y-5 max-w-2xl mx-auto">
          {textLines.map((line, idx) => (
            <motion.p
              key={idx}
              className="text-white font-light text-lg sm:text-2xl tracking-wide"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + idx * 1, duration: 1 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Glow/Scan animation under logo */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 h-2 w-48 bg-gradient-to-r from-cyan-400/30 via-cyan-400/70 to-blue-400/30 rounded-full blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.6, 1, 0.4], scaleX: [1, 1.2, 1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* Button to skip intro or auto-proceed */}
      <motion.button
        className="mt-20 bg-cyan-600/60 hover:bg-cyan-700/90 neon-button-cyan px-6 py-2 rounded-full text-lg font-bold text-black shadow-xl glass-card z-10"
        onClick={onEnd}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 4.2, duration: 0.7 }}
      >
        Inizia la tua M1SSION
      </motion.button>
    </motion.section>
  );
};
