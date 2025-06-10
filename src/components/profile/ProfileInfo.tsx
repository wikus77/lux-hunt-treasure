import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef } from "react";

interface ProfileInfoProps {
  profileImage: string | null;
  name: string;
  bio: string;
  agentCode: string;
  agentTitle: string;
  investigativeStyle: {
    style: string;
    color: string;
  };
  stats: {
    missionsCompleted: number;
    cluesFound: number;
  };
  credits: number;
  isEditing: boolean;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  setProfileImage: (url: string) => void;
  setName: (name: string) => void;
  setBio: (bio: string) => void;
  setAgentCode: (code: string) => void;
  setAgentTitle: (title: string) => void;
}

const ProfileInfo = ({
  profileImage,
  name,
  bio,
  agentCode,
  agentTitle,
  investigativeStyle,
  stats,
  credits,
  isEditing,
  personalInfo,
  setProfileImage,
  setName,
  setBio,
  setAgentCode,
  setAgentTitle,
}: ProfileInfoProps) => {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Devi essere autenticato per caricare un'immagine");
        return;
      }

      // Generate unique filename with user ID path
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Errore nel caricamento dell'immagine. Riprova.");
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profile in database using the correct column name
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        toast.error("Errore nell'aggiornamento del profilo. Riprova.");
        return;
      }

      setProfileImage(publicUrl);
      toast.success("Immagine profilo aggiornata con successo!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Errore nel caricamento dell'immagine. Riprova.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Always display X0197 as the official agent code
  const displayAgentCode = "X0197";
  
  return (
    <div className="flex-shrink-0 flex flex-col items-center md:w-1/3">
      <div className="relative">
        <Avatar className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} border-2 border-cyan-500 shadow-lg shadow-cyan-500/20`}>
          <AvatarImage src={profileImage || ""} />
          <AvatarFallback className="bg-cyan-900/30">
            <User className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-cyan-500`} />
          </AvatarFallback>
        </Avatar>
        
        {/* Camera button for image upload */}
        <Button
          onClick={triggerFileInput}
          size="sm"
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-600 p-0"
        >
          <Camera className="w-4 h-4" />
        </Button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          capture={isMobile ? "user" : undefined}
        />
      </div>
      
      <div className="mt-4 text-center w-full max-w-[250px] mx-auto">
        {isEditing ? (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-2 bg-black/30 h-10 rounded-xl"
              placeholder="Nome Agente"
            />
            {/* Agent Code - Read Only and Disabled */}
            <Input
              value={displayAgentCode}
              readOnly={true}
              disabled={true}
              className="mb-2 bg-gray-800/50 h-10 rounded-xl opacity-60 cursor-not-allowed font-mono"
              placeholder="Codice Agente"
            />
            <Input
              value={agentTitle}
              onChange={(e) => setAgentTitle(e.target.value)}
              className="mb-2 bg-black/30 h-10 rounded-xl"
              placeholder="Titolo Agente"
            />
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-black/30 rounded-xl"
              placeholder="Bio"
              rows={isMobile ? 3 : 4}
            />
          </>
        ) : (
          <>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-1`}>{name}</h2>
            <p className="text-sm text-gray-400 mb-3">{bio}</p>
            
            {/* Agent Code Display - Read Only */}
            <div className="mb-3 p-2 bg-gray-800/30 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-400">Codice Agente:</span>
              <div className="mt-1 font-mono text-sm text-cyan-400">{displayAgentCode}</div>
            </div>
            
            {/* Investigative Style */}
            <div className="mb-4 p-2 bg-black/30 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400">Stile investigativo:</span>
              <div className="flex items-center mt-1 justify-center">
                <span className={`w-3 h-3 rounded-full ${investigativeStyle.color} mr-2`}></span>
                <span className="text-sm font-medium">{investigativeStyle.style}</span>
              </div>
            </div>
            
            {/* Personal Information Summary */}
            {personalInfo && (personalInfo.firstName || personalInfo.email || personalInfo.phone) && (
              <div className="mb-4 p-2 bg-black/30 rounded-md border border-gray-800">
                <span className="text-xs text-gray-400">Informazioni personali:</span>
                <div className="mt-1 text-left text-xs">
                  {personalInfo.firstName && personalInfo.lastName && (
                    <div className="mb-1">
                      <span className="text-gray-400">Nome: </span>
                      <span>{`${personalInfo.firstName} ${personalInfo.lastName}`}</span>
                    </div>
                  )}
                  {personalInfo.email && (
                    <div className="mb-1">
                      <span className="text-gray-400">Email: </span>
                      <span>{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="mb-1">
                      <span className="text-gray-400">Telefono: </span>
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo.address && personalInfo.city && (
                    <div className="mb-1">
                      <span className="text-gray-400">Indirizzo: </span>
                      <span>{`${personalInfo.address}, ${personalInfo.city}`}</span>
                      {personalInfo.postalCode && ` (${personalInfo.postalCode})`}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-xs text-gray-400 mr-1.5">Missioni: </span>
                  <span className="text-cyan-400 text-lg font-medium">{stats.missionsCompleted}</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-xs text-gray-400 mr-1.5">Indizi: </span>
                  <span className="text-cyan-400 text-lg font-medium">{stats.cluesFound}</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-xs text-gray-400 mr-1.5">Crediti: </span>
                  <span className="text-cyan-400 text-lg font-medium">{credits}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
