
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NotificationItem from "./NotificationItem";
import NotificationDialog from "./NotificationDialog";
import { Bell, MapPin, Car, Home, Briefcase, Tool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type NotificationCategory = "all" | "location" | "car" | "interior" | "exterior" | "equipment";

const NotificationsDrawer = ({ open, onOpenChange }: NotificationsDrawerProps) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const { notifications, unreadCount, markAllAsRead, reloadNotifications } = useNotifications();

  // Define category filters
  const categoryFilters: Record<string, RegExp> = {
    location: /luogo|posizione|dove|zona|area|quartiere|città|regione|coordinate/i,
    car: /auto|veicolo|macchina|automobile|modello|marca|carrozzeria/i,
    interior: /interni|sedili|cruscotto|abitacolo|stereo|console|volante/i,
    exterior: /esterni|vernice|fari|paraurti|portiera|cofano|tetto|cerchi/i,
    equipment: /equipaggiamento|accessori|optional|dotazione|strumento|navigatore|radio/i
  };

  // Filter notifications based on selected category
  const filteredNotifications = activeCategory === "all" 
    ? notifications 
    : notifications.filter(notification => 
        categoryFilters[activeCategory].test(notification.title) || 
        categoryFilters[activeCategory].test(notification.description)
      );

  // Reload notifications when the drawer opens
  useEffect(() => {
    if (open) {
      console.log("Drawer opened, reloading notifications");
      reloadNotifications();
    }
  }, [open, reloadNotifications]);

  const handleMarkAllAsRead = () => {
    console.log("Marking all notifications as read");
    markAllAsRead();
  };

  const handleSelectNotification = (notification: Notification) => {
    console.log("Selected notification:", notification);
    setSelectedNotification(notification);
  };

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
                <TabsTrigger value="location" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <MapPin className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Luogo</span>
                </TabsTrigger>
                <TabsTrigger value="car" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Car className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Auto</span>
                </TabsTrigger>
                <TabsTrigger value="interior" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Home className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Interni</span>
                </TabsTrigger>
                <TabsTrigger value="exterior" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Briefcase className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Esterni</span>
                </TabsTrigger>
                <TabsTrigger value="equipment" className="text-xs py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                  <Tool className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Equip.</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory} className="mt-2 px-3 max-h-[50vh] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Non hai notifiche in questa categoria.</p>
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
