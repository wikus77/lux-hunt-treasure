
import { useState } from "react";
import { Bell, ChevronRight, LogOut, Moon, Shield, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logout effettuato",
      description: "La tua sessione è stata chiusa con successo."
    });
    
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Impostazioni</h1>
      </header>

      {/* Account Settings */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Account</h2>
        
        <div className="space-y-2">
          <div className="glass-card flex justify-between items-center p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Informazioni Personali</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="glass-card flex justify-between items-center p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Privacy e Sicurezza</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Notification Settings */}
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

      {/* Appearance Settings */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Aspetto</h2>
        
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Moon className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Modalità Scura</span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={setDarkMode} 
          />
        </div>
      </section>

      {/* Logout Button */}
      <section className="p-4">
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Project X v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2025 Project X. Tutti i diritti riservati.
          </p>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Settings;
