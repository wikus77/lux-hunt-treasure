
import React from "react";
import DynamicIsland from "../DynamicIsland";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * GlobalLayout wraps all pages and provides consistent UI elements
 * that should appear on every page, like the DynamicIsland component
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Global DynamicIsland component positioned at the top center */}
      <DynamicIsland />
      
      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlobalLayout;
