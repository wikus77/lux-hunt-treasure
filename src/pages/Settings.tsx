
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings as SettingsIcon, Bell, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive",
      });
    }
  };

  const settingsSections = [
    {
      title: "Informazioni Personali",
      icon: User,
      items: [
        {
          label: "Modifica informazioni personali",
          action: () => navigate("/personal-info"),
          hasArrow: true
        }
      ]
    },
    {
      title: "Notifiche",
      icon: Bell,
      items: [
        {
          label: "Notifiche Push",
          toggle: true,
          value: pushNotifications,
          onChange: setPushNotifications
        },
        {
          label: "Notifiche Email",
          toggle: true,
          value: emailNotifications,
          onChange: setEmailNotifications
        }
      ]
    },
    {
      title: "Audio",
      icon: SettingsIcon,
      items: [
        {
          label: "Effetti Sonori",
          toggle: true,
          value: soundEffects,
          onChange: setSoundEffects
        }
      ]
    },
    {
      title: "Abbonamento",
      icon: CreditCard,
      items: [
        {
          label: "Gestisci abbonamento",
          action: () => navigate("/subscriptions"),
          hasArrow: true
        }
      ]
    },
    {
      title: "Privacy e Sicurezza",
      icon: Shield,
      items: [
        {
          label: "Privacy Policy",
          action: () => navigate("/privacy-policy"),
          hasArrow: true
        },
        {
          label: "Termini di Servizio",
          action: () => navigate("/terms"),
          hasArrow: true
        }
      ]
    },
    {
      title: "Supporto",
      icon: HelpCircle,
      items: [
        {
          label: "Come funziona",
          action: () => navigate("/how-it-works"),
          hasArrow: true
        },
        {
          label: "Contatti",
          action: () => navigate("/contacts"),
          hasArrow: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold text-white">Impostazioni</h1>
      </header>

      <div className="p-4 space-y-4">
        {settingsSections.map((section, sectionIndex) => {
          const IconComponent = section.icon;
          return (
            <div key={sectionIndex} className="glass-card rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className="h-5 w-5 text-projectx-neon-blue" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-white">{item.label}</span>
                    
                    {item.toggle ? (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                        className="data-[state=checked]:bg-projectx-neon-blue"
                      />
                    ) : item.hasArrow ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="text-white hover:bg-white/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Logout Button */}
        <div className="glass-card rounded-lg">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Disconnetti
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
