
import React, { useState, useEffect } from "react";
import { Mail, MapPin, Car, Home, Briefcase, Wrench } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDialog from "@/components/notifications/NotificationDialog";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { motion } from "framer-motion";

// Define categories for filtering notifications
type NotificationCategory = "all" | "location" | "car" | "interior" | "exterior" | "equipment";

const Notifications = () => {
  const { notifications, reloadNotifications, markAllAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");

  // Reload notifications when component mounts
  useEffect(() => {
    reloadNotifications();
  }, [reloadNotifications]);

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
    <div className="min-h-screen bg-[#070818] pb-20 w-full overflow-x-hidden">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="container mx-auto px-4 py-6 max-w-screen-sm">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ 
            color: "#00D1FF",
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}
        >
          LE MIE NOTIFICHE
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl overflow-hidden backdrop-blur-lg border border-[#00D1FF]/20 p-6"
          style={{
            background: "linear-gradient(180deg, rgba(19, 21, 36, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.06)"
          }}
        >
          {notifications.length > 0 ? (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/80 font-medium">Notifiche recenti</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="bg-gradient-to-r from-[#131524]/80 to-black/80 hover:from-[#131524] hover:to-black border-[#00D1FF]/30 hover:border-[#00D1FF]/50 text-white/80"
                  >
                    Segna tutte come lette
                  </Button>
                </div>

                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveCategory(value as NotificationCategory)}>
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="bg-black/40 p-1 w-full flex justify-between">
                      <TabsTrigger 
                        value="all"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        <span>Tutti</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="location"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Luogo</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="car"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <Car className="h-4 w-4 mr-1" />
                        <span>Auto</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="interior"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <Home className="h-4 w-4 mr-1" />
                        <span>Interni</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="exterior"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>Esterni</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="equipment"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#7B2EFF] data-[state=active]:text-white"
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        <span>Equip.</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value={activeCategory} className="mt-6">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-8 text-white/60">
                        <p>Nessuna notifica in questa categoria.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
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
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-xl text-white/80 text-center">Nessuna notifica recente</p>
              <p className="mt-4 text-white/50 text-center">
                Effettua il pagamento e premi il pulsante buzz per ricevere notifiche
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
