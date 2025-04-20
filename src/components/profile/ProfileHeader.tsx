
import { useState } from "react";
import { Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  name: string;
  setName: (name: string) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const ProfileHeader = ({
  name,
  setName,
  profileImage,
  setProfileImage,
  isEditing,
  setIsEditing
}: ProfileHeaderProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
      <h1 className="text-2xl font-bold neon-text">Profilo</h1>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsEditing(!isEditing)}
      >
        <Edit className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default ProfileHeader;
