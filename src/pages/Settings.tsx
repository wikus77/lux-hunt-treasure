
import { useState, useEffect } from "react";
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
  const [volume, setVolume] = useState([75]);
  const [buzzSound, setBuzzSound] = useState('default');
  const { toast } = useToast();

  useEffect(() => {
    const savedSound = localStorage.getItem('buzzSound');
    if (savedSound) {
      setBuzzSound(savedSound);
    }
  }, []);

  const handleSoundChange = (value: string) => {
    setBuzzSound(value);
    localStorage.setItem('buzzSound', value);
    
    const audio = new Audio(getSoundPath(value));
    audio.volume = volume[0] / 100;
    audio.play().catch(e => console.error("Error playing sound:", e));
    
    toast({
      title: "Suono aggiornato",
      description: "Il suono del pulsante Buzz è stato modificato."
    });
  };

  const getSoundPath = (sound: string) => {
    switch (sound) {
      case 'chime':
        return "/sounds/chime.mp3";
      case 'bell':
        return "/sounds/bell.mp3";
      case 'arcade':
        return "/sounds/arcade.mp3";
      default:
        return "/sounds/buzz.mp3";
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    
    const audio = new Audio(getSoundPath(buzzSound));
    audio.volume = newVolume[0] / 100;
    audio.play().catch(e => console.error("Error playing sound:", e));
  };

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
    <div className="pb-20 min-h-screen">
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Impostazioni</h1>
      </header>

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
        volume={volume}
        buzzSound={buzzSound}
        setSoundEffects={setSoundEffects}
        onVolumeChange={handleVolumeChange}
        onSoundChange={handleSoundChange}
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
