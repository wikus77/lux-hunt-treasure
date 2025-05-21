
import { Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import AgentBadge from "@/components/AgentBadge";
import { motion } from "framer-motion";
import DynamicIsland from "@/components/DynamicIsland";

interface UnifiedHeaderProps {
  profileImage?: string | null;
  leftComponent?: React.ReactNode;
  onClickMail?: () => void;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  profileImage,
  leftComponent,
  onClickMail,
}) => {
  const { unreadCount, openNotificationsDrawer } = useNotificationManager();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-backdrop h-[72px] backdrop-blur-xl bg-gradient-to-r from-black/70 via-[#131524]/70 to-black/70"
    >
      <div className="container mx-auto h-full max-w-screen-xl">
        <div className="flex items-center justify-between h-full px-3 sm:px-4">
          {/* Left Section */}
          <div className="flex items-center">
            {leftComponent ? (
              leftComponent
            ) : (
              <Link
                to="/home"
                className="text-xl sm:text-2xl font-orbitron font-bold"
                style={{ 
                  color: "#00D1FF",
                  textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                }}
              >
                M1SSION
              </Link>
            )}
          </div>

          {/* Center - Dynamic Island */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <DynamicIsland />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClickMail || openNotificationsDrawer}
              className="relative rounded-full hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F059FF] rounded-full w-4 h-4 text-xs flex items-center justify-center text-white"
                  style={{
                    boxShadow: "0 0 8px rgba(240, 89, 255, 0.5)"
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {/* Profile Avatar */}
            <Link to="/profile">
              <ProfileAvatar
                profileImage={profileImage}
                className="w-10 h-10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] transition-colors"
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default UnifiedHeader;
