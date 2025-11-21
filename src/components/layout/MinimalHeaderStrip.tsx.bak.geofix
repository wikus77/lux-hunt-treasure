// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MinimalHeaderStripProps {
  show: boolean;
  children: React.ReactNode;
}

const MinimalHeaderStrip: React.FC<MinimalHeaderStripProps> = ({ show, children }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="fixed left-1/2 z-[60]"
          style={{
            top: 'calc(47px + 20px)',
            transform: 'translateX(-50%)',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MinimalHeaderStrip;
