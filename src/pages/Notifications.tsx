
import { useState } from "react";
import { Mail, MapPin, Car, Briefcase, Tool, Home } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDialog from "@/components/notifications/NotificationDialog";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define categories for filtering notifications
type NotificationCategory = "all" | "location" | "car" | "interior" | "exterior" | "equipment";

const Notifications = () => {
  const { notifications, reloadNotifications, markAllAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");

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

  return (
    <div className="min-h-screen bg-black text-white pt-2 px-0 w-full">
      <div className="rounded-lg bg-projectx-deep-blue bg-opacity-80 p-4 mx-2 text-center text-white">
        <div className="flex flex-col space-y-4">
          {/* Main Notifications Header */}
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between py-5 bg-gradient-to-r from-projectx-blue/20 to-projectx-pink/20 hover:from-projectx-blue/30 hover:to-projectx-pink/30 rounded-lg border border-projectx-deep-blue transition-all"
            onClick={reloadNotifications}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-projectx-pink" />
              <span className="text-lg font-semibold">Le tue notifiche</span>
            </div>
            <div>
              {notifications.length > 0 ? (
                <span className="bg-projectx-pink px-2 py-1 rounded-full text-xs">
                  {notifications.length}
                </span>
              ) : null}
            </div>
          </Button>

          {/* Category Navigation */}
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveCategory(value as NotificationCategory)}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="bg-black/40 p-1 w-full flex justify-between">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  <span>Tutti</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="location"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Luogo</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="car"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <Car className="h-4 w-4 mr-1" />
                  <span>Auto</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="interior"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span>Interni</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="exterior"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>Esterni</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="equipment"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink data-[state=active]:text-white"
                >
                  <Tool className="h-4 w-4 mr-1" />
                  <span>Equipaggiamento</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Notification Content */}
            <TabsContent value={activeCategory} className="mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nessuna notifica in questa categoria.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications
                    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onSelect={() => setSelectedNotification(notification)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-projectx-blue/20 to-projectx-pink/20 hover:from-projectx-blue/30 hover:to-projectx-pink/30 border-projectx-deep-blue"
            >
              Segna tutte come lette
            </Button>
          )}
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

export default Notifications;
