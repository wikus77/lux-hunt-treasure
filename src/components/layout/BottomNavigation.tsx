
import { Home, User, Settings, Calendar, CreditCard, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-projectx-deep-blue flex justify-around items-center px-2 z-50">
      <button 
        onClick={() => handleNavigation("/home")}
        className={`bottom-nav-item ${isActive("/home") ? "active" : ""}`}
      >
        <Home className={`w-6 h-6 ${isActive("/home") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/events")}
        className={`bottom-nav-item ${isActive("/events") ? "active" : ""}`}
      >
        <Calendar className={`w-6 h-6 ${isActive("/events") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Eventi</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/buzz")}
        className={`bottom-nav-item ${isActive("/buzz") ? "active" : ""}`}
      >
        <Zap className={`w-6 h-6 ${isActive("/buzz") ? "text-projectx-pink" : ""}`} />
        <span className="text-xs mt-1">Buzz</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/subscriptions")}
        className={`bottom-nav-item ${isActive("/subscriptions") ? "active" : ""}`}
      >
        <CreditCard className={`w-6 h-6 ${isActive("/subscriptions") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Abbonamenti</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/profile")}
        className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}
      >
        <User className={`w-6 h-6 ${isActive("/profile") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Profilo</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/settings")}
        className={`bottom-nav-item ${isActive("/settings") ? "active" : ""}`}
      >
        <Settings className={`w-6 h-6 ${isActive("/settings") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Impostazioni</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
