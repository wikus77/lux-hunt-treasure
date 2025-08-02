
// ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT
import { useState, useEffect } from "react";
import { Menu, Zap } from "lucide-react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import RealtimeStatusIndicator from "@/components/notifications/RealtimeStatusIndicator";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import AgentCodeDisplay from "@/components/layout/header/AgentCodeDisplay";

interface HomeHeaderProps {
  profileImage: string | null;
  unreadCount: number;
  onShowNotifications: () => void;
}

const HomeHeader = ({ profileImage, unreadCount, onShowNotifications }: HomeHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { navigate } = useWouterNavigation();
  const { isConnected } = useRealTimeNotifications();
  const { getCurrentUser } = useUnifiedAuth();
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email === 'wikus77@hotmail.it';
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-black/80 to-black/80 border-b border-m1ssion-deep-blue/30 header-safe-area">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo and Brand */}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <span className="text-white text-lg font-bold bg-gradient-to-r from-purple-400 to-m1ssion-blue bg-clip-text text-transparent">
            M1SSION
          </span>
        </div>
        
        {/* Center section with real-time indicator and Agent Code */}
        <div className="flex sm:flex items-center gap-3">
          <AgentCodeDisplay />
          <RealtimeStatusIndicator isConnected={isConnected} />
        </div>
        
        {/* Right section with profile */}
        <div className="flex items-center gap-4">
           {/* Admin Push Test Link - Only visible to wikus77@hotmail.it */}
           {isAdmin && (
             <button
               onClick={() => {
                 console.log('🔔 ADMIN: Navigating to /push-test');
                 window.location.href = '/push-test';
               }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 rounded-lg transition-all duration-200"
              title="Push Test (Admin Only)"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300 font-medium">Push Test</span>
            </button>
          )}
          
          {/* Profile Dropdown - ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT */}
          <ProfileDropdown
            profileImage={profileImage}
            className="cursor-pointer"
          />
          
          {/* Mobile menu button */}
          <button 
            className="sm:hidden p-2 rounded-full hover:bg-purple-900/20 active:bg-purple-900/40 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5 text-m1ssion-blue" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu (hidden on larger screens) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/90 border-b border-m1ssion-deep-blue/30 py-3 px-4 sm:hidden">
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
            
            {/* Admin Push Test Link - Mobile */}
            {isAdmin && (
              <Button 
                variant="ghost" 
                className="w-full text-left justify-start text-purple-300 border border-purple-500/30" 
                onClick={() => {
                  console.log('🔔 ADMIN MOBILE: Navigating to /push-test');
                  navigate('/push-test');
                  setIsMenuOpen(false);
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Push Test (Admin)
              </Button>
            )}
            
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
