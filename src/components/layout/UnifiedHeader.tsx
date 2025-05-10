
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './header/UserMenu';
import MobileMenuButton from './header/MobileMenuButton';
import { MobileMenu } from './header/MobileMenu';
import HeaderCountdown from './header/HeaderCountdown';
import AgentCodeDisplay from './header/AgentCodeDisplay';
import { useNotificationManager } from '@/hooks/useNotificationManager';

interface UnifiedHeaderProps {
  onClickMail?: () => void;
  profileImage?: string | null;
  leftComponent?: React.ReactNode;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({ onClickMail, profileImage, leftComponent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { openNotificationsBanner, unreadCount } = useNotificationManager();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full h-[72px] z-50 bg-black border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center">
          <MobileMenuButton 
            onClick={toggleMobileMenu} 
            isOpen={isMobileMenuOpen} 
          />
          
          {leftComponent || (
            <Link to="/" className="text-white font-bold text-xl ml-2">
              M1SSION
            </Link>
          )}
          
          <AgentCodeDisplay 
            agentCode="ABC123"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <HeaderCountdown />
          
          <nav className="hidden lg:flex items-center space-x-4">
            <Link to="/events" className={`text-sm ${location.pathname === '/events' ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}>
              Eventi
            </Link>
            <Link to="/map" className={`text-sm ${location.pathname === '/map' ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}>
              Mappa
            </Link>
            <Link to="/leaderboard" className={`text-sm ${location.pathname === '/leaderboard' ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`}>
              Classifica
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openNotificationsBanner}
          >
            <Bell className="h-5 w-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          
          <UserMenu onClickMail={onClickMail} />
        </div>
      </div>
      
      {isMobileMenuOpen && <MobileMenu />}
    </header>
  );
};

export default UnifiedHeader;
