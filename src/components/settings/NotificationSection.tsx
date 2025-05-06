
import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushNotificationRequest from "@/components/notifications/PushNotificationRequest";

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
  const { isSupported, permission } = usePushNotifications();

  const handlePushToggle = (checked: boolean) => {
    if (checked && permission !== 'granted') {
      // If turning on and permission not granted, show dialog
      setShowPermissionDialog(true);
    } else {
      // If turning off or permission already granted
      setPushNotifications(checked);
    }
  };

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifiche</h2>
      
      <div className="space-y-2">
        <div className="glass-card flex justify-between items-center p-4">
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
          <div className="px-4 py-2 text-xs text-gray-400 italic">
            Le notifiche sono state bloccate. Modifica le impostazioni del browser per attivarle.
          </div>
        )}
        
        <div className="glass-card flex justify-between items-center p-4">
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

      {/* Permission request dialog */}
      <PushNotificationRequest 
        open={showPermissionDialog} 
        onOpenChange={setShowPermissionDialog} 
      />
    </section>
  );
};

export default NotificationSection;
