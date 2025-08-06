// ✅ COMPONENT MODIFICATO
// BY JOSEPH MULE — 2025-07-12
import React, { useState, useEffect } from 'react';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SubscriptionBenefits } from "@/components/subscription/SubscriptionBenefits";
import { SubscriptionFAQ } from "@/components/subscription/SubscriptionFAQ";
import { useProfileSubscription } from "@/hooks/profile/useProfileSubscription";
import { useStripePayment } from "@/hooks/useStripePayment";
import { toast } from "sonner";

const Subscriptions = () => {
  const [, setLocation] = useLocation();
  // TASK 1 — Sincronizzazione Piano Attivo (PRIORITÀ MASSIMA)
  const { subscription } = useProfileSubscription();
  const [selected, setSelected] = useState<string>(subscription.plan);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { processSubscription, loading: stripeLoading } = useStripePayment();
  
  // Componente React da utilizzare come leftComponent
  const LeftComponent = () => (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => {
          setLocation('/home');
        }}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );

  // TASK 1 — Sincronizzazione Piano Attivo da Supabase + Checkout Handler
  useEffect(() => {
    // Production: Remove debug logs
    // console.log('🔥 M1SSION™ SUBSCRIPTIONS PAGE MOUNTED');
    // console.log('🔥 M1SSION™ Current location:', window.location.href);
    // console.log('🔥 M1SSION™ Current subscription plan:', subscription.plan);
    
    setProfileImage(localStorage.getItem('profileImage'));
    // Forza sincronizzazione con hook subscription
    setSelected(subscription.plan);
    
    // Handle checkout parameter for Stripe payment
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutTier = urlParams.get('checkout');
    const tier = urlParams.get('tier');
    const upgradeIntent = urlParams.get('upgrade');
    const fromPage = urlParams.get('from');
    const currentPlan = urlParams.get('current_plan');
    
    // Production: Minimal logging only for critical flow
    if (upgradeIntent === 'true' && fromPage === 'access-blocked') {
      // Track upgrade intent for analytics
      console.log('🎯 M1SSION™ UPGRADE INTENT: User from access blocked page');
    }
    
    if (checkoutTier && tier) {
      // Auto-checkout triggered from external link
      handleStripeCheckout(tier);
    } else if (upgradeIntent === 'true' && fromPage === 'access-blocked') {
      // Show upgrade-focused UI or automatically suggest Silver plan
      if (currentPlan === 'base') {
        // Scroll to silver plan and highlight it for base users
        setTimeout(() => {
          const silverElement = document.querySelector('[data-plan="Silver"]');
          if (silverElement) {
            silverElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            silverElement.classList.add('ring-2', 'ring-purple-500', 'ring-pulse');
          }
        }, 1000);
      }
    }
  }, [subscription.plan, processSubscription]);

  const handleStripeCheckout = async (tier: string) => {
    try {
      if (!processSubscription) {
        toast.error('Sistema di pagamento non disponibile');
        return;
      }
      
      if (stripeLoading) {
        return; // Already processing
      }
      
      await processSubscription(tier);
      toast.success(`✅ Checkout ${tier} attivato - reindirizzamento in corso...`);
      
    } catch (error) {
      console.error('❌ M1SSION™ Stripe checkout error:', error);
      toast.error("❌ Errore nel sistema di pagamento. Contatta l'assistenza.");
    }
  };

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: "rgba(19, 21, 33, 0.55)",
          backdropFilter: "blur(12px)"
        }}
      >
        <UnifiedHeader 
          profileImage={profileImage} 
          leftComponent={<LeftComponent />} 
        />
      </header>
      
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="max-w-screen-xl mx-auto">
        <SubscriptionHeader />
        <SubscriptionPlans selected={selected} setSelected={setSelected} />
        <SubscriptionBenefits />
        <SubscriptionFAQ />
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
