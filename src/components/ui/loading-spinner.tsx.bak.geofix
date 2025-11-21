// © 2025 Joseph MULÉ – M1SSION™ - Premium Loading Components
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'subtle';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const variants = {
    default: 'border-primary',
    premium: 'border-gradient-primary',
    subtle: 'border-muted-foreground'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <motion.div
        className={cn(
          "border-2 border-solid rounded-full",
          "border-t-transparent border-l-transparent",
          sizeClasses[size],
          variants[variant]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  variant?: 'overlay' | 'inline' | 'replace';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  text = "Caricamento...",
  children,
  variant = 'overlay'
}) => {
  if (!isLoading) return <>{children}</>;

  if (variant === 'replace') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner text={text} variant="premium" />
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text={text} />
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // overlay variant
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner text={text} variant="premium" />
      </div>
    </div>
  );
};

export default LoadingSpinner;