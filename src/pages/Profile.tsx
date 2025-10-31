
import { useState, useEffect } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import ProfileLayout from "@/components/layout/ProfileLayout";
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
import { usePulseEnergy } from "@/hooks/usePulseEnergy";
import RankUpModal from "@/components/pulse/RankUpModal";
import type { AgentRank } from "@/hooks/usePulseEnergy";

const Profile = () => {
  const { navigate } = useWouterNavigation();
  const { profileData, actions } = useProfileData();
  const isMobile = useIsMobile();
  const { notificationsDrawerOpen, closeNotificationsDrawer } = useNotificationManager();
  const { currentRank } = usePulseEnergy();
  
  // RankUpModal state
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRank, setNewRank] = useState<AgentRank | null>(null);
  
  // Initialize real-time notifications (this sets up the listener)
  useRealTimeNotifications();
  
  // Detect rank changes and show RankUpModal once
  useEffect(() => {
    if (!currentRank) return;
    
    const lastRankCode = localStorage.getItem('__m1_last_rank_code');
    
    if (currentRank.code !== lastRankCode) {
      setNewRank(currentRank);
      setShowRankUp(true);
      localStorage.setItem('__m1_last_rank_code', currentRank.code);
      console.log('[Profile] Rank-up detected:', { old: lastRankCode, new: currentRank.code });
    }
  }, [currentRank]);
  
  const navigateToPersonalInfo = () => {
    navigate('/profile/personal-info');
  };

  const navigateToPrivacySecurity = () => {
    navigate('/profile/security');
  };

  const navigateToPaymentMethods = () => {
    navigate('/profile/payments');
  };

  const navigateToSubscriptions = () => {
    navigate('/subscriptions');
  };

  return (
    <div className="min-h-screen bg-black">
      <ProfileLayout>
        <div className="glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 mb-20">
          {/* Header with Agent Code and Edit Button */}
          <ProfileHeader 
            agentCode={profileData.agentCode}
            agentTitle={profileData.agentTitle}
            isEditing={profileData.isEditing}
            onEditToggle={() => actions.setIsEditing(true)}
            onSave={actions.handleSaveProfile}
          />
          
          {/* Profile Information - MANTENUTO INTATTO */}
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
                  navigateToPersonalInfo={() => navigate('/profile/personal-info')}
                  navigateToPrivacySecurity={() => navigate('/profile/security')}
                  navigateToPaymentMethods={() => navigate('/profile/payments')}
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
        
        {/* RankUpModal - Notifica promozione grado */}
        {showRankUp && newRank && (
          <RankUpModal
            open={showRankUp}
            onClose={() => setShowRankUp(false)}
            newRank={newRank}
          />
        )}
      </ProfileLayout>
      
      {/* Bottom Navigation - Uniform positioning like Home */}
      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Profile;
