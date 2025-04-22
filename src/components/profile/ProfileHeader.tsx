
import { useState } from "react";
import { Edit, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import InstagramStyleDrawer from "./InstagramStyleDrawer";

interface ProfileHeaderProps {
  profileImage: string | null;
  name: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSave?: () => void;
}

const ProfileHeader = ({
  profileImage,
  name,
  isEditing,
  setIsEditing,
  onSave
}: ProfileHeaderProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex justify-between items-center px-4 py-4 border-b border-projectx-deep-blue relative">
      <h2 className="text-xl font-bold gradient-white-text">{name}</h2>
      
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
