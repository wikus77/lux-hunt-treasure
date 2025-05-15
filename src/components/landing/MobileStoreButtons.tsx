
import React from 'react';
import { motion } from 'framer-motion';

const MobileStoreButtons: React.FC = () => {
  const appleSrc = "/appstore-button.png";
  const googleSrc = "/googleplay-button.png";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
      <motion.a
        href="https://apps.apple.com/app/id0000000000"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={appleSrc}
          alt="Download on the App Store"
          className="h-14 w-auto block"
          onError={(e) => {
            e.currentTarget.src = "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
          }}
        />
      </motion.a>

      <motion.a
        href="https://play.google.com/store/apps/details?id=com.tuonome.app"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={googleSrc}
          alt="Get it on Google Play"
          className="h-14 w-auto block"
          onError={(e) => {
            e.currentTarget.src = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
          }}
        />
      </motion.a>
    </div>
  );
};

export default MobileStoreButtons;
