
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Bell, User, Circle, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 glass-backdrop border-t border-white/10">
      <div className="grid h-full grid-cols-6 max-w-md mx-auto px-2">
        <NavButton 
          icon={<Home className="h-5 w-5" />}
          label="Home"
          isActive={isActive("/") || isActive("/home")}
          onClick={() => navigate("/")}
        />
        
        <NavButton 
          icon={<Map className="h-5 w-5" />}
          label="Map" 
          isActive={isActive("/map")}
          onClick={() => navigate("/map")}
        />
        
        <NavButton 
          icon={<Circle className="h-5 w-5" />} 
          label="Buzz"
          isActive={isActive("/buzz")}
          onClick={() => navigate("/buzz")}
        />
        
        <NavButton 
          icon={<Award className="h-5 w-5" />}
          label="Abbonamenti"
          isActive={isActive("/subscriptions")}
          onClick={() => navigate("/subscriptions")}
        />
        
        <NavButton 
          icon={<Bell className="h-5 w-5" />}
          label="Notifiche"
          isActive={isActive("/notifications")}
          onClick={() => navigate("/notifications")}
        />
        
        <NavButton 
          icon={<User className="h-5 w-5" />}
          label="Profilo"
          isActive={isActive("/profile")}
          onClick={() => navigate("/profile")}
        />
      </div>
      
      {/* Animated top border */}
      <div className="absolute -top-[1px] w-full">
        <div className="line-glow"></div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center press-effect"
      whileTap={{ scale: 0.9 }}
    >
      <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
        <div className={`
          ${isActive 
            ? 'text-cyan-400 filter drop-shadow-[0_0_2px_rgba(0,229,255,0.7)]' 
            : 'text-white/50'
          } transition-colors duration-300
        `}>
          {icon}
        </div>
        <span className={`
          text-xs mt-1
          ${isActive 
            ? 'text-cyan-400 filter drop-shadow-[0_0_2px_rgba(0,229,255,0.7)]' 
            : 'text-white/50'
          } transition-colors duration-300
        `}>
          {label}
        </span>
      </div>
      
      {isActive && (
        <motion.div 
          className="absolute -top-[2px] w-10 h-1 bg-cyan-400 rounded-full"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};
