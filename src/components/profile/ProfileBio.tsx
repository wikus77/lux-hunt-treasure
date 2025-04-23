
import { useState, useRef } from "react";
import { User, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileBioProps {
  name: string;
  setName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  isEditing: boolean;
  onSave: () => void;
}

const ProfileBio = ({
  name,
  setName,
  bio,
  setBio,
  profileImage,
  setProfileImage,
  isEditing,
  onSave
}: ProfileBioProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handler for profile image change from file selector
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

  return (
    <section className="p-4 animate-fade-in">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-4 group">
          <label htmlFor="profile-image-upload-local" className={isEditing ? "cursor-pointer" : ""}>
            <div 
              className={`w-24 h-24 rounded-full overflow-hidden bg-black/40 flex items-center justify-center 
                transition-all duration-300 ease-out
                ${isEditing ? 'hover:scale-105 hover:shadow-[0_0_15px_rgba(0,163,255,0.5)]' : ''}
                backdrop-blur-sm border border-white/10`}
              onClick={() => {
                if (isEditing && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              style={{ cursor: isEditing ? "pointer" : "default" }}
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <User className="w-12 h-12 text-white/70" />
              )}
            </div>
            {isEditing && (
              <div className="absolute -right-1 bottom-0">
                <div 
                  className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-gradient-to-r from-projectx-blue to-projectx-purple cursor-pointer
                    transition-transform duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            )}
          </label>
          <input 
            ref={fileInputRef}
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
              className="text-center bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2 w-full
                backdrop-blur-sm transition-all duration-300
                focus:border-projectx-blue focus:ring-1 focus:ring-projectx-blue
                hover:border-white/20"
              maxLength={40}
            />
          </div>
        ) : (
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {name}
          </h2>
        )}
        
        <div className="text-sm text-white/60">
          Membro dal 19 Aprile 2025
        </div>
      </div>

      <div className="glass-card mb-4 transition-all duration-300 hover:bg-white/[0.07]">
        <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-projectx-blue to-projectx-purple bg-clip-text text-transparent">
          Bio
        </h3>
        
        {isEditing ? (
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="min-h-[100px] w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2
              backdrop-blur-sm transition-all duration-300
              focus:border-projectx-blue focus:ring-1 focus:ring-projectx-blue
              hover:border-white/20"
            maxLength={180}
          />
        ) : (
          <p className="text-sm text-white/70">{bio}</p>
        )}
      </div>

      {isEditing && (
        <div className="px-4 mb-8">
          <button
            className="w-full flex items-center justify-center px-6 py-3 rounded-full font-bold
              bg-gradient-to-r from-projectx-blue to-projectx-purple
              hover:from-projectx-purple hover:to-projectx-blue
              transition-all duration-500 transform hover:scale-[1.02]
              shadow-[0_0_15px_rgba(0,163,255,0.3)]
              hover:shadow-[0_0_20px_rgba(0,163,255,0.5)]"
            onClick={onSave}
            type="button"
            aria-label="Salva le modifiche"
          >
            Salva Modifiche
          </button>
        </div>
      )}
    </section>
  );
};

export default ProfileBio;
