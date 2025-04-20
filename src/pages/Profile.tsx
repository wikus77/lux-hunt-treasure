import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileNotifications from "@/components/profile/ProfileNotifications";
import ProfileClues from "@/components/profile/ProfileClues";

interface Clue {
  id: string;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType?: "Base" | "Silver" | "Gold" | "Black";
}

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unlockedClues, setUnlockedClues] = useState<Clue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    toast({
      title: "Notifiche lette",
      description: "Tutte le notifiche sono state segnate come lette."
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

    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    };

    fetchUnlockedClues();
    loadNotifications();

    const checkForNewNotifications = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => {
      clearInterval(checkForNewNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="pb-20 min-h-screen bg-black">
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
      />

      <ProfileNotifications
        notifications={notifications}
        markAllAsRead={markAllAsRead}
        unreadCount={unreadCount}
      />

      <div className="glass-card mb-4">
        <h3 className="text-lg font-bold mb-2">Stato Abbonamento</h3>
        
        <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-projectx-blue to-projectx-neon-blue">
          <div className="flex justify-between items-center">
            <span className="font-bold">Base</span>
            <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">
              Gratuito
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          Aggiorna Abbonamento
        </Button>
      </div>

      <ProfileClues unlockedClues={unlockedClues} />

      {isEditing && (
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
          onClick={handleSaveProfile}
        >
          Salva Modifiche
        </Button>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Profile;
