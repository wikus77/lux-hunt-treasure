// © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
// Skeleton Loader - Fa sembrare l'app più nativa eliminando i "Loading..."

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Skeleton base component con shimmer effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
}) => {
  const baseStyles = 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';
  const animationStyles = animate ? 'animate-shimmer' : '';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
    avatar: 'rounded-full w-10 h-10',
    button: 'rounded-lg h-10',
  };

  return (
    <div
      className={cn(baseStyles, animationStyles, variantStyles[variant], className)}
      style={{
        width: width ?? (variant === 'avatar' ? 40 : '100%'),
        height: height ?? (variant === 'text' ? 16 : variant === 'avatar' ? 40 : 'auto'),
      }}
    />
  );
};

/**
 * Skeleton per una card completa
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 space-y-3', className)}>
    <div className="flex items-center gap-3">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <Skeleton variant="rectangular" height={80} />
    <div className="flex gap-2">
      <Skeleton variant="button" width="30%" />
      <Skeleton variant="button" width="30%" />
    </div>
  </div>
);

/**
 * Skeleton per lista di elementi
 */
export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ count = 3, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton per il profilo utente
 */
export const SkeletonProfile: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('text-center space-y-4', className)}>
    <Skeleton variant="circular" width={80} height={80} className="mx-auto" />
    <Skeleton variant="text" width={120} className="mx-auto" />
    <Skeleton variant="text" width={180} height={12} className="mx-auto" />
    <div className="flex justify-center gap-4 mt-4">
      <Skeleton variant="rectangular" width={60} height={60} />
      <Skeleton variant="rectangular" width={60} height={60} />
      <Skeleton variant="rectangular" width={60} height={60} />
    </div>
  </div>
);

/**
 * Skeleton per la mappa
 */
export const SkeletonMap: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('relative w-full h-full min-h-[400px] rounded-xl overflow-hidden', className)}>
    <Skeleton variant="rectangular" className="absolute inset-0" animate={false} />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-orbitron">Inizializzazione mappa...</p>
      </div>
    </div>
  </div>
);

/**
 * Skeleton per statistiche/metriche
 */
export const SkeletonStats: React.FC<{ count?: number; className?: string }> = ({ count = 4, className }) => (
  <div className={cn('grid grid-cols-2 gap-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
        <Skeleton variant="text" width="40%" height={12} />
        <Skeleton variant="text" width="60%" height={24} className="mt-2" />
      </div>
    ))}
  </div>
);

/**
 * Full page skeleton loader - sostituisce le schermate "Loading..."
 */
export const PageSkeleton: React.FC<{ variant?: 'default' | 'profile' | 'list' | 'map' }> = ({ variant = 'default' }) => (
  <div className="min-h-screen bg-background p-4 space-y-4 animate-fadeIn">
    {variant === 'profile' && <SkeletonProfile />}
    {variant === 'list' && <SkeletonList count={5} />}
    {variant === 'map' && <SkeletonMap />}
    {variant === 'default' && (
      <>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
        <SkeletonStats />
        <SkeletonCard />
        <SkeletonList count={3} />
      </>
    )}
  </div>
);

export default Skeleton;




