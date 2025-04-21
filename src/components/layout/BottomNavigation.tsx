import { Home, User, MoreVertical, Calendar, CreditCard, Circle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <div className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl border-t flex justify-around items-center px-2 z-50 transition-colors duration-200 bg-black">
      <button
        onClick={() => handleNavigation("/home")}
        className={`bottom-nav-item ${isActive("/home") ? "active" : ""}`}
        aria-label="Home"
      >
        <Home className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => handleNavigation("/events")}
        className={`bottom-nav-item ${isActive("/events") ? "active" : ""}`}
        aria-label="Eventi"
      >
        <Calendar className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => handleNavigation("/buzz")}
        className={`bottom-nav-item ${isActive("/buzz") ? "active" : ""}`}
        aria-label="Buzz"
      >
        <Circle className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => handleNavigation("/subscriptions")}
        className={`bottom-nav-item ${isActive("/subscriptions") ? "active" : ""}`}
        aria-label="Abbonamenti"
      >
        <CreditCard className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => handleNavigation("/profile")}
        className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}
        aria-label="Profilo"
      >
        <User className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => handleNavigation("/settings")}
        className={`bottom-nav-item ${isActive("/settings") ? "active" : ""}`}
        aria-label="Impostazioni"
      >
        <MoreVertical className="w-6 h-6" />
      </button>
    </div>
  );
};

export default BottomNavigation;
