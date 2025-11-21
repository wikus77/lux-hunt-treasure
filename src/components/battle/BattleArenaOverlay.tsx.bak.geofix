/**
 * Battle Arena Overlay - Fullscreen modal for deep-link battles
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BattleArena = lazy(() => import('@/pages/BattleArena'));

interface BattleArenaOverlayProps {
  battleId: string | null;
  open: boolean;
  onClose: () => void;
}

export function BattleArenaOverlay({ battleId, open, onClose }: BattleArenaOverlayProps) {
  if (!battleId || !open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-[201] safe-top">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Arena content */}
          <div className="h-full w-full overflow-y-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <motion.div
                    className="w-12 h-12 border-4 border-[#FC1EFF] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              }
            >
              {/* Pass battleId as prop to support embedded context */}
              <BattleArena battleId={battleId} />
            </Suspense>
          </div>

          {/* Neon glow effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(252, 30, 255, 0.1) 0%, transparent 50%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
