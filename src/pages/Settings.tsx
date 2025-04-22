
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import AccountSection from "@/components/settings/AccountSection";
import NotificationSection from "@/components/settings/NotificationSection";
import AppSection from "@/components/settings/AppSection";
import SupportSection from "@/components/settings/SupportSection";

const Settings = () => {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState("Italiano");
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
    <div className="pb-20 min-h-screen w-full">
      <AccountSection />

      <NotificationSection
        pushNotifications={pushNotifications}
        emailNotifications={emailNotifications}
        setPushNotifications={setPushNotifications}
        setEmailNotifications={setEmailNotifications}
      />

      <AppSection
        soundEffects={soundEffects}
        language={language}
        setSoundEffects={setSoundEffects}
      />

      <SupportSection />

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
            M1ssion v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2025 M1ssion. Tutti i diritti riservati.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Settings;
