
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifiche</h2>
      
      <div className="space-y-2">
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-3 text-projectx-pink" />
            <span>Notifiche Push</span>
          </div>
          <Switch 
            checked={pushNotifications} 
            onCheckedChange={setPushNotifications} 
          />
        </div>
        
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-3 text-projectx-pink" />
            <span>Notifiche Email</span>
          </div>
          <Switch 
            checked={emailNotifications} 
            onCheckedChange={setEmailNotifications} 
          />
        </div>
      </div>
    </section>
  );
};

export default NotificationSection;
