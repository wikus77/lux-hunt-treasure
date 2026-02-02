
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Bell } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import { getCategoryInfo } from "@/utils/notificationCategories";
import { NotificationCategoryFlipOverlay } from "./NotificationCategoryFlipOverlay";
import { NotificationCategoryContent } from "./NotificationCategoryContent";

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CATEGORY COMPONENT - REVOLUT STYLE FULLSCREEN MODAL
// ═══════════════════════════════════════════════════════════════════════════
interface NotificationCategoryProps {
  category: string;
  notifications: Notification[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCategory: React.FC<NotificationCategoryProps> = ({
  category,
  notifications,
  onSelect,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const categoryInfo = getCategoryInfo(category);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get accent color based on category
  const getAccentColor = () => {
    switch (category) {
      case 'buzz': return '#3B82F6';
      case 'leaderboard': return '#FBBF24';
      case 'map_buzz': return '#10B981';
      case 'weekly': return '#A855F7';
      case 'alert':
      case 'critical': return '#EF4444';
      default: return '#00D1FF';
    }
  };

  const handleOpenModal = (e: React.MouseEvent<HTMLDivElement>) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 🎨 SOFT NATIVE: Clean notification card */}
      <motion.div
        className="sn-card mb-4 relative overflow-hidden cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleOpenModal}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Category Header - 🎨 SOFT NATIVE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="sn-list-row-icon"
              style={{ background: `${getAccentColor()}12`, borderRadius: '12px' }}
            >
              <Bell className="w-5 h-5" style={{ color: getAccentColor() }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--sn-text-primary)' }}>
                {categoryInfo.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--sn-text-secondary)' }}>
                {notifications.length} {notifications.length === 1 ? 'notifica' : 'notifiche'}
                {unreadCount > 0 && (
                  <span 
                    className="ml-2 sn-badge"
                    style={{ background: getAccentColor() }}
                  >
                    {unreadCount} nuove
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--sn-text-tertiary)' }} />
        </div>
      </motion.div>

      {/* Fullscreen Modal - REVOLUT STYLE */}
      <NotificationCategoryFlipOverlay
        open={isModalOpen}
        originRect={originRect}
        onClose={() => setIsModalOpen(false)}
      >
        <NotificationCategoryContent
          title={categoryInfo.title}
          notifications={notifications}
          unreadCount={unreadCount}
          accentColor={getAccentColor()}
          onClose={() => setIsModalOpen(false)}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </NotificationCategoryFlipOverlay>
    </>
  );
};

export default NotificationCategory;
