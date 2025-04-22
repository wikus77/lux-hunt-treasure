
import { User, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProfileBioProps {
  name: string;
  setName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  profileImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  onSave?: () => void;
}

const ProfileBio = ({
  name,
  setName,
  bio,
  setBio,
  profileImage,
  handleImageChange,
  isEditing,
  onSave
}: ProfileBioProps) => {
  return (
    <section className="p-4">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-4">
          <label htmlFor="profile-image-upload" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-projectx-deep-blue flex items-center justify-center hover:opacity-90 transition-opacity">
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
                <div 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-projectx-pink cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            )}
          </label>
          <input 
            type="file" 
            id="profile-image-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleImageChange}
          />
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

      {isEditing && onSave && (
        <Button 
          onClick={onSave}
          className="w-full bg-gradient-to-r from-green-500 to-green-700"
        >
          Salva Modifiche
        </Button>
      )}
    </section>
  );
};

export default ProfileBio;
