// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80; // px to trigger refresh
const MAX_PULL = 120; // max pull distance

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start pull if at top of scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance curve
      const resistance = 0.5;
      const newPull = Math.min(diff * resistance, MAX_PULL);
      setPullDistance(newPull);
      
      // Prevent default scroll when pulling
      if (newPull > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(60); // Hold at indicator position
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('[MissionSync] Refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Release without refresh
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: isPulling && pullDistance > 10 ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: Math.min(pullDistance, MAX_PULL) - 60
            }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.2 }}
            style={{ top: 0 }}
          >
            {/* M1 Logo - Solo logo, nessun testo */}
            <motion.div
              className={`
                flex items-center justify-center rounded-full overflow-hidden
                ${shouldTrigger || isRefreshing ? 'ring-2 ring-cyan-400/60' : ''}
                transition-all duration-200
              `}
              animate={{ 
                scale: isRefreshing ? [1, 1.1, 1] : shouldTrigger ? 1.1 : 0.9 + progress * 0.2,
                rotate: isRefreshing ? 360 : 0
              }}
              transition={{ 
                scale: isRefreshing 
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } 
                  : { duration: 0.2 },
                rotate: isRefreshing 
                  ? { duration: 1.5, repeat: Infinity, ease: 'linear' } 
                  : { duration: 0 }
              }}
            >
              <img 
                src={M1_LOGO_URL} 
                alt="M1" 
                className="w-12 h-12 object-contain"
                style={{
                  filter: shouldTrigger || isRefreshing 
                    ? 'drop-shadow(0 0 10px rgba(0, 209, 255, 0.8))' 
                    : 'none'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull offset */}
      <motion.div
        animate={{ y: pullDistance > 0 ? pullDistance : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MissionSync;


