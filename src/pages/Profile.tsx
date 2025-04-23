
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import EditModeToggle from "@/components/profile/EditModeToggle";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
