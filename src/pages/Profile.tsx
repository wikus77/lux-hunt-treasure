
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ProfileClues from "@/components/profile/ProfileClues";
import ProfileBio from "@/components/profile/ProfileBio";
import EditModeToggle from "@/components/profile/EditModeToggle";
import { supabase } from "@/integrations/supabase/client";

interface Clue {
  id: string;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType?: "Base" | "Silver" | "Gold" | "Black";
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unlockedClues, setUnlockedClues] = useState<Clue[]>([]);
  const { toast } = useToast();

  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImage(savedProfileImage);

    const savedName = localStorage.getItem('profileName');
    if (savedName) setName(savedName);

    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) setBio(savedBio);
  }, []);

  // Handle saving profile data
  const handleSaveProfile = () => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);

    setIsEditing(false);
    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche al tuo profilo sono state salvate."
    });
  };

  // Fetch unlocked clues from Supabase
  useEffect(() => {
    const fetchUnlockedClues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      try {
        // Tentativo di ottenere indizi da Supabase se l'utente è loggato
        if (user) {
          const { data: userCluesData, error: userCluesError } = await supabase
            .from('user_clues')
            .select(`
              clue_id:clue_id (
                id,
                title,
                description,
                is_premium,
                premium_type
              )
            `)
            .eq('user_id', user.id)
            .eq('is_unlocked', true);

          if (userCluesError) {
            console.error('Error fetching user clues:', userCluesError);
            loadFallbackClues();
            return;
          }

          if (userCluesData && userCluesData.length > 0) {
            const clues = userCluesData.map(item => ({
              id: item.clue_id.id,
              title: item.clue_id.title,
              description: item.clue_id.description,
              week: 1,
              isLocked: false,
              subscriptionType: item.clue_id.is_premium ?
                (item.clue_id.premium_type as "Base" | "Silver" | "Gold" | "Black") :
                "Base"
            }));

            setUnlockedClues(clues);
          } else {
            loadFallbackClues();
          }
        } else {
          loadFallbackClues();
        }
      } catch (error) {
        console.error("Error fetching clues:", error);
        loadFallbackClues();
      }
    };

    const loadFallbackClues = () => {
      // Indizi di esempio per lo sviluppo/dimostrazione
      const fallbackClues = [
        {
          id: "1",
          title: "Primo Indizio",
          description: "L'auto si trova in una città che inizia con la lettera 'M'.",
          week: 1,
          isLocked: false,
          subscriptionType: "Base"
        },
        {
          id: "2",
          title: "Indizio sul veicolo",
          description: "L'auto ha un interno in pelle rossa e un motore V12.",
          week: 1,
          isLocked: false,
          subscriptionType: "Silver"
        },
        {
          id: "3",
          title: "Foto scattata",
          description: "Una foto mostra l'auto parcheggiata vicino a una fontana famosa.",
          week: 1,
          isLocked: false,
          subscriptionType: "Gold"
        },
        {
          id: "4",
          title: "Localizzazione precisa",
          description: "L'auto è stata avvistata in un parcheggio sotterraneo in via Roma.",
          week: 2,
          isLocked: false,
          subscriptionType: "Black"
        }
      ];
      
      // Salva gli indizi nel localStorage per persistenza in sviluppo
      localStorage.setItem('fallbackClues', JSON.stringify(fallbackClues));
      setUnlockedClues(fallbackClues);
    };

    // Controlla se abbiamo indizi salvati nel localStorage
    const savedClues = localStorage.getItem('fallbackClues');
    if (savedClues) {
      setUnlockedClues(JSON.parse(savedClues));
    } else {
      fetchUnlockedClues();
    }
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader enableAvatarUpload profileImage={profileImage} setProfileImage={setProfileImage} />
      <div className="h-[72px] w-full" />

      <div className="w-full">
        <ProfileBio 
          name={name}
          setName={setName}
          bio={bio}
          setBio={setBio}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          isEditing={isEditing}
          onSave={handleSaveProfile}
        />

        <SubscriptionStatus />

        <ProfileClues unlockedClues={unlockedClues} />
      </div>

      <EditModeToggle 
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
