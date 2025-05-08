
import React from 'react';

const AppStoreButtons = () => {
  // Get current date and launch date
  const today = new Date();
  const launchDate = new Date("2025-07-19T00:00:00");
  
  // Check if the current date is past or equal to the launch date
  const isActive = today >= launchDate;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href={isActive ? "https://apps.apple.com/app/idXXXXXXXXX" : undefined}
        target={isActive ? "_blank" : undefined}
        rel={isActive ? "noopener noreferrer" : undefined}
        className={`${!isActive && 'pointer-events-none opacity-80'}`}
        aria-label="Download on App Store"
      >
        <img 
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
          alt="Download on the App Store"
          className={`h-14 ${isActive ? 'hover:opacity-90 transition-opacity' : ''}`}
        />
      </a>
      <a 
        href={isActive ? "https://play.google.com/store/apps/details?id=com.m1ssion.app" : undefined}
        target={isActive ? "_blank" : undefined}
        rel={isActive ? "noopener noreferrer" : undefined}
        className={`${!isActive && 'pointer-events-none opacity-80'}`}
        aria-label="Get it on Google Play"
      >
        <img 
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
          alt="Get it on Google Play" 
          className={`h-14 ${isActive ? 'hover:opacity-90 transition-opacity' : ''}`}
        />
      </a>
    </div>
  );
};

export default AppStoreButtons;
