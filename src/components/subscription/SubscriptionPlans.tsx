
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
      console.log(`🔥 M1SSION™ PLAN UPDATE STARTED: ${plan}`);
      console.log(`📊 M1SSION™ Current state:`, { 
        selectedPlan: selected, 
        requestedPlan: plan, 
        isDowngrade: plan === "Base" 
      });
      
      if (plan === "Base") {
        console.log(`⬇️ M1SSION™ DOWNGRADE: To Base plan`);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log(`👤 M1SSION™ User authenticated:`, user.id);
          
          // Call cancel-subscription edge function for Stripe cleanup
          try {
            console.log(`🔄 M1SSION™ Calling cancel-subscription function...`);
            const { data: cancelData, error: cancelError } = await supabase.functions.invoke('cancel-subscription');
            
            if (cancelError) {
              console.error('❌ M1SSION™ Cancel subscription error:', cancelError);
            } else {
              console.log('✅ M1SSION™ Cancel subscription response:', cancelData);
            }
          } catch (cancelStripeError) {
            console.error('❌ M1SSION™ Cancel subscription failed:', cancelStripeError);
          }
          
          // Force local updates
          localStorage.setItem("userTier", "Base");
          await upgradeSubscription("Base");
          setSelected("Base");
          
          console.log(`✅ M1SSION™ Local state updated to Base`);
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
            console.error("❌ M1SSION™ NO URL from Stripe checkout:", JSON.stringify(data, null, 2));
            toast({
              title: "Errore Stripe",
              description: "Impossibile avviare il pagamento. Riprova.",
              variant: "destructive",
            });
            return;
          }

          console.log(`✅ M1SSION™ Stripe URL received: ${data.url}`);
          console.log(`📋 M1SSION™ Full data received:`, JSON.stringify(data, null, 2));
          
          // 🚨 CRITICAL FIX: iOS PWA STRIPE REDIRECT - FORCED SOLUTION
          console.warn(`🚀 M1SSION™ FORCING iOS PWA STRIPE REDIRECT`);
          
          try {
            // ALWAYS use window.open for PWA iOS - location.replace FAILS on iOS PWA
            console.warn(`🔧 M1SSION™ Opening Stripe in new tab (iOS PWA compatible)`);
            
            // Method 1: Immediate window.open
            let stripeWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
            console.log(`🔍 M1SSION™ Immediate window.open result:`, !!stripeWindow);
            
            // Method 2: Delayed window.open (Safari iOS PWA workaround)
            if (!stripeWindow || stripeWindow.closed) {
              console.warn(`🔧 M1SSION™ Immediate open failed, trying delayed approach`);
              setTimeout(() => {
                console.warn(`🔧 M1SSION™ Executing delayed window.open`);
                stripeWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
                if (!stripeWindow || stripeWindow.closed) {
                  console.error(`❌ M1SSION™ Delayed window.open also failed`);
                  // Method 3: Force location change as last resort
                  console.warn(`🔧 M1SSION™ Last resort: forcing location.href`);
                  window.location.href = data.url;
                } else {
                  console.log(`✅ M1SSION™ Delayed window.open SUCCESS`);
                }
              }, 300);
            } else {
              console.log(`✅ M1SSION™ Immediate window.open SUCCESS`);
            }
            
            // Show success message
            sonnerToast.success(`✅ Checkout ${plan} attivato!`, {
              description: 'Apertura Stripe in corso...',
              duration: 3000
            });
            
          } catch (error) {
            console.error("❌ M1SSION™ All redirect methods failed:", error);
            toast({
              title: "❌ Errore Redirect Critico",
              description: "Impossibile aprire Stripe. Contatta il supporto.",
              variant: "destructive",
            });
          }
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
  
  // 🔄 M1SSION™ Funzione di verifica e retry per downgrade
  const verifyDowngrade = async (maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 M1SSION™ Verify attempt ${i + 1}/${maxRetries}`);
        
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-subscription-sync');
        
        if (verifyError) {
          console.error(`❌ M1SSION™ Verify error (attempt ${i + 1}):`, verifyError);
          continue;
        }
        
        console.log(`📊 M1SSION™ Verify result:`, verifyData);
        
        if (verifyData?.tier === 'Base') {
          console.log(`✅ M1SSION™ Downgrade verified successfully`);
          setSelected('Base');
          return true;
        } else {
          console.log(`⚠️ M1SSION™ Still not Base tier: ${verifyData?.tier}, retrying...`);
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          }
        }
      } catch (error) {
        console.error(`❌ M1SSION™ Verify attempt ${i + 1} failed:`, error);
      }
    }
    return false;
  };
  
  const handleCancelSubscription = async () => {
    if (selected === "Base") {
      toast({
        title: "Nessun abbonamento attivo",
        description: "Hai già il piano base gratuito"
      });
      return;
    }
    
    console.log(`🔄 M1SSION™ Starting subscription cancellation...`);
    
    try {
      // Call downgrade to Base
      await handleUpdatePlan("Base");
      
      // Verify with retry
      const success = await verifyDowngrade();
      
      if (success) {
        toast({
          title: "✅ Abbonamento cancellato",
          description: "Il tuo abbonamento è stato cancellato con successo"
        });
      } else {
        toast({
          title: "⚠️ Cancellazione in corso",
          description: "La cancellazione potrebbe richiedere alcuni minuti",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ M1SSION™ Cancel subscription error:', error);
      toast({
        title: "❌ Errore cancellazione",
        description: "Riprova tra qualche istante",
        variant: "destructive"
      });
    }
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
