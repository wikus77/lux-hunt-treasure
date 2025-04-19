
import { Home, User, Settings, Calendar, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNavigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-projectx-deep-blue flex justify-around items-center px-2 z-50">
      <Link 
        to="/home" 
        className={`bottom-nav-item ${isActive("/home") ? "active" : ""}`}
      >
        <Home className={`w-6 h-6 ${isActive("/home") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        to="/events" 
        className={`bottom-nav-item ${isActive("/events") ? "active" : ""}`}
      >
        <Calendar className={`w-6 h-6 ${isActive("/events") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Eventi</span>
      </Link>
      
      <Link 
        to="/subscriptions" 
        className={`bottom-nav-item ${isActive("/subscriptions") ? "active" : ""}`}
      >
        <CreditCard className={`w-6 h-6 ${isActive("/subscriptions") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Abbonamenti</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}
      >
        <User className={`w-6 h-6 ${isActive("/profile") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Profilo</span>
      </Link>
      
      <Link 
        to="/settings" 
        className={`bottom-nav-item ${isActive("/settings") ? "active" : ""}`}
      >
        <Settings className={`w-6 h-6 ${isActive("/settings") ? "text-projectx-neon-blue" : ""}`} />
        <span className="text-xs mt-1">Impostazioni</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
