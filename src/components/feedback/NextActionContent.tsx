// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Next Action Content - REVOLUT STYLE
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Map, 
  Zap, 
  Brain, 
  Target,
  ChevronRight,
  AlertTriangle,
  Bomb
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { track } from '@/lib/analytics';
import { 
  MISSIONS_ENABLED, 
  getMissionOfTheDay,
  calculatePhaseRewards,
} from '@/missions/missionsRegistry';
import { 
  getMissionState, 
  isPhase2Available,
} from '@/missions/missionState';
import { DailyMissionFlipOverlay } from './DailyMissionFlipOverlay';
import { DailyMissionContent } from './DailyMissionContent';
import { isVeraBombEnabled } from '@/config/featureFlags';

interface NextActionContentProps {
  onClose: () => void;
  onOpenVeraBomb: () => void;
}

export const NextActionContent: React.FC<NextActionContentProps> = ({ onClose, onOpenVeraBomb }) => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const { missionStatus } = useMissionStatus();
  const { dailyBuzzCounter } = useBuzzCounter(user?.id);
  
  // Daily Mission state
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionPhase, setMissionPhase] = useState(0);
  const [isMissionReady, setIsMissionReady] = useState(false);

  const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;
  
  // Dynamic priority calculation
  const daysRemaining = missionStatus?.daysRemaining ?? null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3;
  const buzzUsedToday = dailyBuzzCounter > 0;

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

  const isPhase2Ready = isPhase2Available();
  const isMissionNotStarted = missionPhase === 0;
  const isMissionCompleted = missionPhase === 3;

  // Dynamic priority calculation
  const orderedActions = useMemo(() => {
    const baseActions = [
      {
        id: 'map',
        priority: isUrgent ? 100 : 90,
        label: t('home_next_action_explore'),
        description: isUrgent ? `⚠️ ${t('home_next_action_explore_urgent')}` : t('home_next_action_explore_desc'),
        icon: <Map style={{ width: '20px', height: '20px' }} />,
        path: '/map-3d-tiler',
        color: '#FF4444',
        isUrgent,
      },
      {
        id: 'buzz',
        priority: buzzUsedToday ? 60 : 80,
        label: t('home_next_action_buzz'),
        description: buzzUsedToday ? t('home_next_action_buzz_used', { count: dailyBuzzCounter }) : t('home_next_action_buzz_desc'),
        icon: <Zap style={{ width: '20px', height: '20px' }} />,
        path: '/buzz',
        color: '#FFD700',
        isUrgent: false,
      },
      {
        id: 'aion',
        priority: 70,
        label: t('home_next_action_oracle'),
        description: t('home_next_action_oracle_desc'),
        icon: <Brain style={{ width: '20px', height: '20px' }} />,
        path: '/intelligence',
        color: '#00D1FF',
        isUrgent: false,
      },
    ];
    
    return baseActions.sort((a, b) => b.priority - a.priority);
  }, [isUrgent, buzzUsedToday, dailyBuzzCounter, t]);
  
  const primaryAction = orderedActions[0]?.id || 'explore';
  
  const handleActionClick = useCallback((actionId: string, path: string) => {
    const eventMap: Record<string, string> = {
      'map': 'next_action_explore_click',
      'buzz': 'next_action_buzz_click',
      'aion': 'next_action_oracle_click',
    };
    
    const eventName = eventMap[actionId];
    if (eventName) {
      track(eventName, {
        screen: 'home',
        primary_action: primaryAction,
        days_left: daysRemaining,
        is_urgent: isUrgent,
        clicked_action: actionId,
      });
    }
    
    onClose();
    setTimeout(() => navigate(path), 100);
  }, [navigate, primaryAction, daysRemaining, isUrgent, onClose]);
  
  const handleDailyMissionClick = useCallback(() => {
    track('daily_mission_click_from_next_action', {
      screen: 'home',
      primary_action: primaryAction,
      days_left: daysRemaining,
      is_urgent: isUrgent,
      mission_phase: missionPhase,
    });
    
    setShowMissionModal(true);
  }, [primaryAction, daysRemaining, isUrgent, missionPhase]);

  const getMissionStatusText = () => {
    if (!MISSIONS_ENABLED || !isMissionReady || isMissionCompleted) return null;
    if (isMissionNotStarted) return t('home_next_action_new_mission');
    if (missionPhase === 1 && !isPhase2Ready) return t('home_next_action_p1_active');
    if (missionPhase === 2 && !isPhase2Ready) return t('home_next_action_p2_tomorrow');
    if (isPhase2Ready) return t('home_next_action_p2_ready');
    return null;
  };

  const missionStatusText = getMissionStatusText();

  return (
    <>
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER — NotificationsCardMotion (identico a Impostazioni / card Notifiche) */}
        <div
          className="m1-folder-glass--graphite"
          style={{
            flexShrink: 0,
            width: '100%',
            position: 'relative' as const,
            padding: 0,
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="m1-panel relative"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
              paddingBottom: '16px',
              paddingLeft: '16px',
              paddingRight: '16px',
              borderRadius: '16px 16px 0 0',
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Target style={{ width: '20px', height: '20px', color: '#22C55E' }} />
                  <h1 style={{
                    color: isUrgent ? '#FF4444' : '#22C55E',
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                  }}>
                    🎯 {t('home_next_action_title')}
                  </h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
                  {isUrgent ? `⚠️ ${t('home_next_action_subtitle_urgent', { count: daysRemaining })}` : t('home_next_action_subtitle')}
                </p>
              </div>

              <div style={{ width: '40px' }} />
            </div>
          </motion.div>
        </div>

        {/* CONTENT */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Primary Actions - fallback [] for iOS WKWebView safety */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {(orderedActions ?? []).map((action, index) => (
              <motion.button
                key={action.id}
                onClick={() => handleActionClick(action.id, action.path)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}08 100%)`,
                  border: `1px solid ${action.color}40`,
                  cursor: 'pointer',
                }}
              >
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`,
                    border: `1px solid ${action.color}50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
                      {action.label}
                    </p>
                    {action.isUrgent && index === 0 && (
                      <AlertTriangle style={{ width: '14px', height: '14px', color: '#FF4444' }} />
                    )}
                  </div>
                  <p style={{ color: action.isUrgent ? 'rgba(255, 68, 68, 0.8)' : 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    {action.description}
                  </p>
                </div>

                <ChevronRight style={{ width: '16px', height: '16px', color: action.color, flexShrink: 0 }} />
              </motion.button>
            ))}
          </div>

          {/* Optional actions (Daily Mission + VERA BOMB) */}
          {(MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission) || isVeraBombEnabled() ? (
            <>
              {/* Section divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Azioni opzionali di oggi
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* VERA MISSION BOMB - Entrypoint (feature flag) */}
              {isVeraBombEnabled() && (
                <GlassCard onClick={onOpenVeraBomb} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.3), rgba(255, 68, 68, 0.1))',
                        border: '1px solid rgba(255, 68, 68, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bomb style={{ width: '20px', height: '20px', color: '#FF4444' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
                        {t('vera_mission.bomb.title')}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                        {t('vera_mission.bomb.next_action_desc')}
                      </p>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255, 68, 68, 0.6)', flexShrink: 0 }} />
                  </div>
                </GlassCard>
              )}

              {/* Daily Mission Card */}
              {MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission && (
              <GlassCard onClick={handleDailyMissionClick}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.3), rgba(0, 209, 255, 0.1))',
                      border: '1px solid rgba(0, 209, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{mission.icon}</span>
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
                      Daily Mission
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                      {mission.title}
                    </p>
                  </div>

                  {missionStatusText && (
                    <div 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        flexShrink: 0,
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

                  <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(0, 209, 255, 0.6)', flexShrink: 0 }} />
                </div>
              </GlassCard>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Daily Mission Modal */}
      {mission && (
        <DailyMissionFlipOverlay
          open={showMissionModal}
          onClose={() => setShowMissionModal(false)}
        >
          <DailyMissionContent 
            mission={mission}
            onClose={() => setShowMissionModal(false)}
            onComplete={() => {
              refreshMissionState();
              setShowMissionModal(false);
            }}
          />
        </DailyMissionFlipOverlay>
      )}
    </>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '14px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

export default NextActionContent;
