
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import SubscriptionCard from "./SubscriptionCard";
import { useProfileSubscription } from "@/hooks/profile/useProfileSubscription";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPlansProps {
  selected: string;
  setSelected: (plan: string) => void;
}

export const SubscriptionPlans = ({ selected, setSelected }: SubscriptionPlansProps) => {
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
  // TASK 1 — Sincronizzazione Piano Attivo da Supabase
  const { subscription, upgradeSubscription } = useProfileSubscription();

  const getSubscriptionFeatures = (type: string) => {
    switch (type) {
      case "Base":
        return [
          { text: "Accesso gratuito agli eventi mensili" },
          { text: "1 indizio incluso a settimana" },
          { text: "Partecipazione alle estrazioni base" }
        ];
      case "Silver":
        return [
          { text: "Tutti i vantaggi Base" },
          { text: "3 indizi premium aggiuntivi a settimana" },
          { text: "Accesso anticipato ai nuovi eventi" },
          { text: "Badge Silver nel profilo" }
        ];
      case "Gold":
        return [
          { text: "Tutti i vantaggi Silver" },
          { text: "Indizi illimitati durante l'evento" },
          { text: "Partecipazione alle estrazioni Gold" },
          { text: "Badge Gold nel profilo" }
        ];
      case "Black":
        return [
          { text: "Tutti i vantaggi Gold" },
          { text: "Accesso VIP ad eventi esclusivi" },
          { text: "Premi misteriosi aggiuntivi" },
          { text: "Badge Black nel profilo" }
        ];
      default:
        return [];
    }
  };
  
  // TASK A — ABILITARE BOTTONE Passa a <Piano>
  // TASK B — FLUSSO handleUpgrade(tier)
  const handleUpdatePlan = async (plan: string) => {
    if (plan === selected) {
      toast({
        title: "Piano già attivo",
        description: `Sei già abbonato al piano ${plan}`
      });
      return;
    }
    
    try {
      // TASK B — FLUSSO handleUpgrade(tier)
      if (plan === "Silver" || plan === "Gold" || plan === "Black") {
        // Redirect to payment page for upgrade
        navigate(`/subscriptions/${plan.toLowerCase()}`);
      } else if (plan === "Base") {
        // For Base plan (free), update directly via hook
        await upgradeSubscription(plan);
        setSelected(plan);
        
        // TASK D — FUNZIONE updateUserTierInSupabase(tier)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ 
            subscription_tier: plan 
          }).eq('id', user.id);
          
          localStorage.setItem("userTier", plan);
        }
        
        toast({
          title: "✅ Upgrade completato con successo!",
          description: `Il tuo abbonamento è stato aggiornato a ${plan}`
        });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "❌ Errore durante l'upgrade. Riprova.",
        description: "Si è verificato un errore durante l'aggiornamento del piano.",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelSubscription = () => {
    if (selected === "Base") {
      toast({
        title: "Nessun abbonamento attivo",
        description: "Hai già il piano base gratuito"
      });
      return;
    }
    
    upgradeSubscription("Base");
    setSelected("Base");
    toast({
      title: "Abbonamento cancellato",
      description: "Il tuo abbonamento è stato cancellato con successo"
    });
  };

  return (
    <section className="w-full px-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SubscriptionCard
          title="Base"
          price="Gratis"
          period="mese"
          features={getSubscriptionFeatures("Base")}
          isPopular={false}
          ctaText="Piano Attuale"
          type="Base"
          onClick={() => handleUpdatePlan("Base")}
          isActive={selected === "Base"}
        />
        <SubscriptionCard
          title="Silver"
          price="€3,99"
          period="mese"
          features={getSubscriptionFeatures("Silver")}
          isPopular={false}
          ctaText={selected === "Silver" ? "Piano Attuale" : "Passa a Silver"}
          type="Silver"
          onClick={() => handleUpdatePlan("Silver")}
          isActive={selected === "Silver"}
        />
        <SubscriptionCard
          title="Gold"
          price="€6,99"
          period="mese"
          features={getSubscriptionFeatures("Gold")}
          isPopular={true}
          ctaText={selected === "Gold" ? "Piano Attuale" : "Passa a Gold"}
          type="Gold"
          onClick={() => handleUpdatePlan("Gold")}
          isActive={selected === "Gold"}
        />
        <SubscriptionCard
          title="Black"
          price="€9,99"
          period="mese"
          features={getSubscriptionFeatures("Black")}
          isPopular={false}
          ctaText={selected === "Black" ? "Piano Attuale" : "Passa a Black"}
          type="Black"
          onClick={() => handleUpdatePlan("Black")}
          isActive={selected === "Black"}
        />
      </div>
      
      {selected !== "Base" && (
        <div className="flex justify-center mb-10">
          <Button 
            variant="outline"
            onClick={handleCancelSubscription}
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            Cancella abbonamento
          </Button>
        </div>
      )}
    </section>
  );
};
