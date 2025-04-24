
import { useState } from 'react';
import { InteractiveButton } from "@/components/ui/interactive-button";
import { ExpandingMenu } from "@/components/ui/expanding-menu";
import { AnimatedToggle } from "@/components/ui/animated-toggle";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import InstagramStyleDrawer from "@/components/profile/InstagramStyleDrawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { useBuzzSound } from '@/hooks/useBuzzSound';
import BuzzButton from '@/components/buzz/BuzzButton';
import { useNavigate } from 'react-router-dom';

export default function HomeContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClueUnlock = () => {
    if (unlockedClues < 1000) {
      setUnlockedClues(unlockedClues + 1);
    } else {
      toast({
        title: "Massimo raggiunto",
        description: "Hai sbloccato il numero massimo di indizi per questo evento.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Prova le Nuove Interazioni</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-4 space-y-4">
            <h3 className="text-lg font-semibold">Pulsanti Interattivi</h3>
            <div className="space-x-4">
              <InteractiveButton>
                Click Me!
              </InteractiveButton>
              
              <InteractiveButton variant="outline">
                Outline
              </InteractiveButton>
              
              <InteractiveButton variant="ghost">
                Ghost
              </InteractiveButton>
            </div>
          </div>

          <div className="glass-card p-4 space-y-4">
            <h3 className="text-lg font-semibold">Menu Espandibile</h3>
            <ExpandingMenu title="Apri Menu">
              <div className="space-y-2">
                <p>Contenuto del menu</p>
                <InteractiveButton size="sm">
                  Azione
                </InteractiveButton>
              </div>
            </ExpandingMenu>
          </div>

          <div className="glass-card p-4 space-y-4">
            <h3 className="text-lg font-semibold">Toggle Animato</h3>
            <div className="flex items-center space-x-4">
              <AnimatedToggle 
                checked={notificationEnabled}
                onCheckedChange={setNotificationEnabled}
              />
              <span>Notifiche {notificationEnabled ? 'attive' : 'disattivate'}</span>
            </div>
          </div>

          <div className="glass-card p-4 space-y-4">
            <h3 className="text-lg font-semibold">Menu Stile Instagram</h3>
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              className="bg-gradient-to-r from-projectx-pink to-projectx-neon-blue"
            >
              Apri Menu Instagram
            </Button>
            <InstagramStyleDrawer 
              open={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Sblocca Indizi Extra</h2>
        <p className="text-muted-foreground">
          Utilizza il pulsante per sbloccare indizi extra durante gli eventi.
        </p>
        <BuzzButton onBuzzClick={handleClueUnlock} unlockedClues={unlockedClues} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Esplora il Tuo Profilo</h2>
        <p className="text-muted-foreground">
          Visualizza e modifica le tue informazioni personali.
        </p>
        <Button onClick={() => setIsProfileModalOpen(true)}>
          Visualizza Profilo
        </Button>
        <BriefProfileModal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Vai alle Impostazioni</h2>
        <p className="text-muted-foreground">
          Configura le tue preferenze e personalizza l'app.
        </p>
        <Button onClick={() => navigate('/settings')}>
          Impostazioni
        </Button>
      </section>
    </div>
  );
}
