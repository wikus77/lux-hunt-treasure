
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

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl border-t flex justify-around items-center px-2 z-50 dark:bg-black/80 dark:border-gray-800 light:bg-white/90 light:border-gray-200">
      <button 
        onClick={() => handleNavigation("/home")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/home") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/events")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/events") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] mt-1">Eventi</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/buzz")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/buzz") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <Zap className="w-5 h-5" />
        <span className="text-[10px] mt-1">Buzz</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/subscriptions")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/subscriptions") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span className="text-[10px] mt-1">Abbonamenti</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/profile")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/profile") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-1">Profilo</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("/settings")}
        className={`flex flex-col items-center justify-center p-2 transition-colors ${
          isActive("/settings") 
            ? "dark:text-red-500 light:text-indigo-600" 
            : "dark:text-gray-400 light:text-gray-500"
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] mt-1">Impostazioni</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
