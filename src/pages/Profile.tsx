
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { DailyCheckInButton } from "@/components/gamification/DailyCheckInButton";
import { WeeklyLeaderboard } from "@/components/gamification/WeeklyLeaderboard";
import { BadgeUnlockedNotification } from "@/components/gamification/BadgeUnlockedNotification";
import { XpLevelProgress } from "@/components/gamification/XpLevelProgress";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { AchievementTimeline } from "@/components/gamification/AchievementTimeline";
import { RankHighlight } from "@/components/gamification/RankHighlight";
import { useXpSystem } from "@/hooks/useXpSystem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Profile = () => {
  const navigate = useNavigate();
  const { profileData, actions } = useProfileData();
  const isMobile = useIsMobile();
  const { notificationsDrawerOpen, closeNotificationsDrawer } = useNotificationManager();
  const { newBadge, closeBadgeNotification, xpStatus } = useXpSystem();
  
  // Initialize real-time notifications (this sets up the listener)
  useRealTimeNotifications();
  
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
          
          {/* Gamification Dashboard - Moved to top for visibility */}
          <div className="p-3 sm:p-6 space-y-4">
            {/* Dashboard Title */}
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4">
              📊 Dashboard Progressi
            </h2>

            {/* Gamification Grid - Responsive 2 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* XP Level Progress */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold gradient-text">
                    ⭐ Livello & XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <XpLevelProgress totalXp={xpStatus.total_xp} />
                </CardContent>
              </Card>

              {/* Rank Highlight */}
              <RankHighlight />

              {/* Daily Check-In */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold gradient-text">
                    🎯 Check-In Giornaliero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyCheckInButton />
                </CardContent>
              </Card>
            </div>

            {/* Full width sections */}
            <div className="space-y-4">
              {/* Badge Gallery */}
              <BadgeGallery />

              {/* Achievement Timeline */}
              <AchievementTimeline />

              {/* Weekly Leaderboard */}
              <WeeklyLeaderboard />
            </div>
          </div>

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
        
        {/* Badge Unlock Notification */}
        {newBadge && (
          <BadgeUnlockedNotification
            badgeName={newBadge.name}
            badgeDescription={newBadge.description}
            onClose={closeBadgeNotification}
          />
        )}
        
        <NotificationsDrawer 
          open={notificationsDrawerOpen}
          onOpenChange={closeNotificationsDrawer}
        />
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
