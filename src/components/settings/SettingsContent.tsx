// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Settings Content - REVOLUT STYLE con sub-modali per sezioni
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Shield, Target, Bell, Lock, 
  FileText, Info, MapPin, Stethoscope, 
  ChevronRight, CreditCard, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SettingsSectionFlipOverlay } from './SettingsSectionFlipOverlay';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

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
  /** Sezione da aprire subito (es. 'legal' | 'security' | 'privacy' da quick link Profilo) */
  initialSection?: string | null;
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

export const SettingsContent: React.FC<SettingsContentProps> = ({ onClose, initialSection: initialSectionProp = null }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State per gestire sezione aperta
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sectionOriginRect, setSectionOriginRect] = useState<DOMRect | null>(null);

  // Apri subito la sezione richiesta (es. da Profilo → Legal/Security/Privacy)
  useEffect(() => {
    if (initialSectionProp) {
      setOpenSection(initialSectionProp);
    }
  }, [initialSectionProp]);

  const handleConfirmDeleteAccount = async () => {
    if (!user) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.access_token) {
      toast({ title: t('danger_zone'), description: 'Session expired. Please log in again.', variant: 'destructive' });
      return;
    }
    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.success !== true) throw new Error(data?.error || 'Deletion failed');
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deletion failed. Please try again or contact support.';
      toast({ title: t('danger_zone'), description: message, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
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
        {/* HEADER — stessa animazione della card "Le tue notifiche" (NotificationsPage): graphite glass + motion slide-up + gradient line */}
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
              paddingBottom: '20px',
              paddingLeft: '16px',
              paddingRight: '16px',
              borderRadius: '16px 16px 0 0',
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90 rounded-t-2xl" />
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

          {/* Danger Zone — Delete Account (in-app self-service, Apple 5.1.1 compliant) */}
          <GlassCard style={{ marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Trash2 style={{ width: '20px', height: '20px', color: '#EF4444' }} />
              <span style={{ color: '#EF4444', fontSize: '16px', fontWeight: 600 }}>{t('danger_zone')}</span>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
              {t('delete_account_desc_in_app')}
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={deleteLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleteLoading ? t('deleting') : t('delete_account_permanently')}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-red-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">{t('delete_account_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/80">
                    {t('delete_account_confirm_message')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 text-white border-white/20">{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {t('delete_account_permanently')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
