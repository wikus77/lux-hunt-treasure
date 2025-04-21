
import { useEffect, useState } from "react";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";

interface BriefProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileImage?: string | null;
}

const BriefProfileModal = ({ open, onClose, profileImage }: BriefProfileModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("Mario Rossi");
  const [bio, setBio] = useState("");
  
  // Load profile data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('profileName');
    if (savedName) {
      setName(savedName);
    }
    
    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) {
      setBio(savedBio);
    }
  }, [open]);

  const goToProfile = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-projectx-deep-blue p-6 text-left max-w-md">
        <DialogClose className="absolute right-4 top-4">
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
        
        <div className="flex flex-col items-center mt-4 mb-6">
          <span className="instagram-story-ring">
            <Avatar className="w-20 h-20 border-2 border-projectx-neon-blue">
              {profileImage ? (
                <AvatarImage src={profileImage} alt={name} />
              ) : (
                <AvatarFallback className="bg-projectx-deep-blue">
                  <User className="h-10 w-10 text-projectx-neon-blue" />
                </AvatarFallback>
              )}
            </Avatar>
          </span>
          
          <h3 className="text-xl font-bold mt-4 gradient-white-text">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">Membro dal 19 Aprile 2025</p>
          
          {bio && (
            <p className="text-sm mt-4 text-center text-muted-foreground">
              {bio}
            </p>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            className="w-full bg-projectx-neon-blue hover:bg-projectx-pink transition-colors"
            onClick={goToProfile}
          >
            Vai al profilo completo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BriefProfileModal;
