// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - REVOLUT EXACT CLONE
import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Crown, X, HelpCircle, User, FileText, GraduationCap, Mail, Shield, Eye, Bell, Zap, Users, Sparkles } from 'lucide-react';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useToast } from '@/hooks/use-toast';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';

interface AgentProfileContentProps {
  profileImage?: string | null;
  onClose: () => void;
}

// Stagger animation
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.035, delayChildren: 0.1 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export const AgentProfileContent: React.FC<AgentProfileContentProps> = ({
  profileImage,
  onClose
}) => {
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  const { toast } = useToast();
  const { currentRank, pulseEnergy } = usePulseEnergy();
  const { subscription } = useProfileSubscription();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "✅ Logout", description: "Disconnesso." });
      onClose();
      navigate('/auth');
    } catch {
      toast({ title: "❌ Errore", variant: "destructive" });
    }
  };

  const nav = (path: string) => { onClose(); navigate(path); };

  // User info
  const displayName = user?.user_metadata?.full_name || 
    `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Agente';
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'agent';

  // Tier
  const tier = subscription?.plan || user?.user_metadata?.subscription_tier || 'Base';
  const tierStyle = {
    silver: { label: 'Silver', bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-800' },
    gold: { label: 'Gold', bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900' },
    black: { label: 'Black', bg: 'bg-gray-900', text: 'text-white' },
    titanium: { label: 'Titanium', bg: 'bg-gradient-to-r from-purple-500 to-cyan-400', text: 'text-white' },
    base: { label: 'Base', bg: 'bg-blue-600', text: 'text-white' },
  }[tier?.toLowerCase()] || { label: 'Base', bg: 'bg-blue-600', text: 'text-white' };

  const showUpgrade = tier?.toLowerCase() === 'base';

  return (
    <div className="h-full flex flex-col" style={{ background: '#0c0c14' }}>
      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT HEADER - Gradient purple/blue + centered avatar
          ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="relative flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #1a103d 0%, #2a1a5e 50%, #1a103d 100%)',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          paddingBottom: '28px',
        }}
      >
        {/* Top bar: X button + Upgrade */}
        <div 
          className="flex items-center justify-between px-4 pt-3 pb-2"
        >
          {/* Close X - Revolut style gray circle */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-5 h-5 text-white/90" strokeWidth={2.5} />
          </button>

          {/* Upgrade button - only if Base tier */}
          {showUpgrade ? (
            <button
              onClick={() => nav('/subscriptions')}
              className="px-4 py-2 rounded-full flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-white text-sm font-medium">Fai l'upgrade</span>
            </button>
          ) : <div />}
        </div>

        {/* Centered Avatar + Badge + Name */}
        <div className="flex flex-col items-center mt-4">
          {/* Avatar with tier badge */}
          <div className="relative">
            <ProfileAvatar
              profileImage={profileImage}
              className="w-[88px] h-[88px] border-[3px] border-white/20 shadow-lg"
            />
            {/* Tier badge below avatar */}
            <div 
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold ${tierStyle.bg} ${tierStyle.text}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {tierStyle.label}
            </div>
          </div>

          {/* Name */}
          <h1 className="text-white text-[26px] font-bold mt-6 tracking-tight">
            {displayName}
          </h1>
          
          {/* Username */}
          <p className="text-white/50 text-[15px] mt-1">
            @{username}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT CONTENT - Cards + Menu list
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pt-5 pb-8"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
        }}
      >
        {/* Quick action cards - 2 columns */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-4">
          {/* Subscription card */}
          <div 
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(35, 35, 50, 0.95)' }}
            onClick={() => nav('/subscriptions')}
          >
            <Crown className="w-7 h-7 text-amber-400 mb-2" />
            <p className="text-white font-semibold text-[15px]">{tierStyle.label}</p>
            <p className="text-white/40 text-[13px] mt-0.5">Piano attivo</p>
          </div>
          
          {/* Invite friends */}
          <div 
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(35, 35, 50, 0.95)' }}
            onClick={() => nav('/referral')}
          >
            <Users className="w-7 h-7 text-blue-400 mb-2" />
            <p className="text-white font-semibold text-[15px]">Invita amici</p>
            <p className="text-white/40 text-[13px] mt-0.5">Guadagna M1U</p>
          </div>
        </motion.div>

        {/* Pulse Energy card (if available) */}
        {currentRank && (
          <motion.div 
            variants={fadeUp}
            className="p-4 rounded-2xl mb-4"
            style={{ background: 'rgba(35, 35, 50, 0.95)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">Pulse Energy</span>
              {pulseEnergy !== undefined && (
                <span className="ml-auto text-cyan-400 font-bold text-[14px]">
                  {pulseEnergy.toLocaleString()} PE
                </span>
              )}
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
          </motion.div>
        )}

        {/* Menu section 1 */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: 'rgba(35, 35, 50, 0.95)' }}
        >
          <MenuItem icon={HelpCircle} label="Aiuto" onClick={() => nav('/help')} />
          <MenuItem icon={User} label="Conto" onClick={() => nav('/settings')} />
          <MenuItem icon={FileText} label="Documenti" onClick={() => nav('/documents')} />
          <MenuItem icon={GraduationCap} label="Impara" onClick={() => nav('/learn')} />
          <MenuItem icon={Mail} label="Posta in arrivo" onClick={() => nav('/notifications')} badge={3} last />
        </motion.div>

        {/* Menu section 2 - Settings */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: 'rgba(35, 35, 50, 0.95)' }}
        >
          <MenuItem icon={Shield} label="Sicurezza" onClick={() => nav('/security')} />
          <MenuItem icon={Eye} label="Privacy" onClick={() => nav('/privacy')} />
          <MenuItem icon={Bell} label="Impostazioni di notifica" onClick={() => nav('/notification-settings')} last />
        </motion.div>

        {/* Logout */}
        <motion.div variants={fadeUp}>
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(35, 35, 50, 0.95)' }}
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium text-[16px]">Esci</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Revolut-style menu item
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  last?: boolean;
}> = ({ icon: Icon, label, onClick, badge, last }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-[15px] flex items-center justify-between ${!last ? 'border-b border-white/[0.06]' : ''}`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-[22px] h-[22px] text-white/70" />
      <span className="text-white text-[16px]">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[12px] font-bold min-w-[24px] text-center">
        {badge}
      </span>
    )}
  </button>
);

export default AgentProfileContent;
