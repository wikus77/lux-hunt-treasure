// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - REVOLUT EXACT CLONE (TESTI LEGGIBILI + GLASS)
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
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.12 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } }
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

  // 🎨 GLASS CARD STYLE - MOLTO TRASPARENTE come Revolut
  const glassCard: React.CSSProperties = {
    background: 'rgba(40, 40, 55, 0.35)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  };

  return (
    <div 
      className="h-full flex flex-col"
      style={{ 
        // 🔥 FIX: Sfondo TRASPARENTE per vedere il blur del backdrop
        background: 'transparent',
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT HEADER - Gradient purple/blue SEMI-TRASPARENTE
          ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="relative flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 18, 80, 0.85) 0%, rgba(45, 26, 110, 0.8) 50%, rgba(26, 16, 64, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          paddingBottom: '32px',
        }}
      >
        {/* Top bar: X button + Upgrade */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Close X - Revolut style */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          {/* Upgrade button */}
          {showUpgrade ? (
            <button
              onClick={() => nav('/subscriptions')}
              className="px-4 py-2 rounded-full flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="text-white text-sm font-semibold">Fai l'upgrade</span>
            </button>
          ) : <div />}
        </div>

        {/* Centered Avatar + Badge + Name */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            <ProfileAvatar
              profileImage={profileImage}
              className="w-[92px] h-[92px] border-[3px] border-white/30 shadow-xl"
            />
            {/* Tier badge */}
            <div 
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${tierStyle.bg} ${tierStyle.text}`}
            >
              {tierStyle.label}
            </div>
          </div>

          {/* 🔥 NAME - BIANCO PURO, BEN VISIBILE */}
          <h1 className="text-[28px] font-bold mt-7 tracking-tight" style={{ color: '#FFFFFF' }}>
            {displayName}
          </h1>
          
          {/* Username - grigio chiaro */}
          <p className="text-[15px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            @{username}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          🎨 REVOLUT CONTENT - Glass cards + Menu - SEMI-TRASPARENTE
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pt-5"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 24px)',
          background: 'rgba(10, 10, 18, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Quick action cards - GLASS EFFECT */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-4 rounded-2xl cursor-pointer"
            style={glassCard}
            onClick={() => nav('/subscriptions')}
          >
            <Crown className="w-7 h-7 text-amber-400 mb-2" />
            <p className="font-semibold text-[15px]" style={{ color: '#FFFFFF' }}>{tierStyle.label}</p>
            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Piano attivo</p>
          </div>
          
          <div 
            className="p-4 rounded-2xl cursor-pointer"
            style={glassCard}
            onClick={() => nav('/referral')}
          >
            <Users className="w-7 h-7 text-blue-400 mb-2" />
            <p className="font-semibold text-[15px]" style={{ color: '#FFFFFF' }}>Invita amici</p>
            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Guadagna M1U</p>
          </div>
        </motion.div>

        {/* Pulse Energy - GLASS */}
        {currentRank && (
          <motion.div 
            variants={fadeUp}
            className="p-4 rounded-2xl mb-4"
            style={glassCard}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-[15px]" style={{ color: '#FFFFFF' }}>Pulse Energy</span>
              {pulseEnergy !== undefined && (
                <span className="ml-auto font-bold text-[14px]" style={{ color: '#00D1FF' }}>
                  {pulseEnergy.toLocaleString()} PE
                </span>
              )}
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
          </motion.div>
        )}

        {/* Menu section 1 - GLASS */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={glassCard}
        >
          <MenuItem icon={HelpCircle} label="Aiuto" onClick={() => nav('/help')} />
          <MenuItem icon={User} label="Conto" onClick={() => nav('/settings')} />
          <MenuItem icon={FileText} label="Documenti" onClick={() => nav('/documents')} />
          <MenuItem icon={GraduationCap} label="Impara" onClick={() => nav('/learn')} />
          <MenuItem icon={Mail} label="Posta in arrivo" onClick={() => nav('/notifications')} badge={3} last />
        </motion.div>

        {/* Menu section 2 - GLASS */}
        <motion.div 
          variants={fadeUp}
          className="rounded-2xl overflow-hidden mb-4"
          style={glassCard}
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
            style={glassCard}
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium text-[16px]" style={{ color: '#F87171' }}>Esci</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 🎨 Menu item - TESTI BIANCHI LEGGIBILI
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  last?: boolean;
}> = ({ icon: Icon, label, onClick, badge, last }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-[16px] flex items-center justify-between ${!last ? 'border-b' : ''}`}
    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-[22px] h-[22px]" style={{ color: 'rgba(255,255,255,0.7)' }} />
      <span className="text-[16px]" style={{ color: '#FFFFFF' }}>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span 
        className="px-2.5 py-0.5 rounded-full text-[12px] font-bold min-w-[24px] text-center"
        style={{ background: '#3B82F6', color: '#FFFFFF' }}
      >
        {badge}
      </span>
    )}
  </button>
);

export default AgentProfileContent;
