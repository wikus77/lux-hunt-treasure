
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useState, useEffect, useCallback } from "react";
import ProfileClues from "@/components/profile/ProfileClues";
import { clues } from "@/data/cluesData";
import { FileSearch, Bell, Trophy } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import AchievementsDashboard from "@/components/achievements/AchievementsDashboard";
import { useAchievements } from "@/hooks/useAchievements";
import ProgressBar from "@/components/achievements/ProgressBar";
import { useNavigate } from "react-router-dom";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import AchievementPopup from "@/components/achievements/AchievementPopup";

const Events = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unlockedClues, incrementUnlockedCluesAndAddClue, resetUnlockedClues, MAX_CLUES, lastVagueClue } = useBuzzClues();
  const { notifications, unreadCount, markAllAsRead, reloadNotifications, addNotification } = useNotifications();
  const [showUnlockEffect, setShowUnlockEffect] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  
  const navigate = useNavigate();
  
  const { 
    achievements, 
    checkCategoryAchievements, 
    checkCompletionAchievements
  } = useAchievements();
  
  useEffect(() => {
    // Get profile image on mount
    setProfileImage(localStorage.getItem('profileImage'));
    
    // Update notifications on mount
    reloadNotifications();
    
    // Check completion achievements based on current progress
    const progressPercentage = Math.round((unlockedClues / MAX_CLUES) * 100);
    checkCompletionAchievements(progressPercentage);
    
  }, [reloadNotifications, unlockedClues, MAX_CLUES, checkCompletionAchievements]);

  const generateRandomNotification = useCallback(() => {
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
      const success = addNotification(randomNotification);
      console.log("Notification creation result:", success);
      
      if (success) {
        toast.success("Notifica creata con successo!", {
          duration: 2000,
        });
        // Reload notifications to update the counter
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
  }, [addNotification, reloadNotifications]);

  const handleShowNotifications = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  const handleResetClues = useCallback(() => {
    resetUnlockedClues();
    toast.success("Tutti gli indizi sono stati azzerati", {
      duration: 3000,
    });
  }, [resetUnlockedClues]);

  const handleUnlockClue = useCallback(() => {
    setShowUnlockEffect(true);
    
    // Check for category achievements after a delay
    if (lastVagueClue) {
      setTimeout(() => {
        // Analyze clue text to determine category
        const clueText = lastVagueClue;
        // Auto-check achievements for all categories
        checkCategoryAchievements("Luoghi", 1);
        
        // Find any newly unlocked achievements
        const newlyUnlocked = achievements.find(a => 
          a.isUnlocked && 
          (!a.unlockedAt || new Date(a.unlockedAt).getTime() > Date.now() - 5000)
        );
        
        if (newlyUnlocked) {
          setNewAchievement(newlyUnlocked);
          setShowAchievementPopup(true);
        }
      }, 1000);
    }
    
    // Update completion achievements
    const progressPercentage = Math.round(((unlockedClues + 1) / MAX_CLUES) * 100);
    checkCompletionAchievements(progressPercentage);
    
    incrementUnlockedCluesAndAddClue();
  }, [incrementUnlockedCluesAndAddClue, lastVagueClue, achievements, checkCategoryAchievements, checkCompletionAchievements, unlockedClues, MAX_CLUES]);

  const handleExplosionComplete = useCallback(() => {
    setShowUnlockEffect(false);
  }, []);

  const handleViewAllAchievements = useCallback(() => {
    navigate("/achievements");
  }, [navigate]);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleShowNotifications}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar Section */}
        <div className="glass-card p-4 mb-6 backdrop-blur-md border border-projectx-blue/10 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-projectx-gold" />
              <h2 className="text-lg font-bold text-white">Progresso Missione</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewAllAchievements}
              className="text-xs h-8"
            >
              Tutti i Traguardi
            </Button>
          </div>
          
          <ProgressBar 
            value={unlockedClues} 
            max={MAX_CLUES} 
            size="md" 
            colorClass="bg-gradient-to-r from-projectx-blue via-projectx-pink to-projectx-blue"
          />
          
          <AchievementsDashboard compact className="mt-6" />
        </div>
        
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
            onClick={handleUnlockClue} 
            className="w-full flex items-center gap-2 bg-gradient-to-r from-projectx-blue to-projectx-pink hover:from-projectx-pink hover:to-projectx-blue transition-all duration-500"
          >
            <Bell className="w-4 h-4" /> Sblocca Nuovo Indizio con Effetto
          </Button>
          
          <Button 
            onClick={generateRandomNotification} 
            className="w-full flex items-center gap-2 bg-projectx-blue hover:bg-projectx-deep-blue"
          >
            <Bell className="w-4 h-4" /> Genera Notifica Casuale
          </Button>
          
          <Button 
            onClick={handleShowNotifications} 
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
          
          <Button 
            onClick={handleResetClues}
            variant="destructive"
            className="w-full flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> Azzera Tutti gli Indizi
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
      
      {/* Visual Effects */}
      <ClueUnlockedExplosion 
        open={showUnlockEffect}
        fadeOut={showUnlockEffect} 
        onFadeOutEnd={handleExplosionComplete} 
      />
      
      {/* Achievement Popup */}
      {showAchievementPopup && newAchievement && (
        <AchievementPopup 
          achievement={newAchievement}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}
    </div>
  );
};

export default Events;
