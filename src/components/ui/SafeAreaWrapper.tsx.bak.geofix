
import React from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, className }) => {
  return (
    <div className={cn("pt-safe-top pb-safe-bottom", className)}>
      {children}
    </div>
  );
};

export default SafeAreaWrapper;
