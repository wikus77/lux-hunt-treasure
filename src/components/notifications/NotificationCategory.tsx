
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import type { Notification } from "@/hooks/useNotifications";
import { getCategoryInfo } from "@/utils/notificationCategories";
import { GlassModal } from "@/components/ui/GlassModal";

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CATEGORY COMPONENT (with Glass Modal)
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Compact Card - Tap to open modal */}
      <motion.div
        className="m1-relief rounded-[20px] transition-all duration-300 hover:shadow-lg mb-4 relative overflow-hidden cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleOpenModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated glow strip */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
            style={{
              animation: 'slideGlowNotif 3s ease-in-out infinite',
              width: '200%',
              left: '-100%'
            }}
          />
        </div>
        <style>{`
          @keyframes slideGlowNotif {
            0% { transform: translateX(0); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
        
        {/* Category Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${getAccentColor()}20`, border: `1px solid ${getAccentColor()}40` }}
            >
              <Bell className="w-5 h-5" style={{ color: getAccentColor() }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white font-orbitron">
                {categoryInfo.title}
              </h3>
              <p className="text-sm text-white/60">
                {notifications.length} {notifications.length === 1 ? 'notifica' : 'notifiche'}
                {unreadCount > 0 && (
                  <span 
                    className="ml-2 px-2 py-0.5 text-white text-xs rounded-full"
                    style={{ background: `linear-gradient(135deg, ${getAccentColor()} 0%, #FC1EFF 100%)` }}
                  >
                    {unreadCount} nuove
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <ChevronDown className="w-4 h-4 text-white/40" />
        </div>
      </motion.div>

      {/* Glass Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accentColor={getAccentColor()}
        title={categoryInfo.title}
        subtitle={`${notifications.length} ${notifications.length === 1 ? 'notifica' : 'notifiche'}${unreadCount > 0 ? ` • ${unreadCount} non lette` : ''}`}
      >
        {/* Stats Summary */}
        <div 
          className="rounded-2xl p-4 mb-5"
          style={{
            background: `linear-gradient(135deg, ${getAccentColor()}15 0%, rgba(0, 209, 255, 0.05) 100%)`,
            border: `1px solid ${getAccentColor()}25`,
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: getAccentColor() }}>{notifications.length}</p>
              <p className="text-xs text-white/50 mt-1">Totali</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">{unreadCount}</p>
              <p className="text-xs text-white/50 mt-1">Non lette</p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <NotificationItem
                  notification={notification}
                  onSelect={() => onSelect(notification.id)}
                  onDelete={() => onDelete(notification.id)}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Bell className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 mb-2">Nessuna notifica</p>
              <p className="text-sm text-white/40">Le nuove notifiche appariranno qui</p>
            </div>
          )}
        </div>
      </GlassModal>
    </>
  );
};

export default NotificationCategory;
