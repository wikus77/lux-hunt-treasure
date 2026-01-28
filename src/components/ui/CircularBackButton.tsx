/**
 * CircularBackButton - Pulsante circolare per tornare indietro
 * Design: cerchio con bordo bianco e freccia all'interno
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface CircularBackButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { button: 'w-9 h-9', icon: 'w-4 h-4' },
  md: { button: 'w-11 h-11', icon: 'w-5 h-5' },
  lg: { button: 'w-14 h-14', icon: 'w-6 h-6' },
};

export const CircularBackButton: React.FC<CircularBackButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizes = sizeMap[size];

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${sizes.button}
        flex items-center justify-center
        rounded-full
        border-2 border-white/80
        bg-transparent
        hover:bg-white/10
        active:scale-95
        transition-all duration-200
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Torna indietro"
    >
      <ChevronLeft className={`${sizes.icon} text-white`} />
    </motion.button>
  );
};

export default CircularBackButton;
