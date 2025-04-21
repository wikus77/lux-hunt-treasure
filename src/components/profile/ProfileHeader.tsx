
import { useState, useEffect } from "react";
import { Edit, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import InstagramStyleDrawer from "./InstagramStyleDrawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage && !profileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

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
    <div className="flex justify-end items-center px-4 py-6 border-b border-projectx-deep-blue relative">
      <div className="flex gap-2 items-center">
        <span className="instagram-story-ring-gradient">
          <Avatar className="w-10 h-10 border-2 bg-black">
            <AvatarImage src={profileImage || ""} alt={name} />
            <AvatarFallback className="bg-transparent">
              <User className="w-6 h-6 text-projectx-neon-blue" />
            </AvatarFallback>
          </Avatar>
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <InstagramStyleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default ProfileHeader;
