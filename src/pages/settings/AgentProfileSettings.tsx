// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { CircularBackButton } from "@/components/ui/CircularBackButton";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ReferralCodeSection from "@/components/profile/ReferralCodeSection";
import { useProfileData } from "@/hooks/useProfileData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import BottomNavigation from "@/components/layout/BottomNavigation";

const AgentProfileSettings = () => {
  const { navigate } = useWouterNavigation();
  const { profileData, actions } = useProfileData();
  const isMobile = useIsMobile();
  const { notificationsDrawerOpen, closeNotificationsDrawer } = useNotificationManager();
  
  // Initialize real-time notifications (this sets up the listener)
  useRealTimeNotifications();
  
  // 🔧 FIX 28/01/2026: Point to EXISTING settings pages
  const navigateToPersonalInfo = () => {
    navigate('/settings/personal-info');
  };

  const navigateToPrivacySecurity = () => {
    navigate('/settings/security'); // EXISTING SecuritySettings.tsx
  };

  const navigateToPaymentMethods = () => {
    navigate('/settings/payment-methods'); // NEW dedicated page
  };

  const navigateToSubscriptions = () => {
    navigate('/subscriptions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <UnifiedHeader />
      
      {/* 🔧 FIX 28/01/2026: Layout come Info App - pt-16 */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header with Circular Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <CircularBackButton onClick={() => navigate('/settings')} size="md" />
            <div>
              <h1 className="text-xl font-orbitron text-white">Profilo Agente</h1>
              <p className="text-white/60 text-sm">Impostazioni</p>
            </div>
          </div>
        
        <div className="glass-card mb-20">
          {/* Header with Agent Code and Edit Button */}
          <ProfileHeader 
            agentCode={profileData.agentCode}
            agentTitle={profileData.agentTitle}
            isEditing={profileData.isEditing}
            onEditToggle={() => actions.setIsEditing(true)}
            onSave={actions.handleSaveProfile}
          />
          
          {/* Profile Information */}
          <div className="p-3 sm:p-6 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4">
              👤 Informazioni Agente
            </h2>
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Left Column - Avatar and Basic Info */}
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
              
              {/* Right Column - Tabs for different sections */}
              <div className="flex-1 mt-4 md:mt-0">
                <ProfileTabs 
                  stats={profileData.stats}
                  history={profileData.history}
                  badges={profileData.badges}
                  subscription={profileData.subscription}
                  personalNotes={profileData.personalNotes}
                  isEditing={profileData.isEditing}
                  setPersonalNotes={actions.setPersonalNotes}
                  togglePinBadge={actions.togglePinBadge}
                  navigateToPersonalInfo={() => navigate('/settings/personal-info')}
                  navigateToPrivacySecurity={() => navigate('/settings/security')}
                  navigateToPaymentMethods={() => navigate('/settings/payment-methods')}
                  navigateToSubscriptions={() => navigate('/subscriptions')}
                />
              </div>
            </div>
          </div>
        </div>
        
        <NotificationsDrawer
          open={notificationsDrawerOpen}
          onOpenChange={closeNotificationsDrawer}
        />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AgentProfileSettings;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
