
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  MapPin, 
  Circle, 
  AtSign,
  Trophy
} from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();

  // Check if current route matches the nav item
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const iconColor = "#00D1FF"; // Consistent neon blue color for all icons
  const iconSize = 24;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-t border-white/10 safe-padding-bottom">
      <div className="max-w-md mx-auto px-2 py-1">
        <div className="flex items-center justify-around">
          <Link 
            to="/" 
            className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <div className="p-2">
              <Home 
                size={iconSize} 
                color={isActive('/') ? iconColor : undefined}
                className={`transition-all ${isActive('/') ? 'active-gradient-icon' : ''}`}
              />
            </div>
            <span className="text-xs">Home</span>
          </Link>
          
          <Link 
            to="/map" 
            className={`bottom-nav-item ${isActive('/map') ? 'active' : ''}`}
          >
            <div className="p-2">
              <MapPin 
                size={iconSize} 
                color={isActive('/map') ? iconColor : undefined}
                className={`transition-all ${isActive('/map') ? 'active-gradient-icon' : ''}`}
              />
            </div>
            <span className="text-xs">Mappa</span>
          </Link>
          
          <Link 
            to="/buzz" 
            className={`bottom-nav-item ${isActive('/buzz') ? 'active' : ''}`}
          >
            <div className="p-2">
              <Circle 
                size={iconSize} 
                color={isActive('/buzz') ? iconColor : undefined}
                className={`transition-all ${isActive('/buzz') ? 'active-gradient-icon' : ''}`}
              />
            </div>
            <span className="text-xs">Buzz</span>
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={`bottom-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            <div className="p-2">
              <Trophy 
                size={iconSize} 
                color={isActive('/leaderboard') ? iconColor : undefined}
                className={`transition-all ${isActive('/leaderboard') ? 'active-gradient-icon' : ''}`}
              />
            </div>
            <span className="text-xs">Classifica</span>
          </Link>
          
          <Link 
            to="/notifications" 
            className={`bottom-nav-item ${isActive('/notifications') ? 'active' : ''}`}
          >
            <div className="p-2">
              <AtSign 
                size={iconSize} 
                color={isActive('/notifications') ? iconColor : undefined}
                className={`transition-all ${isActive('/notifications') ? 'active-gradient-icon' : ''}`}
              />
            </div>
            <span className="text-xs">Notifiche</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
