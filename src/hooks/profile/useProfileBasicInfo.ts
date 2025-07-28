
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useProfileRealtime } from "@/hooks/useProfileRealtime";

export const useProfileBasicInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [agentTitle, setAgentTitle] = useState("Decoder");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { profileData: realtimeProfile, updateProfile } = useProfileRealtime();

  // Sync with realtime profile data
  useEffect(() => {
    if (realtimeProfile) {
      if (realtimeProfile.full_name) setName(realtimeProfile.full_name);
      if (realtimeProfile.bio) setBio(realtimeProfile.bio);
      if (realtimeProfile.agent_code) setAgentCode(realtimeProfile.agent_code);
      if (realtimeProfile.agent_title) setAgentTitle(realtimeProfile.agent_title);
      if (realtimeProfile.avatar_url) setProfileImage(realtimeProfile.avatar_url);
    }
  }, [realtimeProfile]);

  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const loadProfileBasicInfo = async () => {
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
    };
    
    loadProfileBasicInfo();
  }, []);

  // Handle saving profile data with realtime updates
  const handleSaveBasicInfo = async () => {
    try {
      // Save to localStorage immediately for instant feedback
      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      }
      localStorage.setItem('profileName', name);
      localStorage.setItem('profileBio', bio);
      localStorage.setItem('agentCode', agentCode);

      // Use realtime update function for immediate UI update and Supabase sync
      await updateProfile({
        full_name: name,
        bio: bio,
        agent_code: agentCode,
        agent_title: agentTitle,
        avatar_url: profileImage
      });

      setIsEditing(false);
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche al tuo dossier agente sono state salvate."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche. Riprova.",
        variant: "destructive"
      });
    }
  };

  return {
    isEditing,
    bio,
    name,
    agentCode,
    agentTitle,
    profileImage,
    setIsEditing,
    setBio,
    setName,
    setAgentCode,
    setAgentTitle, 
    setProfileImage,
    handleSaveBasicInfo
  };
};
