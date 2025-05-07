
import React from 'react';
import { Apple, Smartphone } from 'lucide-react';

interface AppStoreButtonProps {
  href: string;
  icon: React.ReactNode;
  store: string;
  isActive: boolean;
}

const AppStoreButton = ({ href, icon, store, isActive }: AppStoreButtonProps) => {
  return (
    <a
      href={isActive ? href : undefined}
      target={isActive ? "_blank" : undefined}
      rel={isActive ? "noopener noreferrer" : undefined}
      className={`flex items-center px-4 py-3 rounded-lg bg-black border ${
        isActive ? 'border-white/30 hover:border-white/50' : 'border-white/20 opacity-70'
      }`}
      style={{ cursor: isActive ? 'pointer' : 'default' }}
    >
      <div className="mr-3 text-white">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/70">Download on the</span>
        <span className="text-white font-semibold">{store}</span>
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
        isActive={isActive}
      />
      <AppStoreButton
        href="https://play.google.com/store/apps/details?id=com.m1ssion.app"
        icon={<Smartphone size={24} />}
        store="Google Play"
        isActive={isActive}
      />
    </div>
  );
};

export default AppStoreButtons;
