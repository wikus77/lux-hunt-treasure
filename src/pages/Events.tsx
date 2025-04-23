import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";
import { FileSearch, Bell } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Events = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { unlockedClues, incrementUnlockedCluesAndAddClue, MAX_CLUES } = useBuzzClues();
  const { addNotification, notifications } = useNotifications();
  
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
  }, []);

  const generateRandomNotification = () => {
    const notifications = [
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

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    const success = addNotification(randomNotification);
    
    if (success) {
      toast.success("Notifica creata con successo!");
    } else {
      toast.error("Errore nella creazione della notifica");
    }
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

        <Button 
          onClick={generateRandomNotification} 
          className="mb-4 w-full flex items-center gap-2"
          variant="outline"
        >
          <Bell className="w-4 h-4" /> Genera Notifica Casuale ({notifications?.length || 0})
        </Button>

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
    </div>
  );
};

export default Events;
