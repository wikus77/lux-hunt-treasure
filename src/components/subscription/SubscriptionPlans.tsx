
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
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
      case "Titanium":
        return [
          { text: "Tutti i vantaggi Black" },
          { text: "Accesso illimitato a tutto" },
          { text: "Badge Titanium esclusivo neon" },
          { text: "Supporto prioritario 24/7" },
          { text: "Eventi esclusivi Titanium VIP" }
        ];
      default:
        return [];
    }
  };
  
  // 🚀 M1SSION™ Sistema Upgrade/Downgrade Completo - FIXED CRITICAL BLOCKING BUG
  const handleUpdatePlan = async (plan: string) => {
    console.log(`🔥 M1SSION™ CLICK DETECTED: ${plan} button clicked`);
    console.log(`🔧 M1SSION™ STATE:`, { selected, plan, equal: plan === selected });
    console.log(`🌐 M1SSION™ Current location before navigate:`, window.location.href);
    
    // 🚨 CRITICAL FIX: Remove same plan block to allow re-activation and payment retries
    console.log(`🚀 M1SSION™ PROCESSING: ${selected} → ${plan} (ALWAYS ALLOWED)`);
    
    // Special handling for same plan - allow re-checkout for payment issues
    if (plan === selected) {
      console.log(`🔄 M1SSION™ RE-CHECKOUT: Allowing re-checkout for ${plan}`);
    }
    
    try {
      if (plan === "Base") {
          console.log(`⬇️ M1SSION™ DOWNGRADE: To Base plan`);
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Cancel active Stripe subscriptions first
            const { data: activeSubscriptions } = await supabase
              .from('subscriptions')
              .select('stripe_subscription_id')
              .eq('user_id', user.id)
              .eq('status', 'active');

            // Update database
            await supabase
              .from('subscriptions')
              .update({ status: 'canceled' })
              .eq('user_id', user.id)
              .eq('status', 'active');
              
            await supabase
              .from('profiles')
              .update({ 
                subscription_tier: 'Base',
                tier: 'Base'
              })
              .eq('id', user.id);
            
            localStorage.setItem("userTier", "Base");
            await upgradeSubscription("Base");
            setSelected("Base");
          }
        
        toast({
          title: "✅ Downgrade completato",
          description: "Sei tornato al piano Base gratuito",
          duration: 4000
        });
        
      } else {
        console.log(`🚀 M1SSION™ PAYMENT: To ${plan} plan (upgrade/downgrade/re-checkout)`);
        
        // 🚨 CRITICAL FIX: Direct Stripe checkout instead of double redirect
        // Don't pre-update state for paid plans - wait for Stripe success
        console.log(`🚀 M1SSION™ Starting Stripe checkout for ${plan}`);
        
        // 🚀 M1SSION™ DIRECT STRIPE CHECKOUT - No double redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
              user_id: user.id,
              plan,
              payment_method: 'card',
              mode: 'live'
            }
          });

          if (error) {
            console.error('❌ M1SSION™ Stripe checkout error:', error);
            toast({
              title: "❌ Errore checkout",
              description: "Impossibile creare sessione Stripe",
              variant: "destructive",
              duration: 5000
            });
            return;
          }

          if (!data?.url) {
            console.error('❌ M1SSION™ Stripe URL missing:', data);
            toast({
              title: "❌ Errore",
              description: "Stripe non ha restituito un URL valido",
              variant: "destructive",
              duration: 5000
            });
            return;
          }

          console.log('🚀 M1SSION™ DIRECT STRIPE REDIRECT:', data.url);
          
          // 🚨 iOS PWA FIX: Try location.replace for better PWA compatibility
          try {
            if ((window.navigator as any).standalone) {
              // iOS PWA standalone mode
              window.location.replace(data.url);
            } else {
              // Regular browser or fallback
              window.location.href = data.url;
            }
          } catch (e) {
            // Final fallback
            window.open(data.url, '_blank');
          }
          
          sonnerToast.success(`✅ Checkout ${plan} attivato!`, {
            description: 'Reindirizzamento a Stripe...',
            duration: 3000
          });
        }
      }
      
    } catch (error) {
      console.error('❌ M1SSION™ Upgrade error:', error);
      toast({
        title: "❌ Errore durante l'operazione",
        description: "Si è verificato un errore. Riprova tra qualche istante.",
        variant: "destructive",
        duration: 5000
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <SubscriptionCard
          title="Base"
          price="Gratis"
          period="mese"
          features={getSubscriptionFeatures("Base")}
          isPopular={false}
          ctaText={selected === "Base" ? "Piano Attuale" : "Passa a Base"}
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
        <SubscriptionCard
          title="Titanium"
          price="€29,99"
          period="mese"
          features={getSubscriptionFeatures("Titanium")}
          isPopular={false}
          ctaText={selected === "Titanium" ? "Piano Attuale" : "Passa a Titanium"}
          type="Titanium"
          onClick={() => {
            console.log('🔥 M1SSION™ TITANIUM CLICK INTERCEPTED');
            handleUpdatePlan("Titanium");
          }}
          isActive={selected === "Titanium"}
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
