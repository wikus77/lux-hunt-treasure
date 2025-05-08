
import React from 'react';
import { Outlet } from 'react-router-dom';

type PublicLayoutProps = {
  children?: React.ReactNode;
};

/**
 * Layout component for public routes
 * Wraps public pages with common layout elements
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }: PublicLayoutProps) => {
  console.log("PublicLayout rendering");
  
  return (
    <div className="min-h-screen bg-black">
      {children || <Outlet />}
    </div>
  );
};

export default PublicLayout;
