
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useDynamicIsland } from "@/hooks/useDynamicIsland";
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useMissionManager } from "@/hooks/useMissionManager";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HeroSection } from "@/components/home/HeroSection";
import { MissionStatusBox } from "@/components/home/MissionStatusBox";
import { MissionConsole } from "@/components/home/MissionConsole";
import { MissionAgent } from "@/components/home/MissionAgent";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import DeveloperAccess from "@/components/auth/DeveloperAccess";
import { getMissionDeadline } from "@/utils/countdownDate";

const HomePage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();
  
  // Local storage hooks for mission data
  const [progress, setProgress] = useLocalStorage<number>("mission-progress", 62);
  const [credits, setCredits] = useLocalStorage<number>("user-credits", 1020);
  const [purchasedClues, setPurchasedClues] = useLocalStorage<any[]>("purchased-clues", []);
  const [diaryEntries, setDiaryEntries] = useLocalStorage<any[]>("diary-entries", []);
  const [prizeUnlockStatus, setPrizeUnlockStatus] = useState<"locked" | "partial" | "near" | "unlocked">("partial");

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  } = useNotificationManager();

  const { isConnected } = useRealTimeNotifications();
  useDynamicIslandSafety();

  // Calculate remaining days for mission
  const calculateRemainingDays = () => {
    const deadline = getMissionDeadline();
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Active mission data
  const [activeMission, setActiveMission] = useState({
    id: "M001",
    title: "Caccia al Tesoro Urbano",
    totalClues: 12,
    foundClues: 3,
    timeLimit: "48:00:00",
    startTime: new Date().toISOString(),
    remainingDays: calculateRemainingDays(),
    totalDays: 60
  });

  // Handle clue purchase
  const handlePurchaseClue = (clue: any) => {
    if (credits >= clue.cost) {
      setCredits(prev => prev - clue.cost);
      setPurchasedClues(prev => [...prev, clue]);
      
      addDiaryEntry({
        type: "purchase",
        content: `Hai acquistato l'indizio ${clue.code}: "${clue.title}"`,
        timestamp: new Date().toISOString()
      });
      
      setProgress(prev => Math.min(100, prev + clue.progressValue));
      toast.success("Indizio acquistato con successo!");
    } else {
      toast.error("Crediti insufficienti per acquistare questo indizio.");
    }
  };

  // Add diary entry
  const addDiaryEntry = (entry: any) => {
    setDiaryEntries(prev => [entry, ...prev]);
  };

  // Add personal note
  const addPersonalNote = (note: string) => {
    addDiaryEntry({
      type: "note",
      content: note,
      timestamp: new Date().toISOString()
    });
    toast.success("Nota aggiunta al diario");
  };

  // Check for developer access and Capacitor environment
  useEffect(() => {
    const checkAccess = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      setIsCapacitor(isCapacitorApp);
      
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      console.log('Home access check:', { isMobileDevice, isCapacitorApp });
      
      if (isMobileDevice) {
        setHasAccess(true); // Allow access for this demo
      } else if (!isMobileDevice) {
        window.location.href = '/';
        return;
      }
    };
    
    checkAccess();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const getContentPaddingClass = () => {
    return isCapacitor ? "capacitor-safe-content" : "";
  };

  const getContentPaddingStyle = () => {
    if (!isCapacitor) {
      return { 
        paddingTop: 'calc(72px + env(safe-area-inset-top) + 50px)' 
      };
    }
    return {};
  };

  if (isMobile && !hasAccess) {
    return <DeveloperAccess />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070818] px-4">
        <div className="p-8 bg-red-800/30 rounded-xl text-center w-full max-w-sm glass-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-300">Errore</h2>
          <p className="text-white/80">{error}</p>
          <motion.button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-white btn-hover-effect"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Riprova
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070818] pb-20 w-full">
      <Helmet>
        <title>M1SSION™ - Home</title>
      </Helmet>
      
      <UnifiedHeader profileImage={profileImage} />
      <div 
        className={getContentPaddingClass()}
        style={getContentPaddingStyle()}
      />

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {notificationsBannerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-x-0 z-[60] px-2 md:px-4 ${isCapacitor ? 'capacitor-safe-content' : ''}`}
                style={!isCapacitor ? { 
                  top: 'calc(72px + env(safe-area-inset-top) + 50px)'
                } : {}}
              >
                <NotificationsBanner
                  notifications={notifications}
                  open={notificationsBannerOpen}
                  unreadCount={unreadCount}
                  onClose={closeNotificationsBanner}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                />
              </motion.div>
            )}

            <div className="container mx-auto px-3">
              <motion.div
                className="text-center my-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl font-orbitron font-bold">
                  <span className="text-[#00D1FF]" style={{ 
                    textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                  }}>M1</span>
                  <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                </h1>
              </motion.div>

              <main className="max-w-screen-xl mx-auto pb-20">
                {/* Hero Section with Porsche */}
                <HeroSection progress={progress} status={prizeUnlockStatus} />

                {/* Mission Status Box */}
                <MissionStatusBox mission={activeMission} progress={progress} />

                {/* Two column layout for Console and Agent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column - Mission Console */}
                  <MissionConsole 
                    credits={credits}
                    onPurchaseClue={handlePurchaseClue} 
                  />

                  {/* Right Column - Mission Agent */}
                  <MissionAgent 
                    entries={diaryEntries}
                    onAddNote={addPersonalNote}
                    purchasedClues={purchasedClues}
                  />
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
