
import React from 'react';
import { motion } from 'framer-motion';

interface MobileStoreButtonsProps {
  className?: string;
}

const MobileStoreButtons: React.FC<MobileStoreButtonsProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <motion.a 
        href="#" 
        className="w-full sm:w-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src="/googleplay-button.png" 
          alt="Get it on Google Play" 
          className="w-full max-w-[180px] h-auto" 
        />
      </motion.a>
      
      <motion.a 
        href="#" 
        className="w-full sm:w-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src="/appstore-button.png" 
          alt="Download on the App Store" 
          className="w-full max-w-[180px] h-auto" 
        />
      </motion.a>
    </div>
  );
};

export default MobileStoreButtons;
