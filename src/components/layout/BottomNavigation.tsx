
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Bell, User, Circle, Award } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-black/80 backdrop-blur-sm border-t border-projectx-deep-blue/30">
      <div className="grid h-full grid-cols-6 mx-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Home
            className={`w-6 h-6 mb-1 ${
              isActive("/") || isActive("/home")
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/") || isActive("/home")
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          >
            Home
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/map")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Map
            className={`w-6 h-6 mb-1 ${
              isActive("/map") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/map") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          >
            Map
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/buzz")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Circle
            className={`w-6 h-6 mb-1 ${
              isActive("/buzz") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text" 
                : "text-gray-400"
            }`}
            fill={isActive("/buzz") ? "url(#gradient)" : "none"}
            strokeWidth={isActive("/buzz") ? 1 : 2}
          />
          <svg width="0" height="0" className="hidden">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#FFC300', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#00FF87', stopOpacity:1}} />
              </linearGradient>
            </defs>
          </svg>
          <span
            className={`text-xs ${
              isActive("/buzz") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text" 
                : "text-gray-400"
            }`}
          >
            Buzz
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/stats")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Award
            className={`w-6 h-6 mb-1 ${
              isActive("/stats") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/stats") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          >
            Stats
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Bell
            className={`w-6 h-6 mb-1 ${
              isActive("/notifications")
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/notifications")
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          >
            Notifiche
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <User
            className={`w-6 h-6 mb-1 ${
              isActive("/profile") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/profile") 
                ? "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text"
                : "text-gray-400"
            }`}
          >
            Profilo
          </span>
        </button>
      </div>
    </div>
  );
}
