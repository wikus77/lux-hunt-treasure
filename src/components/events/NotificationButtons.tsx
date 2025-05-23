
import { Bell, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";

interface NotificationButtonsProps {
  openNotificationsDrawer: () => void;
  isConnected: boolean;
  isSupported: boolean;
  permission: string;
  broadcastNotification: (title: string, description: string) => Promise<boolean>;
  onShowNotificationRequest: () => void;
  onResetClues: () => void;
}

const NotificationButtons = ({
  openNotificationsDrawer,
  isConnected,
  isSupported,
  permission,
  broadcastNotification,
  onShowNotificationRequest,
  onResetClues
}: NotificationButtonsProps) => {
  const { 
    createNotification, 
    createBuzzNotification, 
    createMapBuzzNotification,
    createLeaderboardNotification,
    createWeeklyNotification
  } = useNotificationManager();
  
  const generateRandomNotification = () => {
    console.log("Generating random notification...");
    
    const notificationTemplates = [
      { 
        type: NOTIFICATION_CATEGORIES.BUZZ,
        title: "Indizio Extra", 
        description: "Hai sbloccato un nuovo dettaglio sul mistero!" 
      },
      { 
        type: NOTIFICATION_CATEGORIES.BUZZ,
        title: "Buzz Attivo", 
        description: "Un nuovo suggerimento è disponibile per te!" 
      },
      { 
        type: NOTIFICATION_CATEGORIES.GENERIC,
        title: "Aggiornamento Evento", 
        description: "Nuove informazioni sono state aggiunte all'evento corrente." 
      },
      { 
        type: NOTIFICATION_CATEGORIES.MAP_BUZZ,
        title: "Scoperta", 
        description: "Un nuovo elemento è stato rivelato nel tuo percorso investigativo." 
      },
      {
        type: NOTIFICATION_CATEGORIES.LEADERBOARD,
        title: "Aggiornamento Classifica",
        description: "La tua posizione in classifica è cambiata! Controlla ora."
      },
      {
        type: NOTIFICATION_CATEGORIES.WEEKLY,
        title: "Riepilogo Settimanale",
        description: "Ecco il riepilogo delle tue attività della settimana."
      }
    ];

    const randomNotification = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    console.log("Selected notification template:", randomNotification);
    
    try {
      let success = false;
      
      // Use the appropriate notification creator based on type
      switch (randomNotification.type) {
        case NOTIFICATION_CATEGORIES.BUZZ:
          success = createBuzzNotification(randomNotification.title, randomNotification.description);
          break;
        case NOTIFICATION_CATEGORIES.MAP_BUZZ:
          success = createMapBuzzNotification(randomNotification.title, randomNotification.description);
          break;
        case NOTIFICATION_CATEGORIES.LEADERBOARD:
          success = createLeaderboardNotification(randomNotification.title, randomNotification.description);
          break;
        case NOTIFICATION_CATEGORIES.WEEKLY:
          success = createWeeklyNotification(randomNotification.title, randomNotification.description);
          break;
        default:
          success = createNotification(randomNotification.title, randomNotification.description, randomNotification.type);
      }
      
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

  const broadcastRandomNotification = async () => {
    console.log("Broadcasting random notification...");
    
    const notificationTemplates = [
      { 
        title: "Notifica Tempo Reale", 
        description: "Questa è una notifica trasmessa in tempo reale a tutti gli utenti!" 
      },
      { 
        title: "Nuova Attività", 
        description: "Un nuovo utente si è unito alla caccia ai tesori." 
      },
      { 
        title: "Risultati Aggiornati", 
        description: "La classifica è stata aggiornata con nuovi punteggi." 
      },
      { 
        title: "Evento Speciale", 
        description: "Un evento speciale sta per iniziare tra 5 minuti!" 
      }
    ];

    const randomNotification = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    console.log("Selected broadcast notification template:", randomNotification);
    
    try {
      const success = await broadcastNotification(randomNotification.title, randomNotification.description);
      
      if (success) {
        toast.success("Notifica trasmessa in tempo reale!", {
          description: "Tutti gli utenti connessi riceveranno questa notifica.",
          duration: 3000,
        });
      } else {
        toast.error("Errore nella trasmissione della notifica", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Errore durante la trasmissione della notifica:", error);
      toast.error("Si è verificato un errore imprevisto", {
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <Button 
        onClick={generateRandomNotification} 
        className="w-full flex items-center gap-2 bg-projectx-blue hover:bg-projectx-deep-blue"
      >
        <Bell className="h-4 w-4 mr-1" />
        Genera Notifica Locale
      </Button>
      
      <Button 
        onClick={broadcastRandomNotification} 
        className="w-full flex items-center gap-2 bg-gradient-to-r from-projectx-blue to-projectx-pink"
        disabled={!isConnected}
      >
        <Radio className="h-4 w-4 mr-1" />
        Trasmetti Notifica in Tempo Reale {!isConnected && "(Connessione...)"}
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
          onClick={onShowNotificationRequest} 
          className="w-full flex items-center gap-2 bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          <Bell className="h-4 w-4 mr-1" />
          Attiva Notifiche Push
        </Button>
      )}
      
      <Button 
        onClick={onResetClues}
        variant="destructive"
        className="w-full flex items-center gap-2"
      >
        Azzera Tutti gli Indizi
      </Button>
    </div>
  );
};

export default NotificationButtons;
