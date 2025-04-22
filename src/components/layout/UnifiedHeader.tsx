
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, MoreVertical } from "lucide-react";

interface UnifiedHeaderProps {
  enableAvatarUpload?: boolean;
  profileImage?: string | null;
  setProfileImage?: (img: string | null) => void;
  onClickSettings?: () => void;
  onClickMail?: () => void;
}

const UnifiedHeader = ({
  enableAvatarUpload,
  profileImage: propProfileImage,
  setProfileImage: propSetProfileImage,
  onClickSettings,
  onClickMail,
}: UnifiedHeaderProps) => {
  const navigate = useNavigate();
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  // Photo is always read from localStorage to guarantee sync
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    setProfileImage(savedProfileImage);
  }, [propProfileImage]); // update if changed from outside too

  // Avatar click per upload solo su enableAvatarUpload/profilo, altrimenti profilo
  const handleAvatarClick = () => {
    if (enableAvatarUpload && inputRef) inputRef.click();
    else navigate("/profile");
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setProfileImage(src);
        localStorage.setItem('profileImage', src);
        if (propSetProfileImage) propSetProfileImage(src);
      };
      reader.readAsDataURL(file);
    }
  };

  // Si assicura che ogni pagina abbia logo, slogan, mail, settings uguali
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-4 flex flex-col items-center justify-center border-b border-projectx-deep-blue bg-black backdrop-blur-xl transition-all duration-300">
      <div className="flex w-full max-w-screen-xl justify-between items-center">
        {/* Avatar/profile menu */}
        <button
          type="button"
          aria-label="Profilo"
          className="outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          onClick={handleAvatarClick}
        >
          <span className="profile-custom-ring">
            <Avatar className="w-9 h-9 border border-white/20 bg-black hover:border-white/40 transition-colors cursor-pointer">
              <AvatarImage src={profileImage || ""} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-transparent">
                <User className="w-5 h-5 text-white/70" />
              </AvatarFallback>
            </Avatar>
          </span>
          {/* Input file solo nella pagina profilo, nascosto */}
          {enableAvatarUpload && (
            <input
              ref={setInputRef}
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              className="hidden"
              tabIndex={-1}
            />
          )}
        </button>
        <div className="flex flex-col items-center w-1/2 min-w-max">
          <h1 className="text-2xl text-center font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
            M1SSION
          </h1>
          <span className="text-sm font-orbitron tracking-widest text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#1EAEDB] to-[#33C3F0] bg-clip-text mt-0.5 select-none transition-colors">
            it is possible
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mail"
            className="p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            onClick={() => (onClickMail ? onClickMail() : navigate("/notifications"))}
          >
            <Mail className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors"
            onClick={() => (onClickSettings ? onClickSettings() : navigate("/settings"))}
            aria-label="Impostazioni"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
