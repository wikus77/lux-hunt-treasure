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
    <div className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-t border-gray-200 dark:border-white/10 flex justify-around items-center px-2 z-50 transition-colors duration-200">
      <button 
        onClick={() => handleNavigation("/home")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/home") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Home</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/events")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/events") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Eventi</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/buzz")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/buzz") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <Zap className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Buzz</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/subscriptions")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/subscriptions") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Abbonamenti</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/profile")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/profile") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Profilo</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/settings")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/settings") 
            ? "text-[#06c] dark:text-white" 
            : "text-[#424245] dark:text-white/60"
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-['Inter']">Impostazioni</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
