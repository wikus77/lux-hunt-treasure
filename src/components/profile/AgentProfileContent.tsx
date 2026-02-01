// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - REVOLUT STYLE (Foto 2 reference)
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Crown, X, HelpCircle, User, FileText, GraduationCap, Mail, Shield, Eye, Bell, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useToast } from '@/hooks/use-toast';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { SUBSCRIPTIONS_STEALTH } from '@/config/featureFlags';

interface AgentProfileContentProps {
  profileImage?: string | null;
  onClose: () => void;
}

// Stagger variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } }
};

export const AgentProfileContent: React.FC<AgentProfileContentProps> = ({
  profileImage,
  onClose
}) => {
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  const { toast } = useToast();
  const { currentRank } = usePulseEnergy();
  const { subscription } = useProfileSubscription();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "✅ Logout completato", description: "Disconnesso con successo." });
      onClose();
      navigate('/auth');
    } catch {
      toast({ title: "❌ Errore logout", variant: "destructive" });
    }
  };

  const handleNav = (path: string) => { onClose(); navigate(path); };

  // User data
  const displayName = user?.user_metadata?.full_name || 
    `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Agente M1SSION';
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'agent';

  // Subscription tier
  const currentTier = subscription?.plan || user?.user_metadata?.subscription_tier || 'Base';
  const getTierBadge = () => {
    switch (currentTier?.toLowerCase()) {
      case 'silver': return { name: 'Silver', bg: 'bg-gray-400' };
      case 'gold': return { name: 'Gold', bg: 'bg-amber-500' };
      case 'black': return { name: 'Black', bg: 'bg-gray-800' };
      case 'titanium': return { name: 'Titanium', bg: 'bg-gradient-to-r from-purple-500 to-cyan-500' };
      default: return { name: 'Base', bg: 'bg-blue-600' };
    }
  };
  const tier = getTierBadge();

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* 🎨 REVOLUT HEADER: Gradient + Avatar centrato */}
      <div 
        className="relative flex-shrink-0 pt-3 pb-6"
        style={{
          background: 'linear-gradient(180deg, #1a1040 0%, #2d1b69 40%, #1a1040 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Upgrade button (se non premium) */}
        {currentTier?.toLowerCase() === 'base' && (
          <button
            onClick={() => handleNav('/subscriptions')}
            className="absolute top-3 right-4 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium flex items-center gap-2"
            style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <Crown className="w-4 h-4 text-purple-400" />
            Fai l'upgrade
          </button>
        )}

        {/* Avatar + Name centered */}
        <div className="flex flex-col items-center mt-8">
          <div className="relative">
            <ProfileAvatar
              profileImage={profileImage}
              className="w-24 h-24 border-4 border-white/20"
            />
            {/* Tier badge */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${tier.bg}`}>
              {tier.name}
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold mt-5">{displayName}</h2>
          <p className="text-white/60 text-sm mt-1">@{username}</p>
        </div>
      </div>

      {/* 🎨 REVOLUT CONTENT: Cards + Menu items */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}
      >
        {/* Quick actions cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          {/* Subscription card */}
          <div 
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(30, 30, 40, 0.8)' }}
          >
            <Crown className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-white font-semibold text-sm">{tier.name}</p>
            <p className="text-white/50 text-xs mt-1">Piano attivo</p>
          </div>
          
          {/* Invite friends */}
          <div 
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(30, 30, 40, 0.8)' }}
            onClick={() => handleNav('/referral')}
          >
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white font-semibold text-sm">Invita amici</p>
            <p className="text-white/50 text-xs mt-1">Guadagna M1U</p>
          </div>
        </motion.div>

        {/* Pulse Energy (se presente) */}
        {currentRank && (
          <motion.div 
            variants={itemVariants}
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(30, 30, 40, 0.8)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">Pulse Energy</span>
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
          </motion.div>
        )}

        {/* Menu items - Revolut style */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(30, 30, 40, 0.8)' }}
        >
          <MenuItem icon={HelpCircle} label="Aiuto" onClick={() => handleNav('/help')} />
          <MenuItem icon={User} label="Account" onClick={() => handleNav('/settings')} />
          <MenuItem icon={FileText} label="Documenti" onClick={() => handleNav('/documents')} />
          <MenuItem icon={GraduationCap} label="Impara" onClick={() => handleNav('/learn')} />
          <MenuItem icon={Mail} label="Messaggi" onClick={() => handleNav('/notifications')} badge="3" />
        </motion.div>

        {/* Settings section */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(30, 30, 40, 0.8)' }}
        >
          <MenuItem icon={Shield} label="Sicurezza" onClick={() => handleNav('/security')} />
          <MenuItem icon={Eye} label="Privacy" onClick={() => handleNav('/privacy')} />
          <MenuItem icon={Bell} label="Notifiche" onClick={() => handleNav('/notification-settings')} />
        </motion.div>

        {/* Logout */}
        <motion.div variants={itemVariants}>
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl text-red-400 font-medium text-left flex items-center gap-3"
            style={{ background: 'rgba(30, 30, 40, 0.8)' }}
          >
            <LogOut className="w-5 h-5" />
            Esci
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Menu item component
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: string;
}> = ({ icon: Icon, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-4 flex items-center justify-between border-b border-white/5 last:border-b-0"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-white/70" />
      <span className="text-white text-base">{label}</span>
    </div>
    {badge && (
      <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
        {badge}
      </span>
    )}
  </button>
);

export default AgentProfileContent;
