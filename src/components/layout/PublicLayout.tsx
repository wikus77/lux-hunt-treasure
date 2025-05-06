
import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout component for public routes
 * Wraps public pages with common layout elements
 */
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
