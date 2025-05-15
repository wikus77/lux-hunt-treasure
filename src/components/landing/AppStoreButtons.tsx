
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
        href={isActive ? "https://apps.apple.com/app/id0000000000" : undefined}
        target={isActive ? "_blank" : undefined}
        rel={isActive ? "noopener noreferrer" : undefined}
        className={`${!isActive && 'pointer-events-none opacity-80'} transition-transform hover:scale-105`}
        aria-label="Download on App Store"
      >
        <img 
          src="/appstore-button.png" 
          alt="Download on the App Store"
          className="h-14 w-auto block"
          style={{ minHeight: '40px', display: 'block' }}
        />
      </a>
      <a 
        href={isActive ? "https://play.google.com/store/apps/details?id=com.tuonome.app" : undefined}
        target={isActive ? "_blank" : undefined}
        rel={isActive ? "noopener noreferrer" : undefined}
        className={`${!isActive && 'pointer-events-none opacity-80'} transition-transform hover:scale-105`}
        aria-label="Get it on Google Play"
      >
        <img 
          src="/googleplay-button.png" 
          alt="Get it on Google Play" 
          className="h-14 w-auto block"
          style={{ minHeight: '40px', display: 'block' }}
        />
      </a>
    </div>
  );
};

export default AppStoreButtons;
