
import React, { useEffect, useRef } from "react";
import NotificationItem from "./NotificationItem";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

interface NotificationsBannerProps {
  open: boolean;
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onRequestReload?: () => void; // facoltativo per sync
}

const SWIPE_THRESHOLD = 64;

const NotificationsBanner: React.FC<NotificationsBannerProps> = ({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllAsRead,
  onRequestReload
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  // Aggiornamento in tempo reale se richiesto dalla prop (es: callback per sync)
  useEffect(() => {
    if (onRequestReload) {
      onRequestReload();  // Chiede il refresh ogni volta che open è true
    }
  }, [open, onRequestReload]);

  // Auto close dopo 5s
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [open, onClose]);

  // Gestione touch/mouse per swipe up per chiudere banner
  useEffect(() => {
    const banner = bannerRef.current;
    let initialY: number | null = null;

    function handleTouchStart(e: TouchEvent) {
      initialY = e.touches[0].clientY;
      dragging.current = true;
    }
    function handleTouchMove(e: TouchEvent) {
      if (!dragging.current || initialY == null) return;
      const distance = initialY - e.touches[0].clientY;
      if (distance > SWIPE_THRESHOLD) {
        onClose();
        initialY = null;
        dragging.current = false;
      }
    }
    function handleTouchEnd() {
      dragging.current = false;
      initialY = null;
    }

    function handleMouseDown(e: MouseEvent) {
      initialY = e.clientY;
      dragging.current = true;
    }
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || initialY == null) return;
      const distance = initialY - e.clientY;
      if (distance > SWIPE_THRESHOLD) {
        onClose();
        initialY = null;
        dragging.current = false;
      }
    }
    function handleMouseUp() {
      dragging.current = false;
      initialY = null;
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
              <NotificationItem key={notification.id} notification={notification} />
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
    </div>
  );
};

export default NotificationsBanner;
