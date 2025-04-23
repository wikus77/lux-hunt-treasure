
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Bell, Settings, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const checkUnreadNotifications = () => {
      try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
          const notifications = JSON.parse(stored);
          const count = notifications.filter((n: any) => !n.read).length;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error checking unread notifications:", error);
      }
    };
    
    // Check notifications on mount and set an interval
    checkUnreadNotifications();
    const interval = setInterval(checkUnreadNotifications, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  const isActive = useCallback((path: string) => {
    if (path === "/home" && location.pathname === "/") return true;
    return location.pathname === path;
  }, [location.pathname]);
  
  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-t border-white/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center py-3 px-2">
          <button 
            onClick={() => navigate("/home")}
            className={cn(
              "flex flex-col items-center justify-center w-16",
              isActive("/home") ? "text-projectx-blue" : "text-white/70 hover:text-white"
            )}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => navigate("/map")}
            className={cn(
              "flex flex-col items-center justify-center w-16",
              isActive("/map") ? "text-projectx-blue" : "text-white/70 hover:text-white"
            )}
          >
            <Map className="w-6 h-6" />
            <span className="text-xs mt-1">Mappa</span>
          </button>
          
          <button 
            onClick={() => navigate("/achievements")}
            className={cn(
              "flex flex-col items-center justify-center w-16",
              isActive("/achievements") ? "text-projectx-blue" : "text-white/70 hover:text-white"
            )}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">Traguardi</span>
          </button>
          
          <button 
            onClick={() => navigate("/notifications")}
            className={cn(
              "flex flex-col items-center justify-center w-16 relative",
              isActive("/notifications") ? "text-projectx-blue" : "text-white/70 hover:text-white"
            )}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-projectx-pink text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center p-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="text-xs mt-1">Notifiche</span>
          </button>
          
          <button 
            onClick={() => navigate("/settings")}
            className={cn(
              "flex flex-col items-center justify-center w-16",
              isActive("/settings") ? "text-projectx-blue" : "text-white/70 hover:text-white"
            )}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Impostazioni</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
