
import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderCountdown from '../layout/header/HeaderCountdown';

/**
 * Layout component for public routes
 * Wraps public pages with common layout elements
 */
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="w-full fixed top-0 z-50 glass-backdrop">
        <HeaderCountdown />
      </div>
      <div className="pt-[60px]">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
