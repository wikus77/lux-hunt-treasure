
import React from 'react';
import { Apple, Smartphone } from 'lucide-react';

interface AppStoreButtonProps {
  href: string;
  icon: React.ReactNode;
  store: string;
  subtext: string;
  isActive: boolean;
}

const AppStoreButton = ({ href, icon, store, subtext, isActive }: AppStoreButtonProps) => {
  return (
    <a
      href={isActive ? href : undefined}
      target={isActive ? "_blank" : undefined}
      rel={isActive ? "noopener noreferrer" : undefined}
      className={`flex items-center px-6 py-3 rounded-md bg-black border-2 ${
        isActive 
          ? 'border-[#1EAEDB] hover:border-white/80 shadow-[0_0_10px_rgba(30,174,219,0.7)] transition-all duration-300' 
          : 'border-white/20 opacity-70'
      }`}
      style={{ cursor: isActive ? 'pointer' : 'default' }}
      onClick={!isActive ? (e) => e.preventDefault() : undefined}
    >
      <div className="mr-3 text-white">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/70">{subtext}</span>
        <span className="text-white font-medium">{store}</span>
      </div>
    </a>
  );
};

const AppStoreButtons = () => {
  // Get current date and launch date
  const today = new Date();
  const launchDate = new Date("2025-07-19T00:00:00");
  
  // Check if the current date is past or equal to the launch date
  const isActive = today >= launchDate;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <AppStoreButton
        href="https://apps.apple.com/app/idXXXXXXXXX"
        icon={<Apple size={24} />}
        store="App Store"
        subtext="Download on the"
        isActive={isActive}
      />
      <AppStoreButton
        href="https://play.google.com/store/apps/details?id=com.m1ssion.app"
        icon={<Smartphone size={24} />}
        store="Google Play"
        subtext="GET IT ON"
        isActive={isActive}
      />
    </div>
  );
};

export default AppStoreButtons;
