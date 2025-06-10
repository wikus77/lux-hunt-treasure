
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "./SubscriptionCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useStripePayment } from "@/hooks/useStripePayment";

interface SubscriptionPlansProps {
  selected: string;
  setSelected: (plan: string) => void;
}

export const SubscriptionPlans = ({ selected, setSelected }: SubscriptionPlansProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { availableTiers, currentTier, refetch } = useSubscription();
  const { processSubscription, loading } = useStripePayment();

  const getSubscriptionFeatures = (tierName: string) => {
    const tier = availableTiers.find(t => t.name === tierName);
    if (!tier) return [];

    const features = [
      `${tier.max_weekly_buzz} BUZZ disponibili a settimana`,
      `Attivo nei giorni: ${tier.buzz_days.join(', ')}`
    ];

    switch (tierName) {
      case "Free":
        features.push("Accesso gratuito agli eventi mensili");
        features.push("1 indizio incluso a settimana");
        features.push("Partecipazione alle estrazioni base");
        break;
      case "Silver":
        features.push("Tutti i vantaggi Free");
        features.push("3 indizi premium aggiuntivi a settimana");
        features.push("Accesso anticipato ai nuovi eventi");
        features.push("Badge Silver nel profilo");
        break;
      case "Gold":
        features.push("Tutti i vantaggi Silver");
        features.push("Indizi illimitati durante l'evento");
        features.push("Partecipazione alle estrazioni Gold");
        features.push("Badge Gold nel profilo");
        break;
      case "Black":
        features.push("Tutti i vantaggi Gold");
        features.push("Accesso VIP ad eventi esclusivi");
        features.push("Premi misteriosi aggiuntivi");
        features.push("Badge Black nel profilo");
        break;
    }

    return features.map(feature => ({ text: feature }));
  };
  
  const handleUpdatePlan = async (plan: string) => {
    if (plan === currentTier) {
      toast({
        title: "Piano già attivo",
        description: `Sei già abbonato al piano ${plan}`
      });
      return;
    }
    
    if (plan === "Free") {
      // Handle downgrade to free plan
      localStorage.setItem('subscription_plan', plan);
      setSelected(plan);
      toast({
        title: "Piano aggiornato",
        description: `Il tuo abbonamento è stato aggiornato a ${plan}`
      });
      return;
    }

    try {
      // Process Stripe subscription
      await processSubscription(plan as 'Silver' | 'Gold' | 'Black');
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'elaborazione dell'abbonamento"
      });
    }
  };
  
  const handleCancelSubscription = () => {
    if (currentTier === "Free") {
      toast({
        title: "Nessun abbonamento attivo",
        description: "Hai già il piano base gratuito"
      });
      return;
    }
    
    localStorage.setItem('subscription_plan', "Free");
    setSelected("Free");
    toast({
      title: "Abbonamento cancellato",
      description: "Il tuo abbonamento è stato cancellato con successo"
    });
  };

  useEffect(() => {
    setSelected(currentTier);
  }, [currentTier, setSelected]);

  return (
    <section className="w-full px-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {availableTiers.map((tier) => (
          <SubscriptionCard
            key={tier.id}
            title={tier.name}
            price={tier.price_monthly === 0 ? "Gratis" : `€${tier.price_monthly.toFixed(2)}`}
            period={tier.price_monthly === 0 ? "" : "mese"}
            features={getSubscriptionFeatures(tier.name)}
            isPopular={tier.name === "Gold"}
            ctaText={currentTier === tier.name ? "Piano Attuale" : `Passa a ${tier.name}`}
            type={tier.name}
            onClick={() => handleUpdatePlan(tier.name)}
            isActive={currentTier === tier.name}
            disabled={loading}
          />
        ))}
      </div>
      
      {currentTier !== "Free" && (
        <div className="flex justify-center mb-10">
          <Button 
            variant="outline"
            onClick={handleCancelSubscription}
            className="border-red-500 text-red-500 hover:bg-red-500/10"
            disabled={loading}
          >
            Cancella abbonamento
          </Button>
        </div>
      )}
    </section>
  );
};
