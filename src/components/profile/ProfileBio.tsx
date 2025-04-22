
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
    <section className="p-4">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-4">
          <label htmlFor="profile-image-upload-local" className={isEditing ? "cursor-pointer" : ""}>
            <div 
              className="w-24 h-24 rounded-full overflow-hidden bg-projectx-deep-blue flex items-center justify-center hover:opacity-90 transition-opacity"
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

      {isEditing && (
        <div className="px-4 mb-8">
          <button
            className="w-full flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition
              shadow-lg mt-3"
            style={{ opacity: 1, cursor: "pointer" }}
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
