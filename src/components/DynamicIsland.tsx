import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicIsland() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsland = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
      {/* Pulsante iniziale (pillola) */}
      <motion.div
        className="bg-black text-white rounded-full px-6 py-2 shadow-lg cursor-pointer"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={toggleIsland}
        onTouchStart={(e) => {
          const timer = setTimeout(() => setIsOpen(true), 350);
          const cancel = () => clearTimeout(timer);
          e.target.addEventListener("touchend", cancel, { once: true });
          e.target.addEventListener("touchmove", cancel, { once: true });
        }}
      >
        M1-AGENT-?????
      </motion.div>

      {/* Dynamic Island espansa */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Dynamic Island agente"
            className="absolute top-14 bg-zinc-900 text-white rounded-2xl shadow-xl p-6 w-[90vw] max-w-[500px]"
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -10 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/images/agent-profile.jpg"
                alt="Profilo agente"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">AGENTE #0092X</p>
                <p className="text-xs text-gray-400">
                  Missione attiva: OPERAZIONE PHOENIX
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
                🔍 Accedi ai tuoi indizi
              </button>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
                📝 Modifica profilo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
