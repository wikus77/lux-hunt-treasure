
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicIsland() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if the click is outside the dynamic island
      if (!target.closest('[data-dynamic-island="true"]') && 
          !target.closest('[data-dynamic-island-trigger="true"]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);
  
  const toggleIsland = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Backdrop for closing when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-40" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Container with flex centering */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
        {/* Pill button */}
        <motion.div
          data-dynamic-island-trigger="true"
          className="bg-black text-white rounded-full px-6 py-2 shadow-lg cursor-pointer"
          initial={{ scale: 1, opacity: 0.7 }}
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

        {/* Expanded dialog */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              data-dynamic-island="true"
              role="dialog"
              aria-label="Dynamic Island agente"
              className="absolute top-14 w-[90vw] max-w-[500px] bg-zinc-900 text-white rounded-2xl shadow-xl p-6"
              initial={{ opacity: 0, scale: 0.6, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -10 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: "center center" }}
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
    </>
  );
}
