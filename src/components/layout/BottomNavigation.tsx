
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

  // Classe per il gradiente viola sulle icone attive
  const gradientIconClass = "active-gradient-icon";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 z-50 flex justify-around items-center px-2 transition-colors duration-200 backdrop-blur-lg bg-black/70 border-t border-projectx-deep-blue">
      <button
        onClick={() => handleNavigation("/home")}
        className={`bottom-nav-item ${isActive("/home") ? "active" : ""}`}
        aria-label="Home"
      >
        <Home
          className={`w-6 h-6 ${isActive("/home") ? gradientIconClass : ""}`}
          color={isActive("/home") ? "url(#gradient-home)" : "#bbb"}
        />
      </button>
      <button
        onClick={() => handleNavigation("/events")}
        className={`bottom-nav-item ${isActive("/events") ? "active" : ""}`}
        aria-label="Eventi"
      >
        <Calendar
          className={`w-6 h-6 ${isActive("/events") ? gradientIconClass : ""}`}
          color={isActive("/events") ? "url(#gradient-events)" : "#bbb"}
        />
      </button>
      <button
        onClick={() => handleNavigation("/buzz")}
        className={`bottom-nav-item ${isActive("/buzz") ? "active" : ""}`}
        aria-label="Buzz"
      >
        <Circle
          className={`w-6 h-6 ${isActive("/buzz") ? gradientIconClass : ""}`}
          color={isActive("/buzz") ? "url(#gradient-buzz)" : "#bbb"}
        />
      </button>
      <button
        onClick={() => handleNavigation("/subscriptions")}
        className={`bottom-nav-item ${isActive("/subscriptions") ? "active" : ""}`}
        aria-label="Abbonamenti"
      >
        <CreditCard
          className={`w-6 h-6 ${isActive("/subscriptions") ? gradientIconClass : ""}`}
          color={isActive("/subscriptions") ? "url(#gradient-subscriptions)" : "#bbb"}
        />
      </button>
      <button
        onClick={() => handleNavigation("/profile")}
        className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}
        aria-label="Profilo"
      >
        <User
          className={`w-6 h-6 ${isActive("/profile") ? gradientIconClass : ""}`}
          color={isActive("/profile") ? "url(#gradient-profile)" : "#bbb"}
        />
      </button>
      <button
        onClick={() => handleNavigation("/settings")}
        className={`bottom-nav-item ${isActive("/settings") ? "active" : ""}`}
        aria-label="Impostazioni"
      >
        <MoreVertical
          className={`w-6 h-6 ${isActive("/settings") ? gradientIconClass : ""}`}
          color={isActive("/settings") ? "url(#gradient-settings)" : "#bbb"}
        />
      </button>

      {/* SVG Gradients (iniettati una sola volta per tutta la barra) */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient-home" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
          <linearGradient id="gradient-events" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
          <linearGradient id="gradient-buzz" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
          <linearGradient id="gradient-subscriptions" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
          <linearGradient id="gradient-profile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
          <linearGradient id="gradient-settings" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#9b87f5" offset="0%" />
            <stop stopColor="#7E69AB" offset="100%" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BottomNavigation;

