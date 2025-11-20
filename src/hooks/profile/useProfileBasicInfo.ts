// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// @ts-nocheck
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGlobalProfileSync } from "@/hooks/useGlobalProfileSync";
import { useProfileRealtime } from "@/hooks/useProfileRealtime";

export const useProfileBasicInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [agentTitle, setAgentTitle] = useState("Decoder");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();
  const globalProfile = useGlobalProfileSync();
  const { updateProfile } = useProfileRealtime();

  // Sync with global profile data - prioritize real-time updates
  useEffect(() => {
    if (globalProfile) {
      console.log('📡 Global profile update received in useProfileBasicInfo:', globalProfile);
      if (globalProfile.full_name) {
        setName(globalProfile.full_name);
        console.log('🔄 useProfileBasicInfo: Updated name to:', globalProfile.full_name);
      }
      if (globalProfile.bio) setBio(globalProfile.bio);
      if (globalProfile.agent_code) setAgentCode(globalProfile.agent_code);
      if (globalProfile.agent_title) setAgentTitle(globalProfile.agent_title);
      if (globalProfile.avatar_url) setProfileImage(globalProfile.avatar_url);
    }
  }, [globalProfile]);

  // Load saved profile data from localStorage on component mount (only if no global data)
  useEffect(() => {
    const loadProfileBasicInfo = async () => {
      // Only load from localStorage if we don't have global profile data yet
      if (!globalProfile) {
        console.log('📂 Loading profile from localStorage fallback');
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
      }
    };
    
    loadProfileBasicInfo();
  }, [globalProfile]);

  // Handle saving profile data with realtime updates
  const handleSaveBasicInfo = async () => {
    try {
      console.log('[ProfileBasicInfo] Starting save...', {
        name,
        bio,
        agentCode,
        agentTitle,
        profileImage
      });

      // Save to localStorage immediately for instant feedback
      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      }
      localStorage.setItem('profileName', name);
      localStorage.setItem('profileBio', bio);
      localStorage.setItem('agentCode', agentCode);

      // Use realtime update function for immediate UI update and Supabase sync
      const result = await updateProfile({
        full_name: name,
        bio: bio,
        agent_code: agentCode,
        agent_title: agentTitle,
        avatar_url: profileImage
      });

      console.log('[ProfileBasicInfo] Save result:', result);

      setIsEditing(false);
      toast({
        title: "✅ Profilo aggiornato",
        description: "Le modifiche al tuo dossier agente sono state salvate con successo."
      });
    } catch (error: any) {
      console.error("[ProfileBasicInfo] Error saving profile:", error);
      
      // Enhanced error reporting
      const errorMessage = error?.message || 'Errore sconosciuto';
      const errorCode = error?.code || 'N/A';
      
      toast({
        title: "❌ Impossibile salvare le modifiche",
        description: `Errore: ${errorMessage} (Code: ${errorCode}). Verifica la connessione e riprova.`,
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
