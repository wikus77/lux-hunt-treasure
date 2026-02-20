// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Settings Content - REVOLUT STYLE con sub-modali per sezioni
import React, { useState, useRef, lazy, Suspense } from 'react';
import { 
  X, User, Shield, Target, Bell, Lock, 
  FileText, Info, ChevronRight, CreditCard, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SettingsSectionFlipOverlay } from './SettingsSectionFlipOverlay';

// Lazy load section contents
const AgentProfileSectionContent = lazy(() => import('./sections/AgentProfileSectionContent'));
const SecuritySectionContent = lazy(() => import('./sections/SecuritySectionContent'));
const MissionSectionContent = lazy(() => import('./sections/MissionSectionContent'));
const NotificationsSectionContent = lazy(() => import('./sections/NotificationsSectionContent'));
const PrivacySectionContent = lazy(() => import('./sections/PrivacySectionContent'));
const PaymentMethodsSectionContent = lazy(() => import('./sections/PaymentMethodsSectionContent'));
const LegalSectionContent = lazy(() => import('./sections/LegalSectionContent'));
const AppInfoSectionContent = lazy(() => import('./sections/AppInfoSectionContent'));

interface SettingsContentProps {
  onClose: () => void;
}

// Section loading fallback
const SectionLoadingFallback = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(0, 209, 255, 0.3)',
      borderTopColor: '#00D1FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
);

export const SettingsContent: React.FC<SettingsContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  
  // State per gestire sezione aperta
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sectionOriginRect, setSectionOriginRect] = useState<DOMRect | null>(null);

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      t('delete_account_confirm') || 'Sei sicuro? Questa azione è irreversibile. Tutti i dati verranno eliminati.'
    );
    if (!confirmed) return;
    setDeleteAccountLoading(true);
    try {
      await supabase.from('user_clues').delete().eq('user_id', user.id);
      await supabase.from('user_buzz_counter').delete().eq('user_id', user.id);
      await supabase.from('user_notifications').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      localStorage.clear();
      toast({ title: '✅ ' + (t('account_deleted') || 'Account eliminato') });
      window.location.href = '/login';
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({ title: '❌ ' + (t('error') || 'Errore'), description: msg, variant: 'destructive' });
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  // Apri sezione come sub-modal
  const openSectionModal = (sectionId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSectionOriginRect(rect);
    setOpenSection(sectionId);
  };

  // Chiudi sezione
  const closeSectionModal = () => {
    setOpenSection(null);
    setSectionOriginRect(null);
  };

  const sections = [
    {
      id: 'agent-profile',
      label: t('section_agent_profile'),
      description: t('section_agent_profile_desc'),
      icon: User,
      color: '#00D1FF',
    },
    {
      id: 'security',
      label: t('section_security'),
      description: t('section_security_desc'),
      icon: Shield,
      color: '#22C55E',
    },
    {
      id: 'mission',
      label: t('section_mission'),
      description: t('section_mission_desc'),
      icon: Target,
      color: '#F59E0B',
    },
    {
      id: 'notifications',
      label: t('section_notifications'),
      description: t('section_notifications_desc'),
      icon: Bell,
      color: '#EF4444',
    },
    {
      id: 'privacy',
      label: t('section_privacy'),
      description: t('section_privacy_desc'),
      icon: Lock,
      color: '#A855F7',
    },
    {
      id: 'payment-methods',
      label: t('section_payment_methods'),
      description: t('section_payment_methods_desc'),
      icon: CreditCard,
      color: '#14B8A6',
    },
    {
      id: 'legal',
      label: t('section_legal'),
      description: t('section_legal_desc'),
      icon: FileText,
      color: '#EC4899',
    },
    {
      id: 'app-info',
      label: t('section_app_info'),
      description: t('section_app_info_desc'),
      icon: Info,
      color: '#6366F1',
    },
  ];

  // Render sezione content
  const renderSectionContent = () => {
    switch (openSection) {
      case 'agent-profile':
        return <AgentProfileSectionContent onClose={closeSectionModal} />;
      case 'security':
        return <SecuritySectionContent onClose={closeSectionModal} />;
      case 'mission':
        return <MissionSectionContent onClose={closeSectionModal} />;
      case 'notifications':
        return <NotificationsSectionContent onClose={closeSectionModal} />;
      case 'privacy':
        return <PrivacySectionContent onClose={closeSectionModal} />;
      case 'payment-methods':
        return <PaymentMethodsSectionContent onClose={closeSectionModal} />;
      case 'legal':
        return <LegalSectionContent onClose={closeSectionModal} />;
      case 'app-info':
        return <AppInfoSectionContent onClose={closeSectionModal} />;
      default:
        return null;
    }
  };

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
        {/* HEADER - REVOLUT STYLE */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 80, 120, 0.8) 0%, rgba(0, 50, 80, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: '18px', 
                fontWeight: 700,
                letterSpacing: '1px',
              }}>
                {t('settings_modal_title')}
              </h1>
            </div>

            <div style={{ width: '40px' }} />
          </div>

          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '13px', 
            textAlign: 'center',
          }}>
            {t('settings_modal_subtitle')}
          </p>
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
          {/* Settings Sections */}
          <GlassCard style={{ marginBottom: '16px', padding: 0 }}>
            {sections.map((section, index) => (
              <SettingsMenuItem
                key={section.id}
                icon={section.icon}
                label={section.label}
                description={section.description}
                color={section.color}
                onClick={(e) => openSectionModal(section.id, e)}
                last={index === sections.length - 1}
              />
            ))}
          </GlassCard>

          {/* Elimina Account Permanentemente — visibile nel root Impostazioni (Apple compliance) */}
          <GlassCard style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Trash2 style={{ width: '18px', height: '18px', color: '#ef4444' }} />
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>{t('delete_account') || 'Elimina Account Permanentemente'}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
              {t('delete_account_description') || 'Questa azione è irreversibile. Tutti i dati verranno eliminati.'}
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: 600,
                cursor: deleteAccountLoading ? 'not-allowed' : 'pointer',
                opacity: deleteAccountLoading ? 0.7 : 1,
              }}
            >
              {deleteAccountLoading ? (t('deleting') || 'Eliminazione...') : (t('delete_account') || 'Elimina Account Permanentemente')}
            </button>
          </GlassCard>
        </div>
      </div>

      {/* SUB-MODAL per sezioni */}
      <SettingsSectionFlipOverlay
        open={openSection !== null}
        originRect={sectionOriginRect}
        onClose={closeSectionModal}
      >
        <Suspense fallback={<SectionLoadingFallback />}>
          {renderSectionContent()}
        </Suspense>
      </SettingsSectionFlipOverlay>
    </>
  );
};

// GLASS CARD - REVOLUT STYLE
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
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

// SETTINGS MENU ITEM
const SettingsMenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  onClick: (e: React.MouseEvent) => void;
  last?: boolean;
}> = ({ icon: Icon, label, description, color, onClick, last }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '14px 16px',
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
      <div 
        style={{
          padding: '10px',
          borderRadius: '12px',
          background: `${color}20`,
          boxShadow: `0 0 10px ${color}30`,
        }}
      >
        <Icon style={{ width: '20px', height: '20px', color: color }} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{label}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{description}</p>
      </div>
    </div>
    <ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
  </button>
);

export default SettingsContent;
