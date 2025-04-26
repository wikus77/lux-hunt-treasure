
import { motion } from "framer-motion";

const LINES = [
  "Nel futuro, la caccia al tesoro non è più un gioco… è una sfida globale.",
  "Ogni mese, una nuova auto di lusso scompare.",
  "Solo i più intuitivi, strategici e veloci sapranno interpretare gli indizi e scoprire dove si nasconde il ",
  "Entra in M1SSION. Vivi l'avventura. Trova il premio. Cambia il tuo destino.",
];

const keywordEffect = (text: string) => {
  // Evidenzia "M1SSION" e "premio"
  return text
    .replace(/M1SSION/g, `<span class="font-bold neon-text-magenta animate-neon-pulse">M1SSION</span>`)
    .replace(/premio/g, `<span class="font-bold neon-text-cyan animate-neon-pulse">premio</span>`);
};

export default function AnimatedIntroText() {
  return (
    <div 
      className="glass-card px-8 py-7 rounded-2xl max-w-2xl text-lg md:text-xl text-center shadow-lg flex flex-col gap-2"
      style={{
        background: "rgba(19,33,52,0.7)",
        border: "1.5px solid #00e5ff88",
        boxShadow: "0 8px 38px 0 rgba(30,174,219,0.18), 0 0px 64px 0 #00e5ff25"
      }}
    >
      {LINES.map((line, idx) => (
        <motion.div
          key={idx}
          className="mb-0.5 leading-snug"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3 + idx * 0.24,
            ease: "easeOut"
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: keywordEffect(line),
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
