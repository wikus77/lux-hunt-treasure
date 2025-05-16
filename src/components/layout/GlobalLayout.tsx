
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
      {/* Global DynamicIsland component */}
      <DynamicIsland />
      
      {/* Page content */}
      {children}
    </>
  );
};

export default GlobalLayout;
