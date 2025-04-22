import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileClues from "@/components/profile/ProfileClues";
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

  // Nuovo: Ref per input file per upload foto dal click sulla foto
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImage(savedProfileImage);

    const savedName = localStorage.getItem('profileName');
    if (savedName) setName(savedName);

    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) setBio(savedBio);
  }, []);

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

  // Handler per il cambio dell'immagine profilo dal selettore file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setProfileImage(src);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader enableAvatarUpload profileImage={profileImage} setProfileImage={setProfileImage} />
      <div className="h-[72px] w-full" />

      <div className="w-full">
        {/* Sezione Bio e gestione della foto profilo */}
        <section className="p-4">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4">
              {/* Ecco la foto profilo cliccabile in modalità modifica */}
              <label htmlFor="profile-image-upload-local" className={isEditing ? "cursor-pointer" : ""}>
                <div
                  className="w-24 h-24 rounded-full overflow-hidden bg-projectx-deep-blue flex items-center justify-center hover:opacity-90 transition-opacity"
                  onClick={() => {
                    if (isEditing && fileInputRef) {
                      (fileInputRef as HTMLInputElement).click();
                    }
                  }}
                  style={{ cursor: isEditing ? "pointer" : "default" }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 17.232a4 4 0 01-6.464 0m6.464 0A4 4 0 109.768 17.232m6.464 0V21M12 7a4 4 0 100-8 4 4 0 000 8z" /></svg>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute -right-1 bottom-0">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-projectx-pink cursor-pointer"
                    >
                      {/* Camera icon (lucide-react) */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 7V5a2 2 0 012-2h2.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0015.172 5H17a2 2 0 012 2v2m-9 0h6a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-6a2 2 0 012-2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                  </div>
                )}
              </label>
              {/* Input file per selezione immagine, attivato cliccando la foto */}
              <input
                ref={ref => (fileInputRef as any) = ref}
                type="file"
                id="profile-image-upload-local"
                className="hidden"
                accept="image/*"
                onChange={isEditing ? handleImageChange : undefined}
                tabIndex={-1}
              />
            </div>

            {isEditing ? (
              <div className="w-full max-w-xs mb-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-center bg-black text-white border border-gray-700 rounded px-3 py-2 w-full"
                  maxLength={40}
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold">{name}</h2>
            )}

            <div className="text-sm text-muted-foreground">
              Membro dal 19 Aprile 2025
            </div>
          </div>

          <div className="glass-card mb-4">
            <h3 className="text-lg font-bold mb-2">Bio</h3>

            {isEditing ? (
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="min-h-[100px] w-full bg-black text-white border border-gray-700 rounded px-3 py-2"
                maxLength={180}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{bio}</p>
            )}
          </div>
        </section>

        {/* Tasto "Salva Modifiche" sempre in fondo visibile e cliccabile solo in modalità editing */}
        {isEditing && (
          <div className="px-4 mb-8">
            <button
              className="w-full flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition
                shadow-lg mt-3"
              style={{ opacity: 1, cursor: "pointer" }}
              onClick={handleSaveProfile}
              type="button"
              aria-label="Salva le modifiche"
            >
              Salva Modifiche
            </button>
          </div>
        )}

        <SubscriptionStatus />

        <ProfileClues unlockedClues={unlockedClues} />
      </div>
    </div>
  );
};

export default Profile;
