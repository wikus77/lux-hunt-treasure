// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCodeDisplay from './header/AgentCodeDisplay';

interface MinimalHeaderStripProps {
  show: boolean;
}

const MinimalHeaderStrip: React.FC<MinimalHeaderStripProps> = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="fixed left-1/2 z-[60]"
          style={{
            top: 'calc(47px + 12px)',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-white/10"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 209, 255, 0.2)"
            }}
          >
            {/* Pallino realtime status */}
            <motion.div
              className="w-2 h-2 bg-[#00D1FF] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                boxShadow: "0 0 8px rgba(0, 209, 255, 0.6), 0 0 16px rgba(0, 209, 255, 0.4)"
              }}
            />
            
            {/* Agent Code */}
            <div className="scale-90 origin-center">
              <AgentCodeDisplay />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MinimalHeaderStrip;
