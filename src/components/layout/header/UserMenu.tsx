import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUnifiedAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full h-9 w-9">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata?.avatar_url || "/images/avatars/placeholder.svg"} alt={user?.email || "User Avatar"} />
            <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : '?'}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserIcon className="h-4 w-4 mr-2" />
          Profilo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Cog6ToothIcon className="h-4 w-4 mr-2" />
          Impostazioni
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
