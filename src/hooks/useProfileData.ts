
import { useProfileBasicInfo } from "./profile/useProfileBasicInfo";
import { useProfileStats } from "./profile/useProfileStats";
import { useProfileHistory } from "./profile/useProfileHistory";
import { useProfileBadges } from "./profile/useProfileBadges";
import { useProfilePersonalInfo } from "./profile/useProfilePersonalInfo";
import { useProfileSubscription } from "./profile/useProfileSubscription";
import { useProfileNotes } from "./profile/useProfileNotes";
import { useProfileNotifications } from "./profile/useProfileNotifications";

export const useProfileData = () => {
  const basicInfo = useProfileBasicInfo();
  const statsData = useProfileStats();
  const historyData = useProfileHistory();
  const badgesData = useProfileBadges();
  const personalInfoData = useProfilePersonalInfo();
  const subscriptionData = useProfileSubscription();
  const notesData = useProfileNotes();
  const notificationsData = useProfileNotifications();

  return {
    profileData: {
      isEditing: basicInfo.isEditing,
      bio: basicInfo.bio,
      name: basicInfo.name,
      agentCode: basicInfo.agentCode,
      agentTitle: basicInfo.agentTitle,
      profileImage: basicInfo.profileImage,
      showNotifications: notificationsData.showNotifications,
      stats: statsData.stats,
      investigativeStyle: statsData.investigativeStyle,
      history: historyData.history,
      credits: subscriptionData.credits,
      badges: badgesData.badges,
      subscription: subscriptionData.subscription,
      personalNotes: notesData.personalNotes,
      personalInfo: personalInfoData.personalInfo
    },
    actions: {
      setIsEditing: basicInfo.setIsEditing,
      setBio: basicInfo.setBio,
      setName: basicInfo.setName,
      setAgentCode: basicInfo.setAgentCode,
      setAgentTitle: basicInfo.setAgentTitle,
      setProfileImage: basicInfo.setProfileImage,
      setShowNotifications: notificationsData.setShowNotifications,
      handleSaveProfile: basicInfo.handleSaveBasicInfo,
      togglePinBadge: badgesData.togglePinBadge,
      setPersonalNotes: notesData.setPersonalNotes
    }
  };
};
