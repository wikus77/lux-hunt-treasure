
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";
import { FileSearch, Bell } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";

const Events = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unlockedClues, incrementUnlockedCluesAndAddClue, MAX_CLUES } = useBuzzClues();
  const { addNotification, notifications, unreadCount, markAllAsRead, reloadNotifications } = useNotifications();
  
  useEffect(() => {
    // Get profile image on mount
    setProfileImage(localStorage.getItem('profileImage'));
    
    // Solo aggiungi indizi di test se non ne abbiamo ancora - controlla localStorage direttamente
    const currentUnlockedClues = localStorage.getItem('unlockedCluesCount');
    
    if (!currentUnlockedClues || currentUnlockedClues === '0') {
      console.log("Adding initial test clues");
      // Aggiungi solo 3 indizi di test in totale, non uno per render
      incrementUnlockedCluesAndAddClue();
      incrementUnlockedCluesAndAddClue();
      incrementUnlockedCluesAndAddClue();
    } else {
      console.log("Not adding test clues, current count:", currentUnlockedClues);
    }
    
    // Aggiorniamo le notifiche all'avvio
    reloadNotifications();
  }, [incrementUnlockedCluesAndAddClue, reloadNotifications]);

  const generateRandomNotification = () => {
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
    console.log("Generating random notification:", randomNotification);
    
    try {
      const success = addNotification(randomNotification);
      console.log("Notification creation result:", success);
      
      if (success) {
        toast.success("Notifica creata con successo!", {
          duration: 2000,
        });
        // Ricarica le notifiche per aggiornare il contatore
        reloadNotifications();
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

  const toggleNotifications = () => {
    console.log("Toggling notifications drawer, current state:", notificationsOpen);
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
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
            <Bell className="w-4 h-4" /> Genera Notifica Casuale
          </Button>
          
          <Button 
            onClick={toggleNotifications} 
            className="w-full flex items-center gap-2" 
            variant="outline"
          >
            <Bell className="w-4 h-4" /> 
            Visualizza Notifiche 
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-projectx-pink rounded-full text-white">
                {unreadCount}
              </span>
            )}
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
        open={notificationsOpen} 
        onOpenChange={setNotificationsOpen} 
      />
    </div>
  );
};

export default Events;
