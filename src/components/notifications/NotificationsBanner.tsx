// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
import React, { useEffect, useRef, useState } from "react";
import NotificationItem from "./NotificationItem";
import NotificationDialog from "./NotificationDialog";
import { Bell, X } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationsBannerProps {
  open: boolean;
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

const SWIPE_THRESHOLD = 64;

const NotificationsBanner: React.FC<NotificationsBannerProps> = ({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  // swipe gesture state
  const dragging = useRef(false);
  const initialY = useRef<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Swipe up per chiusura
  useEffect(() => {
    const banner = bannerRef.current;

    function handleTouchStart(e: TouchEvent) {
      initialY.current = e.touches[0].clientY;
      dragging.current = true;
    }
    function handleTouchMove(e: TouchEvent) {
      if (!dragging.current || initialY.current == null) return;
      const dist = initialY.current - e.touches[0].clientY;
      if (dist > SWIPE_THRESHOLD) {
        onClose();
        dragging.current = false;
        initialY.current = null;
      }
    }
    function handleTouchEnd() {
      dragging.current = false;
      initialY.current = null;
    }
    function handleMouseDown(e: MouseEvent) {
      initialY.current = e.clientY;
      dragging.current = true;
    }
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || initialY.current == null) return;
      const dist = initialY.current - e.clientY;
      if (dist > SWIPE_THRESHOLD) {
        onClose();
        dragging.current = false;
        initialY.current = null;
      }
    }
    function handleMouseUp() {
      dragging.current = false;
      initialY.current = null;
    }

    if (banner && open) {
      banner.addEventListener('touchstart', handleTouchStart, { passive: true });
      banner.addEventListener('touchmove', handleTouchMove, { passive: true });
      banner.addEventListener('touchend', handleTouchEnd);
      banner.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (banner) {
        banner.removeEventListener('touchstart', handleTouchStart);
        banner.removeEventListener('touchmove', handleTouchMove);
        banner.removeEventListener('touchend', handleTouchEnd);
        banner.removeEventListener('mousedown', handleMouseDown);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [open, onClose]);

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  return (
    <div
      ref={bannerRef}
      className={`fixed left-0 right-0 z-[9999] flex justify-center transition-all duration-500 cursor-grab select-none ${
        open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0 pointer-events-none"
      }`}
      style={{ 
        top: 'env(safe-area-inset-top, 0px)',
        transitionProperty: "transform, opacity" 
      }}
    >
      <div className="relative w-full max-w-lg mx-auto rounded-[20px] bg-[#1C1C1F] backdrop-blur-md shadow-2xl mt-2 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(54, 94, 255, 0.15) 100%)',
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Top gradient border */}
        <div 
          className="absolute top-0 left-0 w-full h-[1px]"
          style={{
            background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
          }}
        />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-white mr-3" />
              <span className="font-orbitron font-semibold text-white text-lg">Notifiche</span>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={onClose}
              aria-label="Chiudi"
            >
              <X className="w-5 h-5 text-white/60 hover:text-white"/>
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 rounded-[16px] bg-[#0a0a0a]/30">
                <p className="text-white/70 text-sm">Non hai notifiche.</p>
              </div>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onSelect={() => handleSelectNotification(notification)}
                  onDelete={() => onDeleteNotification(notification.id)}
                />
              ))}
            </div>
          )}
          
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-center mt-4 pt-4 border-t border-white/10">
              <button
                onClick={onMarkAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white rounded-full text-xs hover:shadow-lg transition-all font-orbitron"
              >
                Segna tutte come lette
              </button>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/60 text-center font-orbitron">
              Chiudi con <span className="text-white/80 font-medium">Swipe Up</span> su mobile/tablet o trascina con il mouse.
            </p>
          </div>
        </div>
      </div>
      
      <NotificationDialog 
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
};

export default NotificationsBanner;
