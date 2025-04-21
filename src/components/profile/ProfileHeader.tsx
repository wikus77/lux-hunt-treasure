import { useState } from "react";
import { Camera, Edit, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import InstagramStyleDrawer from "./InstagramStyleDrawer";

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
    <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue relative">
      <h1 className="text-2xl font-bold neon-text">Profilo</h1>
      
      <div className="flex gap-2 items-center">
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
    </header>
  );
};

export default ProfileHeader;
