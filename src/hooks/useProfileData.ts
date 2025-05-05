import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Style analysis from quiz
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
    const loadProfileData = async () => {
      // Load profile image
      const savedProfileImage = localStorage.getItem('profileImage');
      if (savedProfileImage) setProfileImage(savedProfileImage);

      // Load name
      const savedName = localStorage.getItem('profileName');
      if (savedName) setName(savedName);

      // Load bio
      const savedBio = localStorage.getItem('profileBio');
      if (savedBio) setBio(savedBio);
      
      // Load agent code
      const savedAgentCode = localStorage.getItem('agentCode');
      if (savedAgentCode) setAgentCode(savedAgentCode);
      
      // Load investigative style from quiz results
      const styleName = localStorage.getItem('investigativeStyle');
      const styleColor = localStorage.getItem('investigativeStyleColor');
      
      if (styleName && styleColor) {
        setInvestigativeStyle({
          style: styleName,
          color: styleColor
        });
      } else {
        // If no stored quiz results, check what profile type they have
        const profileType = localStorage.getItem('userProfileType');
        
        if (profileType) {
          // Set investigative style based on profile type
          switch(profileType) {
            case 'comandante':
              setInvestigativeStyle({
                style: "Ragionatore Strategico",
                color: "bg-cyan-500"
              });
              break;
            case 'assaltatore':
              setInvestigativeStyle({
                style: "Forza d'Impatto",
                color: "bg-red-500"
              });
              break;
            case 'nexus':
              setInvestigativeStyle({
                style: "Tessitore di Reti",
                color: "bg-purple-500"
              });
              break;
            default:
              // Keep default
          }
        }
      }
      
      // Try to load data from Supabase if authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Update local state with profile data from database
            if (data.full_name) setName(data.full_name);
            if (data.bio) setBio(data.bio);
            if (data.agent_code) setAgentCode(data.agent_code);
            if (data.agent_title) setAgentTitle(data.agent_title);
            if (data.credits !== undefined) setCredits(data.credits);
            
            // Update investigative style if available
            if (data.investigative_style) {
              const styleMap: Record<string, { style: string, color: string }> = {
                'comandante': { style: "Ragionatore Strategico", color: "bg-cyan-500" },
                'assaltatore': { style: "Forza d'Impatto", color: "bg-red-500" },
                'nexus': { style: "Tessitore di Reti", color: "bg-purple-500" }
              };
              
              setInvestigativeStyle(styleMap[data.investigative_style] || investigativeStyle);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile data from Supabase:", error);
        // Continue with local data
      }
    };
    
    loadProfileData();
  }, []);

  // Handle saving profile data
  const handleSaveProfile = async () => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);
    localStorage.setItem('agentCode', agentCode);

    // Try to save to Supabase if authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: name,
            bio: bio,
            agent_code: agentCode,
            agent_title: agentTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving profile to Supabase:", error);
      // Continue with local storage only
    }

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
