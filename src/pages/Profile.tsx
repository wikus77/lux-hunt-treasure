
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ProfileClues from "@/components/profile/ProfileClues";
import ProfileBio from "@/components/profile/ProfileBio";
import EditModeToggle from "@/components/profile/EditModeToggle";

interface Clue {
  id: string;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType?: "Base" | "Silver" | "Gold" | "Black";
}

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unlockedClues, setUnlockedClues] = useState<Clue[]>([]);

  // Check login status and load profile data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      toast.error("Accesso richiesto", {
        description: "Devi effettuare l'accesso per visualizzare questa pagina."
      });
      navigate('/login');
      return;
    }
    
    // Load saved profile data
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImage(savedProfileImage);

    const savedName = localStorage.getItem('profileName');
    if (savedName) setName(savedName);
    else {
      // Use email or a default name if no profile name is set
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      if (userName) {
        setName(userName);
        localStorage.setItem('profileName', userName);
      } else if (userEmail) {
        const emailName = userEmail.split('@')[0];
        setName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        localStorage.setItem('profileName', name);
      }
    }

    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) setBio(savedBio);
    
    // Load saved clues
    loadUserClues();
  }, [navigate, name]);

  // Handle saving profile data
  const handleSaveProfile = () => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);

    setIsEditing(false);
    toast.success("Profilo aggiornato", {
      description: "Le modifiche al tuo profilo sono state salvate."
    });
  };

  // Load user clues
  const loadUserClues = () => {
    const savedClues = localStorage.getItem('fallbackClues');
    if (savedClues) {
      try {
        setUnlockedClues(JSON.parse(savedClues) as Clue[]);
      } catch (error) {
        console.error("Error parsing saved clues:", error);
        loadFallbackClues();
      }
    } else {
      loadFallbackClues();
    }
  };

  // Load example clues
  const loadFallbackClues = () => {
    const fallbackClues: Clue[] = [
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
    
    localStorage.setItem('fallbackClues', JSON.stringify(fallbackClues));
    setUnlockedClues(fallbackClues);
  };

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
