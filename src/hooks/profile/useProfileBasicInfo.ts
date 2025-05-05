
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const useProfileBasicInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [agentTitle, setAgentTitle] = useState("Decoder");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Try to load data from Supabase if authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, bio, agent_code, agent_title')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Update local state with profile data from database
            if (data.full_name) setName(data.full_name);
            if (data.bio) setBio(data.bio);
            if (data.agent_code) setAgentCode(data.agent_code);
            if (data.agent_title) setAgentTitle(data.agent_title);
          }
        }
      } catch (error) {
        console.error("Error loading profile data from Supabase:", error);
        // Continue with local data
      }
    };
    
    loadProfileBasicInfo();
  }, []);

  // Handle saving profile data
  const handleSaveBasicInfo = async () => {
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
