// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Profilo Agente - Section Modal Content (Revolut-style glass design)
import React from 'react';
import { X, User, Edit2, Save, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ReferralCodeSection from '@/components/profile/ReferralCodeSection';

interface AgentProfileSectionContentProps {
  onClose: () => void;
}

const AgentProfileSectionContent: React.FC<AgentProfileSectionContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { profileData, actions } = useProfileData();

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
    }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(0, 150, 200, 0.8) 0%, rgba(0, 100, 150, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: '20px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>
              {t('agent_profile_title')}
            </h1>
          </div>

          <div style={{ width: '40px' }} />
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>
          {t('agent_profile_subtitle')}
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Profile Card */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <ProfileHeader 
            agentCode={profileData.agentCode}
            agentTitle={profileData.agentTitle}
            isEditing={profileData.isEditing}
            onEditToggle={() => actions.setIsEditing(true)}
            onSave={actions.handleSaveProfile}
          />
          
          <div style={{ marginTop: '16px' }}>
            <ProfileInfo 
              profileImage={profileData.profileImage}
              name={profileData.name}
              bio={profileData.bio}
              agentCode={profileData.agentCode}
              agentTitle={profileData.agentTitle}
              investigativeStyle={profileData.investigativeStyle}
              stats={{
                missionsCompleted: profileData.stats.missionsCompleted,
                cluesFound: profileData.stats.cluesFound
              }}
              credits={profileData.credits}
              isEditing={profileData.isEditing}
              subscriptionPlan={profileData.subscription.plan}
              personalInfo={profileData.personalInfo}
              setProfileImage={actions.setProfileImage}
              setName={actions.setName}
              setBio={actions.setBio}
              setAgentCode={actions.setAgentCode}
              setAgentTitle={actions.setAgentTitle}
            />
          </div>
        </GlassCard>

        {/* Stats */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            📊 {t('statistics')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <StatBox label={t('missions_completed')} value={profileData.stats.missionsCompleted} color="#00D1FF" />
            <StatBox label={t('clues_found')} value={profileData.stats.cluesFound} color="#22C55E" />
            <StatBox label={t('score')} value={profileData.stats.totalScore || 0} color="#F59E0B" />
            <StatBox label={t('level')} value={profileData.stats.level || 1} color="#A855F7" />
          </div>
        </GlassCard>

        {/* Tabs */}
        <GlassCard>
          <ProfileTabs 
            stats={profileData.stats}
            history={profileData.history}
            badges={profileData.badges}
            subscription={profileData.subscription}
            personalNotes={profileData.personalNotes}
            isEditing={profileData.isEditing}
            setPersonalNotes={actions.setPersonalNotes}
            togglePinBadge={actions.togglePinBadge}
            navigateToPersonalInfo={() => {}}
            navigateToPrivacySecurity={() => {}}
            navigateToPaymentMethods={() => {}}
            navigateToSubscriptions={() => {}}
            hideAccountTab
          />
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(25, 25, 35, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    ...style,
  }}>
    {children}
  </div>
);

// Stat Box
const StatBox: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: `${color}15`,
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    border: `1px solid ${color}30`,
  }}>
    <p style={{ color: color, fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{value}</p>
    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{label}</p>
  </div>
);

export default AgentProfileSectionContent;
