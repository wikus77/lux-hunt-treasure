/**
 * M1SSION™ Next Action Container - FULLSCREEN REVOLUT STYLE
 * Tap to open fullscreen modal with priority hierarchy
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  Target,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GLASS_PRESETS, M1SSION_COLORS } from './glassPresets';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { track } from '@/lib/analytics';
import { 
  MISSIONS_ENABLED, 
  getMissionOfTheDay,
} from '@/missions/missionsRegistry';
import { 
  getMissionState, 
  isPhase2Available,
} from '@/missions/missionState';
import { NextActionFlipOverlay } from './NextActionFlipOverlay';
import { NextActionContent } from './NextActionContent';

interface NextActionContainerProps {
  className?: string;
}

export const NextActionContainer: React.FC<NextActionContainerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  
  const { missionStatus } = useMissionStatus();
  const { dailyBuzzCounter } = useBuzzCounter(user?.id);
  
  const [missionPhase, setMissionPhase] = useState(0);
  const [isMissionReady, setIsMissionReady] = useState(false);

  const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;

  const preset = GLASS_PRESETS.success;
  
  const daysRemaining = missionStatus?.daysRemaining ?? null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3;

  // Mission state refresh
  const refreshMissionState = useCallback(() => {
    if (!MISSIONS_ENABLED) return;
    const state = getMissionState();
    setMissionPhase(state.phase);
  }, []);

  useEffect(() => {
    if (!MISSIONS_ENABLED) return;
    const timer = setTimeout(() => {
      refreshMissionState();
      setIsMissionReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshMissionState]);

  useEffect(() => {
    if (!MISSIONS_ENABLED || !user || !isMissionReady) return;
    const interval = setInterval(refreshMissionState, 5000);
    return () => clearInterval(interval);
  }, [user, isMissionReady, refreshMissionState]);

  const isPhase2Ready = isPhase2Available();
  const isMissionNotStarted = missionPhase === 0;
  const isMissionCompleted = missionPhase === 3;

  // Get mission status text
  const getMissionStatusText = () => {
    if (!MISSIONS_ENABLED || !isMissionReady || isMissionCompleted) return null;
    if (isMissionNotStarted) return 'Nuova!';
    if (missionPhase === 1 && !isPhase2Ready) return 'P1';
    if (missionPhase === 2 && !isPhase2Ready) return 'P2 🔜';
    if (isPhase2Ready) return 'P2!';
    return null;
  };

  const missionStatusText = getMissionStatusText();

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setIsModalOpen(true);
    track('next_action_expand', {
      screen: 'home',
      days_left: daysRemaining,
      is_urgent: isUrgent,
    });
  };

  return (
    <>
      <motion.div
        className={`w-full ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={handleOpenModal}
          className="w-full rounded-2xl overflow-hidden relative backdrop-blur-xl"
          style={{
            background: preset.background,
            border: preset.border,
            boxShadow: preset.boxShadow,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Ambient glow effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${preset.glowColor} 0%, transparent 60%)`,
            }}
          />

          <div className="relative flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {/* Icon with glow */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${M1SSION_COLORS.green} 0%, ${M1SSION_COLORS.cyan} 100%)`,
                  boxShadow: `0 4px 20px ${preset.glowColor}`,
                }}
              >
                <Target className="w-5 h-5 text-black" />
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ 
                      color: isUrgent ? '#FF4444' : preset.textColor,
                      textShadow: `0 0 15px ${isUrgent ? 'rgba(255, 68, 68, 0.5)' : preset.glowColor}`,
                    }}
                  >
                    🎯 NEXT ACTION
                  </p>
                  {/* GIOCA badge - always visible, red with pulse */}
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 animate-pulse">
                    GIOCA
                  </span>
                  {isUrgent && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 animate-pulse">
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-xs">
                  {isUrgent ? `Solo ${daysRemaining} giorni rimasti!` : 'Tocca per vedere le opzioni'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Daily Mission badge */}
              {MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission && missionStatusText && (
                <div 
                  className="px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: isMissionNotStarted 
                      ? 'rgba(0, 255, 150, 0.2)' 
                      : isPhase2Ready 
                        ? 'rgba(255, 215, 0, 0.2)' 
                        : 'rgba(0, 209, 255, 0.2)',
                    color: isMissionNotStarted 
                      ? '#00FF96' 
                      : isPhase2Ready 
                        ? '#FFD700' 
                        : '#00D1FF',
                  }}
                >
                  {missionStatusText}
                </div>
              )}

              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `${preset.textColor}15`,
                  border: `1px solid ${preset.textColor}30`,
                }}
              >
                <ChevronDown 
                  className="w-4 h-4" 
                  style={{ color: preset.textColor }}
                />
              </motion.div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Next Action FULLSCREEN Modal - REVOLUT STYLE */}
      <NextActionFlipOverlay
        open={isModalOpen}
        originRect={originRect}
        onClose={() => setIsModalOpen(false)}
      >
        <NextActionContent onClose={() => setIsModalOpen(false)} />
      </NextActionFlipOverlay>
    </>
  );
};

export default NextActionContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
