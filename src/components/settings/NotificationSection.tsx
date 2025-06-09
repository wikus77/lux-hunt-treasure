
import { Bell, BellOff, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushNotificationRequest from "@/components/notifications/PushNotificationRequest";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface NotificationSectionProps {
  pushNotifications: boolean;
  emailNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
}

const NotificationSection = ({
  pushNotifications,
  emailNotifications,
  setPushNotifications,
  setEmailNotifications
}: NotificationSectionProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isNotificationSectionOpen, setIsNotificationSectionOpen] = useState(false);
  const { isSupported, permission } = usePushNotifications();

  const handlePushToggle = (checked: boolean) => {
    if (checked && permission !== 'granted') {
      setShowPermissionDialog(true);
    } else {
      setPushNotifications(checked);
    }
  };

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible open={isNotificationSectionOpen} onOpenChange={setIsNotificationSectionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Bell className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              Notifiche
            </h2>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isNotificationSectionOpen ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-4 text-white">
              <div className="flex justify-between items-center border-b border-white/10 pb-2 p-3 rounded-lg border border-white/10 bg-black/20">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-white" />
                  <span className="text-white">Notifiche Push</span>
                </div>
                
                {isSupported === false ? (
                  <div className="text-xs text-projectx-pink">Non supportate</div>
                ) : permission === 'denied' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-projectx-pink">Bloccate</span>
                    <BellOff className="h-4 w-4 text-projectx-pink" />
                  </div>
                ) : (
                  <Switch 
                    checked={pushNotifications} 
                    onCheckedChange={handlePushToggle}
                    className="bg-black border border-white data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                )}
              </div>
              
              {permission === 'denied' && (
                <div className="px-4 py-2 text-xs text-gray-400 italic rounded-lg border border-white/10 bg-black/20">
                  Le notifiche sono state bloccate. Modifica le impostazioni del browser per attivarle.
                </div>
              )}
              
              <div className="flex justify-between items-center border-b border-white/10 pb-2 p-3 rounded-lg border border-white/10 bg-black/20">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-white" />
                  <span className="text-white">Notifiche Email</span>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                  className="bg-black border border-white data-[state=checked]:bg-white data-[state=checked]:border-white"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <PushNotificationRequest 
        open={showPermissionDialog} 
        onOpenChange={setShowPermissionDialog} 
      />
    </div>
  );
};

export default NotificationSection;
