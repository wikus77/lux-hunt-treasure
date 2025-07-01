
import React from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        pt-[env(safe-area-inset-top)]
        pb-[env(safe-area-inset-bottom)]
        pl-[env(safe-area-inset-left)]
        pr-[env(safe-area-inset-right)]
        ${className}
      `}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {children}
    </div>
  );
};

export default SafeAreaWrapper;
