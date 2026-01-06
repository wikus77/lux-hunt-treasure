/**
 * M1SSION™ Next Action Card
 * Shows the next recommended action on Home
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Map, Zap, Gift, Brain, Swords } from 'lucide-react';
import { useLocation } from 'wouter';
import { determineNextAction, NextAction } from '@/gameplay/progress';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { PROGRESS_FEEDBACK_ENABLED } from '@/config/featureFlags';

interface NextActionCardProps {
  className?: string;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({ className = '' }) => {
  const [, navigate] = useLocation();
  const { user } = useUnifiedAuth();
  const { missionStatus } = useMissionStatus();
  const { dailyBuzzCounter } = useBuzzCounter(user?.id);
  
  // Determine next action
  const nextAction: NextAction = useMemo(() => {
    return determineNextAction({
      clueCount: missionStatus?.cluesFound || 0,
      hasUnclaimedRewards: false, // TODO: connect to real data
      dailyBuzzCount: dailyBuzzCounter || 0,
      maxDailyBuzz: 50,
    });
  }, [missionStatus?.cluesFound, dailyBuzzCounter]);
  
  // Don't render if feature disabled
  if (!PROGRESS_FEEDBACK_ENABLED) return null;
  
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
        return <Map className="w-5 h-5" />;
      case 'do_buzz':
        return <Zap className="w-5 h-5" />;
      case 'claim_reward':
        return <Gift className="w-5 h-5" />;
      case 'check_intelligence':
        return <Brain className="w-5 h-5" />;
      case 'do_battle':
        return <Swords className="w-5 h-5" />;
      default:
        return <ChevronRight className="w-5 h-5" />;
    }
  };
  
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleClick}
        className="w-full rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(123, 92, 255, 0.15) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
        }}
        whileHover={{ 
          scale: 1.01,
          borderColor: 'rgba(0, 229, 255, 0.6)',
        }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center p-4 gap-3">
          {/* Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #7B5CFF 100%)',
              boxShadow: '0 2px 10px rgba(0, 229, 255, 0.4)',
            }}
          >
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs text-cyan-400 font-medium mb-0.5">
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
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'easeInOut',
              }}
            >
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>
        </div>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(0, 229, 255, 0.1) 0%, transparent 50%)',
          }}
        />
      </motion.button>
    </motion.div>
  );
};

export default NextActionCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

