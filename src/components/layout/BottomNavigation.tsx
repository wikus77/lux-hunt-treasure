
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Bell, User, Circle, Award } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const gradientClass = "bg-gradient-to-r from-yellow-300 to-green-400";
  const activeTextClass = "bg-gradient-to-r from-yellow-300 to-green-400 text-transparent bg-clip-text";

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-black/80 backdrop-blur-sm border-t border-projectx-deep-blue/30">
      <div className="grid h-full grid-cols-6 mx-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Home
            className={`${isActive("/") || isActive("/home") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            strokeWidth={1.5}
          />
          <span className={isActive("/") || isActive("/home") ? activeTextClass : "text-gray-400"}>
            Home
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/map")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Map
            className={`${isActive("/map") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            strokeWidth={1.5}
          />
          <span className={isActive("/map") ? activeTextClass : "text-gray-400"}>
            Map
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/buzz")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Circle
            className={`${isActive("/buzz") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            fill={isActive("/buzz") ? "url(#gradient)" : "none"}
            strokeWidth={1.5}
          />
          <span className={isActive("/buzz") ? activeTextClass : "text-gray-400"}>
            Buzz
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/stats")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Award
            className={`${isActive("/stats") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            strokeWidth={1.5}
          />
          <span className={isActive("/stats") ? activeTextClass : "text-gray-400"}>
            Stats
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Bell
            className={`${isActive("/notifications") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            strokeWidth={1.5}
          />
          <span className={isActive("/notifications") ? activeTextClass : "text-gray-400"}>
            Notifiche
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <User
            className={`${isActive("/profile") ? "stroke-[url(#gradient)]" : "text-gray-400"}`}
            strokeWidth={1.5}
          />
          <span className={isActive("/profile") ? activeTextClass : "text-gray-400"}>
            Profilo
          </span>
        </button>
      </div>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#FFC300', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#00FF87', stopOpacity:1}} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
