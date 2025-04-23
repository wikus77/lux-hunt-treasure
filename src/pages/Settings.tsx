
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per visualizzare questa pagina."
      });
      navigate('/login');
      return;
    }
    
    // Load profile image
    const savedProfileImage = localStorage.getItem('profileImage');
    setProfileImage(savedProfileImage);
    
    // Load saved settings if available
    const savedPushNotifications = localStorage.getItem('pushNotifications');
    if (savedPushNotifications) {
      setPushNotifications(savedPushNotifications === 'true');
    }
    
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    if (savedEmailNotifications) {
      setEmailNotifications(savedEmailNotifications === 'true');
    }
    
    const savedSoundEffects = localStorage.getItem('soundEffects');
    if (savedSoundEffects) {
      setSoundEffects(savedSoundEffects === 'true');
    }
    
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [navigate]);
  
  useEffect(() => {
    // Save settings whenever they change
    localStorage.setItem('pushNotifications', pushNotifications.toString());
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('soundEffects', soundEffects.toString());
    localStorage.setItem('language', language);
  }, [pushNotifications, emailNotifications, soundEffects, language]);

  const handleLogout = () => {
    // Clear relevant localStorage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    
    toast({
      title: "Logout effettuato",
      description: "La tua sessione è stata chiusa con successo."
    });
    
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="pb-20 min-h-screen w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
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
