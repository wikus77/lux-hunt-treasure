
import { useState } from 'react';
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import CurrentEventSection from './CurrentEventSection';
import MysteryPrizesSection from './MysteryPrizesSection';
import CluesSection from './CluesSection';
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function HomeContent() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 space-y-8">
      <CurrentEventSection />
      
      <MysteryPrizesSection />
      
      <CluesSection />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Esplora il Tuo Profilo</h2>
        <p className="text-muted-foreground">
          Visualizza e modifica le tue informazioni personali.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={() => setIsProfileModalOpen(true)}>
            Visualizza Profilo
          </Button>
          <SocialShareButtons />
        </div>
        <BriefProfileModal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold gradient-text">Vai alle Impostazioni</h2>
        <p className="text-muted-foreground">
          Configura le tue preferenze e personalizza l'app.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/settings')}>
            Impostazioni
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/stats')} 
            className="bg-black/40 border-projectx-deep-blue/40"
          >
            Statistiche e Classifiche
          </Button>
        </div>
      </section>

      {/* AI Assistant (always visible on all pages) */}
      <AIAssistant />
    </div>
  );
}
