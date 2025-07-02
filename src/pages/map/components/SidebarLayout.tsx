
import React from 'react';

interface SidebarLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ leftContent, rightContent }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {leftContent}
      </div>
      <div className="space-y-4">
        {rightContent}
      </div>
    </div>
  );
};

export default SidebarLayout;
