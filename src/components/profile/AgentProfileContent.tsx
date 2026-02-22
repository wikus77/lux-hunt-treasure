// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Agent Profile Content - REVOLUT STYLE (iOS WKWebView OPTIMIZED)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Crown, X, HelpCircle, FileText, GraduationCap, Mail, Shield, Eye, Bell, Zap, Users, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useToast } from '@/hooks/use-toast';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';
import { HelpModal } from '@/components/help/HelpModal';
import { LearnModal } from '@/components/learn/LearnModal';
import { InviteFriendsModal } from '@/components/invite/InviteFriendsModal';
import { useOpenSettingsSection } from '@/contexts/OpenSettingsSectionContext';

interface AgentProfileContentProps {
  profileImage?: string | null;
  onClose: () => void;
}

export const AgentProfileContent: React.FC<AgentProfileContentProps> = ({
  profileImage,
  onClose
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  const { toast } = useToast();
  const { currentRank, pulseEnergy } = usePulseEnergy();
  const { subscription } = useProfileSubscription();
  const { profileData } = useProfileRealtime();
  const openSettings = useOpenSettingsSection();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const openSettingsSection = (sectionId: 'legal' | 'security' | 'privacy') => {
    if (openSettings) {
      onClose();
      openSettings.openSettingsWithSection(sectionId);
    } else {
      goTo(`/settings/${sectionId}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "✅ " + t('logout'), description: t('logged_out') });
      onClose();
      // 🔐 FIX: Use /login (correct route) instead of /auth (404)
      navigate('/login');
    } catch {
      toast({ title: "❌ " + t('error'), variant: "destructive" });
    }
  };

  const goTo = (path: string) => { 
    onClose(); 
    setTimeout(() => navigate(path), 50);
  };

  // User info - Priorità: DB profiles → auth metadata → fallback
  // 🔧 FIX: Read from profiles table first (real data), then auth metadata, then fallback
  const displayName = 
    profileData?.full_name ||  // 1. DB profiles (real user data)
    user?.user_metadata?.full_name ||  // 2. Auth metadata
    `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||  // 3. First + Last
    user?.email?.split('@')[0] ||  // 4. Email prefix
    'Agente';  // 5. Final fallback
  
  const username = 
    profileData?.agent_code ||  // 1. Agent code from DB
    user?.user_metadata?.username ||  // 2. Auth metadata username
    user?.email?.split('@')[0] ||  // 3. Email prefix
    'agent';  // 4. Final fallback

  // Tier
  const tier = subscription?.plan || user?.user_metadata?.subscription_tier || 'Base';
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();

  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // REVOLUT: TRASPARENTE - il blur viene dal backdrop overlay
        background: 'transparent',
      }}
    >
      {/* HEADER - REVOLUT STYLE: semi-trasparente glass */}
      <div 
        style={{
          flexShrink: 0,
          // Gradiente MOLTO più trasparente come Revolut
          background: 'linear-gradient(180deg, rgba(60, 35, 130, 0.75) 0%, rgba(30, 20, 60, 0.5) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '28px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {/* X button */}
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

          {/* Upgrade */}
          {tier.toLowerCase() === 'base' && (
            <button
              onClick={() => goTo('/subscriptions')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px', color: '#c4b5fd' }} />
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Fai l'upgrade</span>
            </button>
          )}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <ProfileAvatar
              profileImage={profileImage}
              className="w-[88px] h-[88px]"
              style={{ border: '3px solid rgba(255,255,255,0.25)' }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 14px',
                borderRadius: '20px',
                background: '#3b82f6',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {tierLabel}
            </div>
          </div>

          <h1 style={{ 
            color: '#FFFFFF', 
            fontSize: '26px', 
            fontWeight: 700, 
            marginTop: '24px',
            textAlign: 'center',
          }}>
            {displayName}
          </h1>
          
          <p style={{ 
            color: 'rgba(255,255,255,0.55)', 
            fontSize: '14px', 
            marginTop: '4px' 
          }}>
            @{username}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Quick action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <GlassCard onClick={() => goTo('/subscriptions')}>
            <Crown style={{ width: '28px', height: '28px', color: '#fbbf24', marginBottom: '8px' }} />
            <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>{tierLabel}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>Piano attivo</p>
          </GlassCard>
          
          <GlassCard onClick={() => setShowInviteModal(true)}>
            <Users style={{ width: '28px', height: '28px', color: '#60a5fa', marginBottom: '8px' }} />
            <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>{t('invite_friends')}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>{t('earn_m1u')}</p>
          </GlassCard>
        </div>

        {/* Pulse Energy */}
        {currentRank && (
          <GlassCard style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#22d3ee' }} />
              <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>{t('pulse_energy')}</span>
              {pulseEnergy !== undefined && (
                <span style={{ marginLeft: 'auto', color: '#22d3ee', fontSize: '14px', fontWeight: 700 }}>
                  {pulseEnergy.toLocaleString()} PE
                </span>
              )}
            </div>
            <PulseEnergyBadge rank={currentRank} showCode={true} />
          </GlassCard>
        )}

        {/* Menu 1 */}
        <GlassCard style={{ marginBottom: '16px', padding: 0 }}>
          <MenuItem icon={HelpCircle} label={t('help')} onClick={() => setShowHelpModal(true)} />
          <MenuItem icon={FileText} label={t('legal_documents')} onClick={() => openSettingsSection('legal')} />
          <MenuItem icon={GraduationCap} label={t('learn')} onClick={() => setShowLearnModal(true)} />
          <MenuItem icon={Mail} label={t('inbox')} onClick={() => goTo('/notifications')} badge={3} last />
        </GlassCard>

        {/* Menu 2 */}
        <GlassCard style={{ marginBottom: '16px', padding: 0 }}>
          <MenuItem icon={Shield} label={t('security')} onClick={() => openSettingsSection('security')} />
          <MenuItem icon={Eye} label={t('privacy')} onClick={() => openSettingsSection('privacy')} />
          <MenuItem icon={Bell} label={t('notifications')} onClick={() => goTo('/settings/notifications')} last />
        </GlassCard>

        {/* Logout */}
        <GlassCard onClick={handleLogout}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut style={{ width: '20px', height: '20px', color: '#f87171' }} />
            <span style={{ color: '#f87171', fontSize: '16px', fontWeight: 500 }}>{t('logout')}</span>
          </div>
        </GlassCard>
      </div>

      {/* Help Modal - Fullscreen identico a M1U Shop */}
      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />

      {/* Learn Modal - Fullscreen identico a M1U Shop */}
      <LearnModal 
        isOpen={showLearnModal} 
        onClose={() => setShowLearnModal(false)} 
      />

      {/* Invite Friends Modal - Fullscreen identico a M1U Shop */}
      <InviteFriendsModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
    </div>
  );
};

// GLASS CARD - REVOLUT STYLE: vetro fumé semi-trasparente
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      // REVOLUT: vetro fumé scuro semi-trasparente
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      // Bordo sottile visibile
      border: '1px solid rgba(255, 255, 255, 0.08)',
      // Ombra morbida
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

// MENU ITEM
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  last?: boolean;
}> = ({ icon: Icon, label, onClick, badge, last }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '15px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'transparent',
      border: 'none',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Icon style={{ width: '21px', height: '21px', color: 'rgba(255,255,255,0.7)' }} />
      <span style={{ color: '#FFFFFF', fontSize: '15px' }}>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span style={{
        padding: '2px 10px',
        borderRadius: '12px',
        background: '#3b82f6',
        color: '#FFFFFF',
        fontSize: '11px',
        fontWeight: 700,
      }}>
        {badge}
      </span>
    )}
  </button>
);

export default AgentProfileContent;
