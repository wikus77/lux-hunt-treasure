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
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="fixed top-0 left-0 right-0 z-[60] h-[30px] backdrop-blur-xl bg-black/60 border-b border-white/10"
          style={{
            top: '47px',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
            {/* Pallino realtime status */}
            <motion.div
              className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full mr-2"
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
                boxShadow: "0 0 6px rgba(0, 209, 255, 0.6)"
              }}
            />
            
            {/* Agent Code */}
            <div className="scale-75 origin-center">
              <AgentCodeDisplay />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MinimalHeaderStrip;
