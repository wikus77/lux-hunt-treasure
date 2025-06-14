import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

interface MobileMenuProps {
  className?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ className }) => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    toast({
      title: "Logout",
      description: "Logging out...",
    });
    navigate("/login");
  };

  return (
    <Sheet>
      <SheetTrigger className={className}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="bg-black border-r border-white/10">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Naviga attraverso le opzioni disponibili.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none text-white">{user?.email}</p>
              <p className="text-sm text-gray-500">Agente M1SSION™</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <Link to="/home">
            <Button variant="ghost" className="justify-start w-full">
              Home
            </Button>
          </Link>
          <Link to="/map">
            <Button variant="ghost" className="justify-start w-full">
              Mappa
            </Button>
          </Link>
          <Link to="/buzz">
            <Button variant="ghost" className="justify-start w-full">
              Buzz
            </Button>
          </Link>
          <Link to="/games">
            <Button variant="ghost" className="justify-start w-full">
              Games
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="ghost" className="justify-start w-full">
              Leaderboard
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" className="justify-start w-full">
              Profilo
            </Button>
          </Link>
          <Link to="/subscriptions">
            <Button variant="ghost" className="justify-start w-full">
              Abbonamenti
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="justify-start w-full">
              Impostazioni
            </Button>
          </Link>
        </div>

        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
