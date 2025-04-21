
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
// ProfileNotifications RIMOSSO
import ProfileClues from "@/components/profile/ProfileClues";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche al tuo profilo sono state salvate."
    });
  };

  useEffect(() => {
    const fetchUnlockedClues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
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
            return;
          }

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
        } catch (error) {
          console.error("Error fetching clues:", error);
          setUnlockedClues([
            {
              id: "1",
              title: "Primo Indizio",
              description: "L'auto si trova in una città che inizia con la lettera 'M'.",
              week: 1,
              isLocked: false,
              subscriptionType: "Base"
            }
          ]);
        }
      }
    };

    fetchUnlockedClues();
  }, []);

  return (
    <ProfileLayout>
      <ProfileHeader
        name={name}
        setName={setName}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />

      <ProfileBio
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        profileImage={profileImage}
        handleImageChange={handleImageChange}
        isEditing={isEditing}
        className=""
      />

      {/* SEZIONE NOTIFICHE RIMOSSA */}

      <SubscriptionStatus />

      <ProfileClues unlockedClues={unlockedClues} />

      {isEditing && (
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
          onClick={handleSaveProfile}
        >
          Salva Modifiche
        </Button>
      )}
    </ProfileLayout>
  );
};

export default Profile;

