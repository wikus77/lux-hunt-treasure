
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
    <>
      {/* Global DynamicIsland component with pointer-events-none wrapper and pointer-events-auto inner div */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <DynamicIsland />
        </div>
      </div>
      
      {/* Page content */}
      {children}
    </>
  );
};

export default GlobalLayout;
