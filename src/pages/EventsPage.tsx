
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import PushNotificationRequest from "@/components/notifications/PushNotificationRequest";
import EventsHeader from "@/components/events/EventsHeader";
import NotificationButtons from "@/components/events/NotificationButtons";
import CluesDisplay from "@/components/events/CluesDisplay";
import { toast } from "sonner";

const EventsPage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { unlockedClues, incrementUnlockedCluesAndAddClue, resetUnlockedClues, MAX_CLUES } = useBuzzClues();
  const { 
    notificationsDrawerOpen, 
    openNotificationsDrawer, 
    closeNotificationsDrawer, 
    createNotification 
  } = useNotificationManager();
  const { isSupported, permission } = usePushNotifications();
  const { isConnected, broadcastNotification } = useRealTimeNotifications();
  const [showNotificationRequest, setShowNotificationRequest] = useState(false);
  
  useEffect(() => {
    // Get profile image on mount
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  const handleResetClues = () => {
    resetUnlockedClues();
    toast.success("Tutti gli indizi sono stati azzerati", {
      duration: 3000,
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={openNotificationsDrawer}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        <EventsHeader unlockedClues={unlockedClues} maxClues={MAX_CLUES} />
        
        <NotificationButtons 
          openNotificationsDrawer={openNotificationsDrawer}
          isConnected={isConnected}
          isSupported={isSupported}
          permission={permission}
          createNotification={createNotification}
          broadcastNotification={broadcastNotification}
          onShowNotificationRequest={() => setShowNotificationRequest(true)}
          onResetClues={handleResetClues}
        />

        <CluesDisplay 
          onClueUnlocked={incrementUnlockedCluesAndAddClue} 
        />
      </div>
      
      <NotificationsDrawer 
        open={notificationsDrawerOpen} 
        onOpenChange={closeNotificationsDrawer} 
      />

      <PushNotificationRequest
        open={showNotificationRequest}
        onOpenChange={setShowNotificationRequest}
      />
    </div>
  );
};

export default EventsPage;
