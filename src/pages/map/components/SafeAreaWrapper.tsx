
import React from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
};

export default SafeAreaWrapper;
