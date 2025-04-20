import { useState, useEffect } from "react";
import { Camera, Edit, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ClueCard from "@/components/clues/ClueCard";

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
        const { data: userCluesData, error: userCluesError } = await supabase
          .from('user_clues')
          .select('clue_id(id, title, description, week, is_premium, premium_type)')
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
          week: item.clue_id.week,
          isLocked: false,
          subscriptionType: item.clue_id.is_premium ? 
            (item.clue_id.premium_type as "Base" | "Silver" | "Gold" | "Black") : 
            "Base"
        }));

        setUnlockedClues(clues);
      }
    };

    fetchUnlockedClues();
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Profilo</h1>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-5 w-5" />
        </Button>
      </header>

      {/* Profile Section */}
      <section className="p-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-projectx-deep-blue flex items-center justify-center">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            {isEditing && (
              <div className="absolute -right-1 bottom-0">
                <label 
                  htmlFor="profile-image" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-projectx-pink cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full max-w-xs mb-2">
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center"
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold">{name}</h2>
          )}
          
          <div className="text-sm text-muted-foreground">
            Membro dal 19 Aprile 2025
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass-card mb-4">
          <h3 className="text-lg font-bold mb-2">Bio</h3>
          
          {isEditing ? (
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{bio}</p>
          )}
        </div>

        {/* Subscription Status */}
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

        {/* Achievements */}
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-2">Progressi</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Indizi sbloccati</span>
                <span className="text-xs">1/4</span>
              </div>
              <div className="w-full h-2 bg-projectx-deep-blue rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-projectx-neon-blue"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Eventi completati</span>
                <span className="text-xs">0/5</span>
              </div>
              <div className="w-full h-2 bg-projectx-deep-blue rounded-full overflow-hidden">
                <div className="w-0 h-full bg-projectx-neon-blue"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button for Edit Mode */}
        {isEditing && (
          <Button 
            className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
            onClick={handleSaveProfile}
          >
            Salva Modifiche
          </Button>
        )}
      </section>

      {/* Clues Section */}
      <div className="glass-card mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <BookOpen className="mr-2 h-5 w-5" /> Indizi
          </h3>
          <span className="text-sm text-muted-foreground">
            {unlockedClues.length} / 10 sbloccati
          </span>
        </div>
        
        {unlockedClues.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Non hai ancora sbloccato nessun indizio.</p>
            <p>Esplora gli eventi o usa il pulsante Buzz per ottenerne di nuovi!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unlockedClues.map((clue) => (
              <ClueCard
                key={clue.id}
                title={clue.title}
                description={clue.description}
                week={clue.week}
                isLocked={false}
                subscriptionType={clue.subscriptionType}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Profile;
