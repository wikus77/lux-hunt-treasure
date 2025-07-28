// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Lazy Component Loader for Performance Optimization

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

interface LazyComponentLoaderProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <motion.div
      className="w-8 h-8 border-t-2 border-cyan-400 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({
  loader,
  fallback = <DefaultFallback />,
  className
}) => {
  const LazyComponent = lazy(loader);

  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </div>
  );
};

// Pre-built lazy loaders for common components
export const LazyBuzzPage = () => (
  <LazyComponentLoader 
    loader={() => import('@/pages/BuzzPage')}
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-t-2 border-cyan-400 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/70">Caricamento BUZZ...</p>
        </div>
      </div>
    }
  />
);

export const LazyMap = () => (
  <LazyComponentLoader 
    loader={() => import('@/pages/Map')}
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-t-2 border-cyan-400 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/70">Caricamento Mappa...</p>
        </div>
      </div>
    }
  />
);