
import React from 'react';
import { motion } from 'framer-motion';

interface MobileStoreButtonsProps {
  className?: string;
}

const MobileStoreButtons: React.FC<MobileStoreButtonsProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <motion.a 
        href="https://play.google.com/store/apps/details?id=com.m1ssion.app" 
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
          alt="Get it on Google Play" 
          className="w-full max-w-[180px] h-auto" 
        />
      </motion.a>
      
      <motion.a 
        href="https://apps.apple.com/app/idXXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
          alt="Download on the App Store" 
          className="w-full max-w-[180px] h-auto" 
        />
      </motion.a>
    </div>
  );
};

export default MobileStoreButtons;
