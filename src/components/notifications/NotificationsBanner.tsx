
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
      className={`fixed left-0 right-0 top-0 z-[9999] flex justify-center transition-all duration-500 cursor-grab select-none ${
        open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0 pointer-events-none"
      }`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div className="relative w-full max-w-lg mx-auto bg-black border border-projectx-blue rounded-b-2xl shadow-2xl mt-2 px-4 py-4 animate-fade-in">
        <div className="flex items-center mb-2">
          <Bell className="w-5 h-5 text-projectx-neon-blue mr-2" />
          <span className="font-bold text-lg flex-1">Notifiche</span>
          <button
            className="text-projectx-neon-blue hover:text-projectx-pink rounded-full p-1 ml-2 border border-projectx-neon-blue hover:bg-projectx-neon-blue/20 transition-colors"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Non hai notifiche.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
          <div className="text-center mt-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs px-3 py-1 rounded-lg border border-projectx-neon-blue hover:bg-projectx-neon-blue/10 transition active:scale-95"
            >
              Segna tutte come lette
            </button>
          </div>
        )}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Chiudi con <b>Swipe Up</b> su mobile/tablet o trascina con il mouse.
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
