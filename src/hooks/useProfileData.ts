
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useProfileData = () => {
  // Profile data
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [agentTitle, setAgentTitle] = useState("Decoder");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  // Stats data
  const [stats, setStats] = useState({
    missionsCompleted: 12,
    cluesFound: 47,
    totalPlayTime: "123h 45m",
    pointsEarned: 9850,
    prizeProgress: 68,
    bestResult: "Top 5% in Mission X"
  });
  
  // Style analysis
  const [investigativeStyle, setInvestigativeStyle] = useState({
    style: "Ragionatore Strategico", 
    color: "bg-cyan-500"
  });

  // Operational history
  const [history, setHistory] = useState([
    { type: "access", date: "2025-05-03T14:30:00", details: "Login da dispositivo principale" },
    { type: "mission", date: "2025-05-02T10:15:00", details: "Completata Missione: Enigma della Strada" },
    { type: "clue", date: "2025-05-01T16:20:00", details: "Acquistato indizio CL-445: 'Tracce digitali'" },
    { type: "communication", date: "2025-04-30T08:45:00", details: "Nuova comunicazione da HQ: Aggiornamento missione" }
  ]);

  // Wallet
  const [credits, setCredits] = useState(2500);

  // Achievements
  const [badges, setBadges] = useState([
    { id: "b1", name: "Primo Contatto", description: "Hai completato la tua prima missione", unlocked: true, pinned: true },
    { id: "b2", name: "Segugio", description: "Hai trovato 10 indizi", unlocked: true, pinned: false },
    { id: "b3", name: "Viaggiatore", description: "Hai esplorato 5 location diverse", unlocked: true, pinned: false },
    { id: "b4", name: "Decifratore", description: "Hai risolto un enigma di livello difficile", unlocked: false, pinned: false }
  ]);

  // Subscription
  const [subscription, setSubscription] = useState({
    plan: "Gold",
    expiry: "2025-12-31",
    benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
  });
  
  // Personal notes
  const [personalNotes, setPersonalNotes] = useState("Indizi sulla localizzazione del premio sembrano puntare a Nord...");

  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImage(savedProfileImage);

    const savedName = localStorage.getItem('profileName');
    if (savedName) setName(savedName);

    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) setBio(savedBio);
    
    const savedAgentCode = localStorage.getItem('agentCode');
    if (savedAgentCode) setAgentCode(savedAgentCode);
  }, []);

  // Handle saving profile data
  const handleSaveProfile = () => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);
    localStorage.setItem('agentCode', agentCode);

    setIsEditing(false);
    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche al tuo dossier agente sono state salvate."
    });
  };

  const togglePinBadge = (id: string) => {
    setBadges(badges.map(badge => 
      badge.id === id 
        ? {...badge, pinned: !badge.pinned} 
        : badge.id !== id && badge.pinned 
          ? {...badge, pinned: false} 
          : badge
    ));
  };

  return {
    profileData: {
      isEditing,
      bio,
      name,
      agentCode,
      agentTitle,
      profileImage,
      showNotifications,
      stats,
      investigativeStyle,
      history,
      credits,
      badges,
      subscription,
      personalNotes
    },
    actions: {
      setIsEditing,
      setBio,
      setName,
      setAgentCode,
      setAgentTitle,
      setProfileImage,
      setShowNotifications,
      handleSaveProfile,
      togglePinBadge,
      setPersonalNotes
    }
  };
};
