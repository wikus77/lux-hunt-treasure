
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  setProfileImage,
  setName,
  setBio,
  setAgentCode,
  setAgentTitle,
}: ProfileInfoProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-shrink-0 flex flex-col items-center md:w-1/3">
      <div className="relative">
        <Avatar className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} border-2 border-cyan-500 shadow-lg shadow-cyan-500/20`}>
          <AvatarImage src={profileImage || ""} />
          <AvatarFallback className="bg-cyan-900/30">
            <User className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-cyan-500`} />
          </AvatarFallback>
        </Avatar>
        
        {isEditing && (
          <div className="mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProfileImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-xs w-full max-w-[250px]"
            />
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center w-full max-w-[250px] mx-auto">
        {isEditing ? (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-2 bg-black/30 h-10"
              placeholder="Nome Agente"
            />
            <Input
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="mb-2 bg-black/30 font-mono h-10"
              placeholder="Codice Agente"
            />
            <Input
              value={agentTitle}
              onChange={(e) => setAgentTitle(e.target.value)}
              className="mb-2 bg-black/30 h-10"
              placeholder="Titolo Agente"
            />
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-black/30"
              placeholder="Bio"
              rows={isMobile ? 3 : 4}
            />
          </>
        ) : (
          <>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-1`}>{name}</h2>
            <p className="text-sm text-gray-400 mb-3">{bio}</p>
            
            {/* Investigative Style */}
            <div className="mb-4 p-2 bg-black/30 rounded-md border border-gray-800">
              <span className="text-xs text-gray-400">Stile investigativo:</span>
              <div className="flex items-center mt-1 justify-center">
                <span className={`w-3 h-3 rounded-full ${investigativeStyle.color} mr-2`}></span>
                <span className="text-sm font-medium">{investigativeStyle.style}</span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 text-xl font-bold">{stats.missionsCompleted}</span>
                <span className="text-xs text-gray-400">Missioni</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 text-xl font-bold">{stats.cluesFound}</span>
                <span className="text-xs text-gray-400">Indizi</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 text-xl font-bold">{credits}</span>
                <span className="text-xs text-gray-400">Crediti</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
