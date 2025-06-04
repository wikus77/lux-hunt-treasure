
import React from "react";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * GlobalLayout wraps all pages and provides consistent UI elements
 * that should appear on every page
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">      
      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlobalLayout;
