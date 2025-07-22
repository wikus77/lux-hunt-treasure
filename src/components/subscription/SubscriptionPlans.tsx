
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import SubscriptionCard from "./SubscriptionCard";
import { useProfileSubscription } from "@/hooks/profile/useProfileSubscription";
import { supabase } from "@/integrations/supabase/client";
import StripeInAppCheckout from "./StripeInAppCheckout";

interface SubscriptionPlansProps {
  selected: string;
  setSelected: (plan: string) => void;
}

export const SubscriptionPlans = ({ selected, setSelected }: SubscriptionPlansProps) => {
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
  const { subscription, upgradeSubscription } = useProfileSubscription();
  const [showInAppCheckout, setShowInAppCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // ✅ SUCCESS URL HANDLING for Stripe Return - ENHANCED WITH FORCE REFRESH
  React.useEffect(() => {
    const handleStripeReturn = async () => {
      console.log('🔍 M1SSION™ CHECKING URL FOR STRIPE RETURN...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get('success') === 'true';
      const tier = urlParams.get('tier');
      const sessionId = urlParams.get('session_id');
      const isCanceled = urlParams.get('canceled') === 'true';
      
      console.log('🔍 M1SSION™ URL PARAMS ANALYSIS:', {
        checkoutTier: tier,
        sessionId: sessionId,
        isSuccess: isSuccess,
        isCanceled: isCanceled,
        fullUrl: window.location.href,
        search: window.location.search,
        hasParams: window.location.search.length > 0
      });
      
      if (isCanceled) {
        console.log('❌ M1SSION™ STRIPE CANCELED');
        sonnerToast.error('Pagamento annullato', {
          description: 'Il pagamento è stato annullato',
          duration: 4000
        });
        // Clean URL
        window.history.replaceState({}, '', '/subscriptions');
        return;
      }
      
      if (!isSuccess || !tier) {
        console.log('❌ M1SSION™ NO SUCCESS PARAMS - isSuccess:', isSuccess, 'tier:', tier);
        return;
      }
      
      console.log('🎉 M1SSION™ STRIPE SUCCESS DETECTED - PROCESSING TIER UPDATE:', tier);
      
      try {
        // STEP 1: Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('❌ M1SSION™ User auth error:', userError);
          return;
        }
        
        console.log('👤 M1SSION™ User authenticated:', user.id);
        
        // STEP 2: Force immediate profile update (CRITICAL)
        console.log('🔄 M1SSION™ FORCING PROFILE UPDATE...');
        const { data: profileUpdate, error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();
        
        if (profileError) {
          console.error('❌ M1SSION™ Profile update error:', profileError);
        } else {
          console.log('✅ M1SSION™ Profile updated successfully:', profileUpdate);
        }
        
        // STEP 3: Force subscription sync
        console.log('🔄 M1SSION™ Invoking verify-subscription-sync...');
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('verify-subscription-sync');
        if (syncError) {
          console.error('❌ M1SSION™ Sync error:', syncError);
        } else {
          console.log('✅ M1SSION™ Sync result:', syncResult);
        }
        
        // STEP 4: Create subscription record if needed
        console.log('🔄 M1SSION™ Creating/updating subscription record...');
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            tier: tier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id' 
          });
        
        if (subscriptionError) {
          console.error('❌ M1SSION™ Subscription upsert error:', subscriptionError);
        } else {
          console.log('✅ M1SSION™ Subscription record created/updated');
        }
        
        // STEP 5: Update local state immediately
        console.log('🔄 M1SSION™ Updating local state...');
        setSelected(tier);
        localStorage.setItem('userTier', tier);
        localStorage.setItem('pending_plan_update', tier);
        
        // STEP 6: Force UI refresh by calling upgradeSubscription
        try {
          await upgradeSubscription(tier);
          console.log('✅ M1SSION™ upgradeSubscription called successfully');
        } catch (upgradeError) {
          console.error('❌ M1SSION™ upgradeSubscription error:', upgradeError);
        }
        
        // STEP 7: Log successful upgrade in panel_logs
        const { error: logError } = await supabase
          .from('panel_logs')
          .insert({
            event_type: 'subscription_upgraded',
            details: {
              user_id: user.id,
              new_tier: tier,
              session_id: sessionId,
              timestamp: new Date().toISOString(),
              source: 'stripe_success_return'
            }
          });
        
        if (logError) {
          console.error('❌ M1SSION™ Panel log error:', logError);
        } else {
          console.log('✅ M1SSION™ Panel log created');
        }
        
        // STEP 8: Show success message
        console.log('🎉 M1SSION™ SHOWING SUCCESS TOAST');
        sonnerToast.success(`🎉 Piano ${tier} attivato!`, {
          description: `Il tuo abbonamento ${tier} è ora attivo e funzionante`,
          duration: 6000
        });
        
        // STEP 9: Clean URL after delay
        setTimeout(() => {
          console.log('🧹 M1SSION™ Cleaning URL...');
          window.history.replaceState({}, '', '/subscriptions');
        }, 2000);
        
        console.log('✅ M1SSION™ STRIPE SUCCESS PROCESSING COMPLETED');
        
      } catch (error) {
        console.error('❌ M1SSION™ Critical error processing success:', error);
        sonnerToast.error('❌ Errore sincronizzazione abbonamento', {
          description: 'Il pagamento è andato a buon fine ma c\'è stato un errore di sincronizzazione. Contatta il supporto.',
          duration: 8000
        });
      }
    };
    
    // Execute immediately on component mount
    handleStripeReturn();
  }, []); // Empty dependency array - only run once on mount

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
  
  // 🔄 M1SSION™ FALLBACK DIRETTO STRIPE JS (quando edge function fallisce)
  const handleDirectStripeCheckout = async (tier: string) => {
    console.log("🔄 M1SSION™ DIRECT STRIPE CHECKOUT FALLBACK", { tier });
    
    try {
      // Show fallback toast
      sonnerToast.info("🔄 Tentativo fallback diretto Stripe...", {
        description: "Stiamo provando un metodo alternativo",
        duration: 3000
      });
      
      // Per ora, mostra un messaggio di fallback intelligente
      sonnerToast.error("❌ Problema temporaneo checkout", {
        description: "Riprova tra 30 secondi o contatta il supporto. L'edge function Stripe non risponde.",
        duration: 8000
      });
      
      // TODO: Se necessario, implementare Stripe JS client-side diretto qui
      // Requirerebbe Stripe publishable key e configurazione separata
      
    } catch (fallbackError) {
      console.error("❌ M1SSION™ DIRECT STRIPE FALLBACK FAILED", fallbackError);
      sonnerToast.error("❌ Errore critico sistema pagamenti", {
        description: "Contatta immediatamente il supporto tecnico",
        duration: 10000
      });
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
        
        // 🚀 CRITICAL: Use in-app checkout instead of external redirect
        console.log(`💳 M1SSION™ Opening in-app checkout for ${plan}`);
        setSelectedPlan(plan);
        setShowInAppCheckout(true);
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

  // Handle successful in-app payment
  const handleInAppPaymentSuccess = async () => {
    console.log('🎉 M1SSION™ In-app payment successful');
    setShowInAppCheckout(false);
    
    // Update local state
    setSelected(selectedPlan);
    
    // Force refresh subscription data
    try {
      await upgradeSubscription(selectedPlan);
      sonnerToast.success(`🎉 Piano ${selectedPlan} attivato!`, {
        description: 'Il tuo abbonamento è ora attivo',
        duration: 6000
      });
    } catch (error) {
      console.error('❌ M1SSION™ Error refreshing subscription:', error);
    }
  };

  // Handle in-app payment cancellation
  const handleInAppPaymentCancel = () => {
    console.log('❌ M1SSION™ In-app payment cancelled');
    setShowInAppCheckout(false);
    setSelectedPlan('');
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

  // ✅ REALTIME SUBSCRIPTION FOR IMMEDIATE UI UPDATES
  React.useEffect(() => {
    console.log('🔄 M1SSION™ Setting up realtime subscription updates...');
    
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('🔄 M1SSION™ REALTIME PROFILE UPDATE:', payload);
          
          // Check if this is the current user's profile
          if (payload.new && payload.new.id) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && user.id === payload.new.id) {
                console.log('✅ M1SSION™ REALTIME: Current user profile updated');
                const newTier = payload.new.subscription_tier || payload.new.tier;
                if (newTier && newTier !== selected) {
                  console.log('🔄 M1SSION™ REALTIME: Updating UI to new tier:', newTier);
                  setSelected(newTier);
                  localStorage.setItem('userTier', newTier);
                  
                  // Show success toast if it's a paid tier
                  if (newTier !== 'Base') {
                    sonnerToast.success(`🎉 Piano ${newTier} sincronizzato!`, {
                      description: 'Il tuo abbonamento è ora attivo',
                      duration: 4000
                    });
                  }
                }
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 M1SSION™ Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [selected]);

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
      
      {/* In-App Checkout Modal */}
      {showInAppCheckout && (
        <StripeInAppCheckout
          plan={selectedPlan}
          onSuccess={handleInAppPaymentSuccess}
          onCancel={handleInAppPaymentCancel}
        />
      )}
    </section>
  );
};
