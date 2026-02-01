// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - REVOLUT LOOK (vetro fumé + premium)
import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Crown, X, HelpCircle, FileText, GraduationCap, Mail, Shield, Eye, Bell, Zap, Users, Sparkles } from 'lucide-react';
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
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
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
    silver: { label: 'Silver', bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-900' },
    gold: { label: 'Gold', bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-amber-900' },
    black: { label: 'Black', bg: 'bg-gray-800', text: 'text-white' },
    titanium: { label: 'Titanium', bg: 'bg-gradient-to-r from-purple-500 to-cyan-400', text: 'text-white' },
    base: { label: 'Base', bg: 'bg-blue-500', text: 'text-white' },
  }[tier?.toLowerCase()] || { label: 'Base', bg: 'bg-blue-500', text: 'text-white' };

  const showUpgrade = tier?.toLowerCase() === 'base';

  // 🎨 REVOLUT GLASS CARD - vetro fumé premium
  const glassCard: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(24px) saturate(150%)',
    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(15, 15, 22, 0.95)' }}>
      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT HEADER - Gradient purple premium
          ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="relative flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(45, 25, 100, 0.98) 0%, rgba(60, 35, 130, 0.95) 50%, rgba(35, 20, 75, 0.98) 100%)',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          paddingBottom: '28px',
        }}
      >
        {/* Top bar: X button + Upgrade */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Close X - pulito, leggibile */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <X className="w-5 h-5 text-white/90" strokeWidth={2} />
          </button>

          {/* Upgrade button */}
          {showUpgrade ? (
            <button
              onClick={() => nav('/subscriptions')}
              className="px-4 py-2 rounded-full flex items-center gap-2 active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-white/90 text-sm font-semibold">Fai l'upgrade</span>
            </button>
          ) : <div />}
        </div>

        {/* Centered Avatar + Badge + Name */}
        <div className="flex flex-col items-center mt-3">
          <div className="relative">
            <ProfileAvatar
              profileImage={profileImage}
              className="w-[88px] h-[88px] border-[3px] border-white/25 shadow-2xl"
            />
            {/* Tier badge */}
            <div 
              className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-bold shadow-lg ${tierStyle.bg} ${tierStyle.text}`}
            >
              {tierStyle.label}
            </div>
          </div>

          {/* NAME - grande, leggibile */}
          <h1 className="text-[26px] font-bold mt-6 tracking-tight text-white">
            {displayName}
          </h1>
          
          {/* Username */}
          <p className="text-[14px] mt-1 text-white/55">
            @{username}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT CONTENT - Glass cards premium
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pt-5"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
        }}
      >
        {/* Quick action cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
            style={glassCard}
            onClick={() => nav('/subscriptions')}
          >
            <Crown className="w-7 h-7 text-amber-400 mb-2" />
            <p className="font-semibold text-[15px] text-white">{tierStyle.label}</p>
            <p className="text-[12px] mt-0.5 text-white/50">Piano attivo</p>
          </div>
          
          <div 
            className="p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
            style={glassCard}
            onClick={() => nav('/referral')}
          >
            <Users className="w-7 h-7 text-blue-400 mb-2" />
            <p className="font-semibold text-[15px] text-white">Invita amici</p>
            <p className="text-[12px] mt-0.5 text-white/50">Guadagna M1U</p>
          </div>
        </motion.div>

        {/* Pulse Energy */}
        {currentRank && (
          <motion.div 
            variants={fadeUp}
            className="p-4 rounded-2xl mb-4"
            style={glassCard}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-[15px] text-white">Pulse Energy</span>
              {pulseEnergy !== undefined && (
                <span className="ml-auto font-bold text-[14px] text-cyan-400">
                  {pulseEnergy.toLocaleString()} PE
                </span>
              )}
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
          </motion.div>
        )}

        {/* Menu section 1 - SENZA "Conto" */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={glassCard}
        >
          <MenuItem icon={HelpCircle} label="Aiuto" onClick={() => nav('/help')} />
          <MenuItem icon={FileText} label="Documenti" onClick={() => nav('/legal')} />
          <MenuItem icon={GraduationCap} label="Impara" onClick={() => nav('/learn')} />
          <MenuItem icon={Mail} label="Posta in arrivo" onClick={() => nav('/notifications')} badge={3} last />
        </motion.div>

        {/* Menu section 2 - Collegamenti CORRETTI */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={glassCard}
        >
          <MenuItem icon={Shield} label="Sicurezza" onClick={() => nav('/security')} />
          <MenuItem icon={Eye} label="Privacy" onClick={() => nav('/privacy')} />
          <MenuItem icon={Bell} label="Impostazioni di notifica" onClick={() => nav('/notifications')} last />
        </motion.div>

        {/* Logout */}
        <motion.div variants={fadeUp}>
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform"
            style={glassCard}
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium text-[16px] text-red-400">Esci</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 🎨 Menu item - REVOLUT style
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  last?: boolean;
}> = ({ icon: Icon, label, onClick, badge, last }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-[15px] flex items-center justify-between active:bg-white/5 transition-colors ${!last ? 'border-b border-white/[0.06]' : ''}`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-[21px] h-[21px] text-white/65" />
      <span className="text-[15px] text-white">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold min-w-[22px] text-center bg-blue-500 text-white">
        {badge}
      </span>
    )}
  </button>
);

export default AgentProfileContent;
