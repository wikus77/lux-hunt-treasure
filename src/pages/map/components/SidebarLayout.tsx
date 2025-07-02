
import React, { ReactNode } from 'react';

interface SidebarLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ leftContent, rightContent }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
      {/* Left column */}
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        {leftContent}
      </div>
      
      {/* Right column: Map points and search areas */}
      <div className="space-y-6">
        {rightContent}
      </div>
    </div>
  );
};

export default SidebarLayout;
