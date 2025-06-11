
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

const Profile = () => {
  const navigate = useNavigate();
  const { profileData, actions } = useProfileData();
  const isMobile = useIsMobile();
  const { notificationsDrawerOpen, closeNotificationsDrawer } = useNotificationManager();
  
  // Initialize real-time notifications (this sets up the listener)
  useRealTimeNotifications();
  
  const navigateToPersonalInfo = () => {
    navigate('/personal-info');
  };

  const navigateToPrivacySecurity = () => {
    navigate('/privacy-security');
  };

  const navigateToPaymentMethods = () => {
    navigate('/payment-methods');
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
          
          {/* Profile Information */}
          <div className="p-3 sm:p-6">
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
                  navigateToPersonalInfo={() => navigate('/personal-info')}
                  navigateToPrivacySecurity={() => navigate('/privacy-security')}
                  navigateToPaymentMethods={() => navigate('/payment-methods')}
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
      </ProfileLayout>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
