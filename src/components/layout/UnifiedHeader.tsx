
import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
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

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    setProfileImage(savedProfileImage);
    
    // Get unread notifications count
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const count = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(count);
      }
    } catch (e) {
      console.error("Error loading notification count:", e);
    }
    
    // Update count periodically
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
          const notifications = JSON.parse(stored);
          const count = notifications.filter((n: any) => !n.read).length;
          setUnreadCount(count);
        }
      } catch (e) {
        console.error("Error updating notification count:", e);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [propProfileImage]);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-4 flex flex-col items-center justify-center border-b border-projectx-deep-blue bg-black/50 backdrop-blur-xl transition-all duration-300">
      <div className="flex w-full max-w-screen-xl justify-between items-center">
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
          <h1 className="text-2xl text-center font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent font-extrabold select-none drop-shadow-[0_1.5px_12px_rgba(98,115,255,0.51)]">
            M1SSION
          </h1>
          <span
            className="text-xs font-bold italic leading-tight mt-0.5 select-none
              bg-gradient-to-r from-[#00a3ff] via-white to-[#9b87f5] bg-clip-text text-transparent tracking-widest font-mono uppercase"
            style={{
              fontFamily: '"Orbitron", "Playfair Display", "monospace", Arial, sans-serif',
              letterSpacing: "0.27em"
            }}
          >
            it is possible
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mail"
            className="p-2 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer relative"
            onClick={() => (onClickMail ? onClickMail() : navigate("/notifications"))}
          >
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 font-bold border border-black w-5 h-5 flex items-center justify-center rounded-full text-xs bg-red-600 text-white ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
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
