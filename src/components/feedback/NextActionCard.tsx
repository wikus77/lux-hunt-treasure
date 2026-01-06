/**
 * M1SSION™ Next Action Card
 * Shows the next recommended action on Home
 * GREEN GLASS STYLE - Matching Feature Flag Popups
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Map, Zap, Gift, Brain, Swords, Target, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { determineNextAction, NextAction } from '@/gameplay/progress';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { PROGRESS_FEEDBACK_ENABLED, isUserInProgressFeedbackAllowlist } from '@/config/featureFlags';
import { GLASS_PRESETS, M1SSION_COLORS } from './glassPresets';

interface NextActionCardProps {
  className?: string;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({ className = '' }) => {
  const [, navigate] = useLocation();
  const { user } = useUnifiedAuth();
  const { missionStatus } = useMissionStatus();
  const { dailyBuzzCounter } = useBuzzCounter(user?.id);
  
  // 🛡️ ALLOWLIST CHECK
  const isAllowed = isUserInProgressFeedbackAllowlist(user?.email);
  
  // Use SUCCESS (green) preset
  const preset = GLASS_PRESETS.success;
  
  // 🔄 Force refresh every 30 seconds to rotate suggestions
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Determine next action - refreshes with rotation
  const nextAction: NextAction = useMemo(() => {
    return determineNextAction({
      clueCount: missionStatus?.cluesFound || 0,
      hasUnclaimedRewards: false, // TODO: connect to real data
      dailyBuzzCount: dailyBuzzCounter || 0,
      maxDailyBuzz: 50,
    });
  }, [missionStatus?.cluesFound, dailyBuzzCounter, refreshKey]);
  
  // Don't render if feature disabled OR user not in allowlist
  if (!PROGRESS_FEEDBACK_ENABLED || !isAllowed) return null;
  
  // Don't render if no action or low priority
  if (!nextAction || nextAction.priority < 50) return null;
  
  // Handle click
  const handleClick = () => {
    navigate(nextAction.path);
  };
  
  // Get icon based on action type
  const getIcon = () => {
    switch (nextAction.type) {
      case 'go_to_map':
        return <Map className="w-6 h-6" />;
      case 'go_to_map_rewards':
        return <Gift className="w-6 h-6" />;
      case 'go_to_map_buzz_map':
        return <Target className="w-6 h-6" />;
      case 'do_buzz':
        return <Zap className="w-6 h-6" />;
      case 'claim_reward':
        return <Sparkles className="w-6 h-6" />;
      case 'check_intelligence':
        return <Brain className="w-6 h-6" />;
      case 'do_battle':
        return <Swords className="w-6 h-6" />;
      case 'do_pulse_breaker':
        return <Target className="w-6 h-6" />;
      default:
        return <ChevronRight className="w-6 h-6" />;
    }
  };
  
  return (
    <motion.div
      className={`flex-1 min-w-0 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleClick}
        className="w-full rounded-2xl overflow-hidden relative backdrop-blur-xl"
        style={{
          background: preset.background,
          border: preset.border,
          boxShadow: preset.boxShadow,
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 0 60px rgba(0, 255, 136, 0.5), 0 8px 40px rgba(0, 0, 0, 0.6)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Ambient glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${preset.glowColor} 0%, transparent 60%)`,
          }}
        />
        
        <div className="relative flex items-center p-4 gap-3">
          {/* Icon with glow */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${M1SSION_COLORS.green} 0%, ${M1SSION_COLORS.cyan} 100%)`,
              boxShadow: `0 4px 20px ${preset.glowColor}`,
            }}
          >
            <span className="text-black">{getIcon()}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-left min-w-0">
            <p 
              className="text-xs font-bold mb-0.5 uppercase tracking-wider"
              style={{ 
                color: preset.textColor,
                textShadow: `0 0 15px ${preset.glowColor}`,
              }}
            >
              🎯 PROSSIMO PASSO
            </p>
            <p className="text-white font-bold text-sm truncate">
              {nextAction.label}
            </p>
            <p className="text-white/60 text-xs truncate">
              {nextAction.description}
            </p>
          </div>
          
          {/* Arrow */}
          <div className="flex-shrink-0">
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `${preset.textColor}15`,
                border: `1px solid ${preset.textColor}30`,
              }}
              animate={{ x: [0, 4, 0] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: 'easeInOut',
              }}
            >
              <ChevronRight 
                className="w-4 h-4" 
                style={{ color: preset.textColor }}
              />
            </motion.div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default NextActionCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
