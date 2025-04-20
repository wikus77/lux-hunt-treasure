
import { Home, User, Settings, Calendar, CreditCard, Zap } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl bg-black/80 border-t border-gray-800 flex justify-around items-center px-2 z-50">
      <button 
        onClick={() => handleNavigation("/home")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/home") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/events")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/events") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] mt-1">Eventi</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/buzz")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/buzz") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <Zap className="w-5 h-5" />
        <span className="text-[10px] mt-1">Buzz</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/subscriptions")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/subscriptions") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span className="text-[10px] mt-1">Abbonamenti</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/profile")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/profile") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-1">Profilo</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/settings")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/settings") 
            ? "text-red-500" 
            : "text-gray-400"
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] mt-1">Impostazioni</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
