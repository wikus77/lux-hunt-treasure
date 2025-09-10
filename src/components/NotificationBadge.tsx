// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 text-[8px]',
    md: 'h-5 w-5 text-[9px]',
    lg: 'h-6 w-6 text-[10px]'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div 
          className={`absolute -top-1 -right-1 flex items-center justify-center ${sizeClasses[size]} bg-[#FF59F8] rounded-full shadow-[0_0_8px_rgba(240,89,255,0.5)] notification-badge-pulse ${className}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: 1
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <span className="font-bold text-white">
            {displayCount}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBadge;