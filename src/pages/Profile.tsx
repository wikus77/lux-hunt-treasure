
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "@/components/layout/ProfileLayout";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ReferralCodeSection from "@/components/profile/ReferralCodeSection";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const navigate = useNavigate();
  const { profileData, actions } = useProfileData();
  
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
    <ProfileLayout>
      <div className="glass-card mx-4 mt-4 mb-20">
        {/* Header with Agent Code and Edit Button */}
        <ProfileHeader 
          agentCode={profileData.agentCode}
          agentTitle={profileData.agentTitle}
          isEditing={profileData.isEditing}
          onEditToggle={() => actions.setIsEditing(true)}
          onSave={actions.handleSaveProfile}
        />
        
        {/* Profile Information */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
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
              setProfileImage={actions.setProfileImage}
              setName={actions.setName}
              setBio={actions.setBio}
              setAgentCode={actions.setAgentCode}
              setAgentTitle={actions.setAgentTitle}
            />
            
            {/* Right Column - Tabs for different sections */}
            <div className="flex-1">
              <ProfileTabs 
                stats={profileData.stats}
                history={profileData.history}
                badges={profileData.badges}
                subscription={profileData.subscription}
                personalNotes={profileData.personalNotes}
                isEditing={profileData.isEditing}
                setPersonalNotes={actions.setPersonalNotes}
                togglePinBadge={actions.togglePinBadge}
                navigateToPersonalInfo={navigateToPersonalInfo}
                navigateToPrivacySecurity={navigateToPrivacySecurity}
                navigateToPaymentMethods={navigateToPaymentMethods}
                navigateToSubscriptions={navigateToSubscriptions}
              />
            </div>
          </div>
        </div>
      </div>
      
      <NotificationsDrawer 
        open={profileData.showNotifications}
        onOpenChange={actions.setShowNotifications}
      />
    </ProfileLayout>
  );
};

export default Profile;
