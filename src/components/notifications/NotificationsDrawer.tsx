
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NotificationItem from "./NotificationItem";
import NotificationDialog from "./NotificationDialog";
import { Bell, MapPin, Car, Trophy, Circle, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type NotificationCategory = "all" | "leaderboard" | "buzz" | "map" | "weekly" | "generic";

const categoryMapping = {
  all: "",
  leaderboard: NOTIFICATION_CATEGORIES.LEADERBOARD,
  buzz: NOTIFICATION_CATEGORIES.BUZZ,
  map: NOTIFICATION_CATEGORIES.MAP_BUZZ,
  weekly: NOTIFICATION_CATEGORIES.WEEKLY,
  generic: NOTIFICATION_CATEGORIES.GENERIC
};

const NotificationsDrawer = ({ open, onOpenChange }: NotificationsDrawerProps) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const { notifications, unreadCount, markAllAsRead, reloadNotifications, deleteNotification } = useNotifications();

  // FIXED: Reload notifications when the drawer opens and every 5 seconds
  useEffect(() => {
    if (open) {
      console.log("📱 DRAWER: Opened, forcing reload");
      reloadNotifications();
      
      // FIXED: Auto-refresh every 5 seconds while drawer is open
      const interval = setInterval(() => {
        console.log("🔄 DRAWER: Auto-refreshing notifications");
        reloadNotifications();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [open, reloadNotifications]);

  const handleMarkAllAsRead = () => {
    console.log("✅ DRAWER: Marking all notifications as read");
    markAllAsRead();
  };

  const handleSelectNotification = (notification: Notification) => {
    console.log("👁️ DRAWER: Selected notification:", notification);
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = (id: string) => {
    console.log("🗑️ DRAWER: Deleting notification:", id);
    deleteNotification(id);
  };

  // FIXED: Manual reload button handler
  const handleManualReload = () => {
    console.log("🔄 DRAWER: Manual reload requested");
    reloadNotifications();
  };

  // Filter notifications based on selected category
  const filteredNotifications = activeCategory === "all" 
    ? notifications 
    : notifications.filter(n => n.type === categoryMapping[activeCategory]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md w-full bg-projectx-deep-blue p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-1">
            <DialogTitle className="flex items-center gap-1 text-lg">
              <Bell className="h-5 w-5 mr-1" />
              Notifiche
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-projectx-pink rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
              {/* FIXED: Manual reload button in header */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualReload}
                className="ml-auto p-1 h-6 w-6"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tutte le notifiche ricevute di recente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-3 py-2">
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveCategory(value as NotificationCategory)}>
              <TabsList className="bg-black/40 p-1 w-full grid grid-cols-6 h-auto">
                <TabsTrigger value="all" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Bell className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Tutti</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Trophy className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Classifica</span>
                </TabsTrigger>
                <TabsTrigger value="buzz" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Circle className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Buzz</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <MapPin className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Mappa</span>
                </TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Calendar className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Settimanale</span>
                </TabsTrigger>
                <TabsTrigger value="generic" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Bell className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Altre</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory} className="mt-2 px-3 max-h-[50vh] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Non hai notifiche in questa categoria.</p>
                    {/* FIXED: Reload button in empty state */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualReload}
                      className="mt-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Ricarica
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications
                      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
                      .map((notification) => (
                        <NotificationItem 
                          key={notification.id}
                          notification={notification}
                          onSelect={() => handleSelectNotification(notification)}
                          onDelete={() => handleDeleteNotification(notification.id)}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <div className="text-center mt-2 mb-4">
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead} 
                className="bg-gradient-to-r from-projectx-blue/20 to-projectx-pink/20 hover:from-projectx-blue/30 hover:to-projectx-pink/30 border-projectx-deep-blue">
                Segna tutte come lette
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
};

export default NotificationsDrawer;
