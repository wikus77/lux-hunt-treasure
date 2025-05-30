
import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  profileImage?: string | null;
  className?: string;
  disabled?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  profileImage, 
  className,
  disabled = false
}) => {
  return (
    <Avatar className={cn(
      "rounded-full border-2 border-[#00D1FF]/30", 
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      {profileImage ? (
        <AvatarImage src={profileImage} alt="Profile" />
      ) : (
        <AvatarFallback className="bg-gradient-to-r from-[#131524]/80 to-black/80">
          <User className="h-5 w-5 text-[#00D1FF]" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfileAvatar;
