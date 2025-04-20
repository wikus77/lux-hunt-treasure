import { useState, useEffect } from "react";
import { Bell, ChevronRight, LogOut, Moon, Shield, User, Volume2, Languages, CreditCard, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
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
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Impostazioni</h1>
      </header>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Account</h2>
        
        <div className="space-y-2">
          <div 
            className="glass-card flex justify-between items-center p-4 cursor-pointer"
            onClick={() => navigate('/personal-info')}
          >
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Informazioni Personali</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div 
            className="glass-card flex justify-between items-center p-4 cursor-pointer"
            onClick={() => navigate('/privacy-security')}
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Privacy e Sicurezza</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div 
            className="glass-card flex justify-between items-center p-4 cursor-pointer"
            onClick={() => navigate('/payment-methods')}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Metodi di Pagamento</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </section>

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

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">App</h2>
        
        <div className="space-y-2">
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

          <div className="glass-card flex justify-between items-center p-4">
            <div className="flex items-center">
              <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Effetti Sonori</span>
            </div>
            <Switch 
              checked={soundEffects} 
              onCheckedChange={setSoundEffects} 
            />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center mb-3">
              <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Volume</span>
            </div>
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
            />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center mb-3">
              <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Suono Buzz</span>
            </div>
            
            <RadioGroup value={buzzSound} onValueChange={handleSoundChange}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="default" id="sound-default" />
                <Label htmlFor="sound-default">Default</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => {
                    const audio = new Audio('/sounds/buzz.mp3');
                    audio.volume = volume[0] / 100;
                    audio.play();
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="chime" id="sound-chime" />
                <Label htmlFor="sound-chime">Chime</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => {
                    const audio = new Audio('/sounds/chime.mp3');
                    audio.volume = volume[0] / 100;
                    audio.play();
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="bell" id="sound-bell" />
                <Label htmlFor="sound-bell">Bell</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => {
                    const audio = new Audio('/sounds/bell.mp3');
                    audio.volume = volume[0] / 100;
                    audio.play();
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arcade" id="sound-arcade" />
                <Label htmlFor="sound-arcade">Arcade</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => {
                    const audio = new Audio('/sounds/arcade.mp3');
                    audio.volume = volume[0] / 100;
                    audio.play();
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </RadioGroup>
          </div>

          <div 
            className="glass-card flex justify-between items-center p-4 cursor-pointer"
            onClick={() => navigate('/language-settings')}
          >
            <div className="flex items-center">
              <Languages className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              <span>Lingua</span>
            </div>
            <span className="text-muted-foreground">{language}</span>
          </div>
        </div>
      </section>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Supporto</h2>
        
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Aiuto e FAQ</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </section>

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

      <BottomNavigation />
    </div>
  );
};

export default Settings;
