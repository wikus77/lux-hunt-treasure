import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface PremiumPlansAccordionProps {
  children: React.ReactNode;
}

export function PremiumPlansAccordion({ children }: PremiumPlansAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      {/* Accordion Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full max-w-md mx-auto block"
      >
        <div className="glass-container p-4 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-center gap-3">
            <span className="text-cyan-400 font-semibold text-sm">
              {isOpen ? 'Nascondi piani Premium' : 'Mostra piani Premium'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>
          <p className="text-white/40 text-xs mt-2 text-center">
            Sblocca più indizi e accesso anticipato. Puoi cambiare piano quando vuoi.
          </p>
        </div>
      </button>

      {/* Accordion Content - Premium Plans */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PremiumPlansAccordion;


