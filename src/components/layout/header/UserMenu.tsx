
import { User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";

interface UserMenuProps {
  onClickMail?: () => void;
  enableAvatarUpload?: boolean;
}

const UserMenu = ({ onClickMail, enableAvatarUpload }: UserMenuProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    // Check if current date is before July 19, 2025
    const launchDate = new Date('2025-07-19T00:00:00');
    const currentDate = new Date();
    
    setIsButtonDisabled(currentDate < launchDate);
  }, []);

  const handleSignOut = () => {
    if (logout) {
      logout();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full ${isButtonDisabled ? 'pointer-events-none opacity-50' : ''}`}
          disabled={isButtonDisabled}
          id="profile-button"
        >
          <Avatar className="h-8 w-8 border border-cyan-400/30 hover:border-cyan-400/70 transition-colors">
            <AvatarFallback className="bg-black">
              <User className="h-4 w-4 text-cyan-400" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {!isButtonDisabled && (
        <DropdownMenuContent align="end" className="glass-card border-cyan-400/30">
          <DropdownMenuLabel className="text-white">Il mio profilo</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/profile")}
          >
            <User className="mr-2 h-4 w-4 text-cyan-400" />
            Profilo
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/settings")}
          >
            <Settings className="mr-2 h-4 w-4 text-cyan-400" />
            Impostazioni
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4 text-pink-500" />
            Esci
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default UserMenu;
