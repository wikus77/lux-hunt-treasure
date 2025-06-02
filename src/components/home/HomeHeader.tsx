
import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import RealtimeStatusIndicator from "@/components/notifications/RealtimeStatusIndicator";
import { Button } from "@/components/ui/button";

interface HomeHeaderProps {
  profileImage: string | null;
  unreadCount: number;
  onShowNotifications: () => void;
}

const HomeHeader = ({ profileImage, unreadCount, onShowNotifications }: HomeHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected } = useRealTimeNotifications();
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-black/80 to-black/80 border-b border-projectx-deep-blue/30 header-safe-area">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo and Brand */}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <span className="text-white text-lg font-bold bg-gradient-to-r from-purple-400 to-projectx-neon-blue bg-clip-text text-transparent">
            M1SSION
          </span>
        </div>
        
        {/* Center section with real-time indicator */}
        <div className="flex sm:flex items-center gap-3">
          {/* Removed M1-AGENT badge */}
          <RealtimeStatusIndicator isConnected={isConnected} />
        </div>
        
        {/* Right section with notifications and profile */}
        <div className="flex items-center gap-4">
          {/* Notifications button */}
          <button 
            className="relative p-2 rounded-full hover:bg-purple-900/20 active:bg-purple-900/40 transition-colors"
            onClick={onShowNotifications}
          >
            <Bell className="w-5 h-5 text-projectx-neon-blue" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-projectx-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile image button */}
          <button 
            className="h-9 w-9 rounded-full border-2 border-purple-500/50 overflow-hidden"
            onClick={() => navigate('/profile')}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                <span className="text-sm text-white">User</span>
              </div>
            )}
          </button>
          
          {/* Mobile menu button */}
          <button 
            className="sm:hidden p-2 rounded-full hover:bg-purple-900/20 active:bg-purple-900/40 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5 text-projectx-neon-blue" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu (hidden on larger screens) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/90 border-b border-projectx-deep-blue/30 py-3 px-4 sm:hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-center mb-3">
              {/* Removed M1-AGENT badge */}
            </div>
            <div className="flex items-center gap-2 py-1">
              <RealtimeStatusIndicator isConnected={isConnected} />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connesso in tempo reale' : 'Connessione in tempo reale non disponibile'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              className="w-full text-left justify-start" 
              onClick={() => {
                navigate('/buzz');
                setIsMenuOpen(false);
              }}
            >
              Buzz
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-left justify-start" 
              onClick={() => {
                navigate('/map');
                setIsMenuOpen(false);
              }}
            >
              Mappa
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-left justify-start" 
              onClick={() => {
                navigate('/events');
                setIsMenuOpen(false);
              }}
            >
              Eventi
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
