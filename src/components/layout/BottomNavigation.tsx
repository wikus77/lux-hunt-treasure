
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Bell, User, Award } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-black/80 backdrop-blur-sm border-t border-projectx-deep-blue/30">
      <div className="grid h-full grid-cols-5 mx-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Home
            className={`w-6 h-6 mb-1 ${
              isActive("/") || isActive("/home")
                ? "text-projectx-neon-blue"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/") || isActive("/home")
                ? "text-projectx-neon-blue"
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
              isActive("/map") ? "text-projectx-neon-blue" : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/map") ? "text-projectx-neon-blue" : "text-gray-400"
            }`}
          >
            Map
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/stats")}
          className="flex flex-col items-center justify-center press-effect"
        >
          <Award
            className={`w-6 h-6 mb-1 ${
              isActive("/stats") ? "text-projectx-neon-blue" : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/stats") ? "text-projectx-neon-blue" : "text-gray-400"
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
                ? "text-projectx-neon-blue"
                : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/notifications")
                ? "text-projectx-neon-blue"
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
              isActive("/profile") ? "text-projectx-neon-blue" : "text-gray-400"
            }`}
          />
          <span
            className={`text-xs ${
              isActive("/profile") ? "text-projectx-neon-blue" : "text-gray-400"
            }`}
          >
            Profilo
          </span>
        </button>
      </div>
    </div>
  );
}
