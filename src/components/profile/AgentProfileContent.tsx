// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - Contenuto profilo con testi LEGGIBILI
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Crown, X, User, ChevronDown, Zap, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import PulseEnergyProgressBar from '@/components/pulse/PulseEnergyProgressBar';
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { SUBSCRIPTIONS_STEALTH } from '@/config/featureFlags';

interface AgentProfileContentProps {
  profileImage?: string | null;
  onClose: () => void;
}

// Stagger item variant
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' }
  }
};

export const AgentProfileContent: React.FC<AgentProfileContentProps> = ({
  profileImage,
  onClose
}) => {
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  const { toast } = useToast();
  const { pulseEnergy, currentRank, nextRank, progressToNextRank, loading: peLoading } = usePulseEnergy();
  const { subscription } = useProfileSubscription();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "✅ Logout completato",
        description: "Sei stato disconnesso con successo.",
      });
      onClose();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "❌ Errore logout",
        description: "Impossibile disconnettersi. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  // User data
  const displayName = user?.user_metadata?.full_name || 
                     `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||
                     'Agente';
  const email = user?.email || '';
  const userId = user?.id ? user.id.substring(0, 8) : 'N/A';

  // Subscription tier
  const currentTier = subscription?.plan || user?.user_metadata?.subscription_tier || 'Base';
  const getTierDisplay = () => {
    switch (currentTier?.toLowerCase()) {
      case 'silver':
        return { name: 'Silver', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900', emoji: '🥈' };
      case 'gold':
        return { name: 'Gold', color: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white', emoji: '🥇' };
      case 'black':
        return { name: 'Black', color: 'bg-gray-800 text-white', emoji: '⚫' };
      case 'titanium':
        return { name: 'Titanium', color: 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white', emoji: '💎' };
      default:
        return { name: 'Base', color: 'bg-gray-600 text-white', emoji: '📦' };
    }
  };
  const tierInfo = getTierDisplay();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF]/30 to-[#00D1FF]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[#00D1FF]" />
          </div>
          <h3 className="font-bold text-white text-xl tracking-wide">PROFILO AGENTE</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-11 h-11 rounded-full hover:bg-white/15 transition-colors bg-white/5"
        >
          <X className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-5"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
        }}
      >
        {/* User Info */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center space-x-4 p-5 rounded-2xl border border-[#00D1FF]/25"
          style={{ background: 'rgba(20, 20, 30, 0.95)' }}
        >
          <ProfileAvatar
            profileImage={profileImage}
            className="w-18 h-18 border-3 border-[#00D1FF]/50"
            style={{ width: '72px', height: '72px' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-xl truncate">{displayName}</h3>
            <p className="text-gray-300 text-base truncate mt-1">{email}</p>
            <p className="text-gray-400 text-sm mt-1">ID: {userId}</p>
          </div>
        </motion.div>

        {/* Pulse Energy */}
        {!peLoading && currentRank && (
          <motion.div 
            variants={itemVariants}
            className="p-5 rounded-2xl border border-[#00D1FF]/25 space-y-4"
            style={{ background: 'rgba(20, 20, 30, 0.95)' }}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-[#00D1FF]" />
              <span className="text-white text-lg font-semibold">Pulse Energy</span>
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
            <PulseEnergyProgressBar
              currentRank={currentRank}
              nextRank={nextRank}
              progressPercent={progressToNextRank}
              currentPE={pulseEnergy}
            />
          </motion.div>
        )}

        {/* Subscription Tier */}
        {!SUBSCRIPTIONS_STEALTH && (
          <motion.div 
            variants={itemVariants}
            className="p-5 rounded-2xl border border-[#00D1FF]/25 space-y-4"
            style={{ background: 'rgba(20, 20, 30, 0.95)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-amber-400" />
                <span className="text-white text-lg font-semibold">Piano attivo:</span>
              </div>
              <span className={`px-4 py-2 rounded-full text-base font-bold ${tierInfo.color}`}>
                {tierInfo.emoji} {tierInfo.name}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="space-y-3 pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 rounded-xl py-5 text-lg"
            onClick={handleSettingsClick}
          >
            <Settings className="w-6 h-6 mr-4 text-[#00D1FF]" />
            Modifica profilo
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl py-5 text-lg"
            onClick={handleLogout}
          >
            <LogOut className="w-6 h-6 mr-4" />
            Esci
          </Button>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default AgentProfileContent;
