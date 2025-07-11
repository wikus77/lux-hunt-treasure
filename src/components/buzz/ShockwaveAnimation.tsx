// by Joseph Mulé – M1SSION™ – Shockwave Animation Component
import React from 'react';
import { motion } from 'framer-motion';

interface ShockwaveAnimationProps {
  show: boolean;
}

export const ShockwaveAnimation: React.FC<ShockwaveAnimationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      key={Date.now()}
      className="absolute w-48 h-48 rounded-full border-4 border-[#F213A4]"
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 3.5, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ 
        zIndex: 10,
        borderWidth: '3px',
        filter: 'blur(0.5px)',
        borderColor: '#F213A4'
      }}
    />
  );
};