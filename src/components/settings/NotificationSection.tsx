
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
            <Bell className="h-5 w-5 mr-3 text-white" />
            <span className="text-white">Notifiche Push</span>
          </div>
          <Switch 
            checked={pushNotifications} 
            onCheckedChange={setPushNotifications}
            className="bg-black border border-white data-[state=checked]:bg-white data-[state=checked]:border-white"
          />
        </div>
        
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
    </section>
  );
};

export default NotificationSection;
