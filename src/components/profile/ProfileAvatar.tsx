
import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  profileImage?: string | null;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  profileImage, 
  className 
}) => {
  return (
    <Avatar className={cn("rounded-full border-2 border-projectx-blue/30", className)}>
      {profileImage ? (
        <AvatarImage src={profileImage} alt="Profile" />
      ) : (
        <AvatarFallback className="bg-gradient-to-r from-[#131524]/80 to-black/80">
          <User className="h-5 w-5 text-projectx-neon-blue" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfileAvatar;
