
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";
import { FileSearch, Bell } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushNotificationRequest from "@/components/notifications/PushNotificationRequest";

const Events = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { unlockedClues, incrementUnlockedCluesAndAddClue, resetUnlockedClues, MAX_CLUES } = useBuzzClues();
  const { 
    notificationsDrawerOpen, 
    openNotificationsDrawer, 
    closeNotificationsDrawer, 
    createNotification 
  } = useNotificationManager();
  const { isSupported, permission } = usePushNotifications();
  const [showNotificationRequest, setShowNotificationRequest] = useState(false);
  
  useEffect(() => {
    // Get profile image on mount
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  const generateRandomNotification = () => {
    console.log("Generating random notification...");
    
    const notificationTemplates = [
      { 
        title: "Indizio Extra", 
        description: "Hai sbloccato un nuovo dettaglio sul mistero!" 
      },
      { 
        title: "Buzz Attivo", 
        description: "Un nuovo suggerimento è disponibile per te!" 
      },
      { 
        title: "Aggiornamento Evento", 
        description: "Nuove informazioni sono state aggiunte all'evento corrente." 
      },
      { 
        title: "Scoperta", 
        description: "Un nuovo elemento è stato rivelato nel tuo percorso investigativo." 
      }
    ];

    const randomNotification = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    console.log("Selected notification template:", randomNotification);
    
    try {
      const success = createNotification(randomNotification.title, randomNotification.description);
      console.log("Notification creation result:", success);
      
      if (success) {
        toast.success("Notifica creata con successo!", {
          duration: 2000,
        });
      } else {
        toast.error("Errore nella creazione della notifica", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Errore durante la creazione della notifica:", error);
      toast.error("Si è verificato un errore imprevisto", {
        duration: 2000,
      });
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-projectx-blue" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
              I miei indizi
            </h1>
          </div>
          <div className="text-sm px-3 py-1 rounded-full bg-projectx-deep-blue/50 backdrop-blur-sm border border-projectx-blue/20">
            <span className="text-projectx-blue font-mono">
              {unlockedClues} / {MAX_CLUES} 
            </span>
            <span className="text-gray-400 ml-1">sbloccati</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <Button 
            onClick={generateRandomNotification} 
            className="w-full flex items-center gap-2 bg-projectx-blue hover:bg-projectx-deep-blue"
          >
            Genera Notifica Casuale
          </Button>
          
          <Button 
            onClick={openNotificationsDrawer} 
            className="w-full flex items-center gap-2" 
            variant="outline"
          >
            Visualizza Notifiche 
          </Button>
          
          {isSupported && permission !== 'granted' && (
            <Button 
              onClick={() => setShowNotificationRequest(true)} 
              className="w-full flex items-center gap-2 bg-gradient-to-r from-projectx-blue to-projectx-pink"
            >
              <Bell className="h-4 w-4 mr-1" />
              Attiva Notifiche Push
            </Button>
          )}
          
          <Button 
            onClick={handleResetClues}
            variant="destructive"
            className="w-full flex items-center gap-2"
          >
            Azzera Tutti gli Indizi
          </Button>
        </div>

        <div className="glass-card p-4 backdrop-blur-md border border-projectx-blue/10 rounded-xl">
          <ProfileClues 
            unlockedClues={clues.map(clue => ({
              id: clue.id.toString(),
              title: clue.title,
              description: clue.description,
              week: clue.week,
              isLocked: clue.isLocked,
              subscriptionType: clue.subscriptionType
            }))}
            onClueUnlocked={incrementUnlockedCluesAndAddClue}
          />
        </div>
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

export default Events;
