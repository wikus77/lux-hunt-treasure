
import { useState, useEffect } from "react";
import { Edit, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { supabase } from "@/integrations/supabase/client";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileClues from "@/components/profile/ProfileClues";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import InstagramStyleDrawer from "@/components/profile/InstagramStyleDrawer";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    <div className="w-full min-h-screen bg-black pb-20">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">Profilo</h1>
        <div className="flex gap-2 items-center absolute right-4 top-1/2 -translate-y-1/2">
          {/* Bottone modifica profilo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing((v) => !v)}
            aria-label="Modifica profilo"
          >
            <Edit className="h-5 w-5" />
          </Button>
          {/* Bottone Centro gestione account */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => setDrawerOpen(true)}
            aria-label="Centro gestione account"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <InstagramStyleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>
      <div className="h-[72px] w-full" />

      <div className="w-full">
        {/* Header custom rimosso, ora tutto è nella sticky header */}
        <ProfileBio
          name={name}
          setName={setName}
          bio={bio}
          setBio={setBio}
          profileImage={profileImage}
          handleImageChange={handleImageChange}
          isEditing={isEditing}
        />

        <SubscriptionStatus />

        <ProfileClues unlockedClues={unlockedClues} />

        {isEditing && (
          <Button 
            className="w-full mt-6 bg-gradient-to-r from-black to-black"
            onClick={handleSaveProfile}
          >
            Salva Modifiche
          </Button>
        )}
      </div>
    </div>
  );
};

export default Profile;
