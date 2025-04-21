
import { useState, useEffect } from "react";
import { User, Mail, MoreVertical, Circle } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Mock: change with real profileImage
  const profileImage = null; // you can use a default image or the one saved

  // Stato per badge notifiche non lette
  useEffect(() => {
    const checkUnread = () => {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setUnreadCount(parsed.filter((n: any) => !n.read).length);
      } else {
        setUnreadCount(0);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue gap-3">
        {/* Profile image - ridotta */}
        <button
          className="flex items-center"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-projectx-neon-blue" />
            )}
          </div>
        </button>
        {/* Title centered */}
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">M1ssion</h1>

        {/* Mail icon e 3 punti a destra */}
        <div className="flex gap-2">
          <button
            className="p-2 relative rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
            onClick={() => setShowNotifications(true)}
          >
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-projectx-pink text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            className="p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
            onClick={() => navigate("/settings")}
            aria-label="Impostazioni"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <CurrentEventSection />
      <MysteryPrizesSection />
      <CluesSection />

      <BottomNavigation />

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <NotificationsDrawer
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </div>
  );
};

export default Home;
