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
import { useUniversalStripePayment } from "@/hooks/useUniversalStripePayment";
import { toast } from "sonner";

const Subscriptions = () => {
  const [, setLocation] = useLocation();
  // TASK 1 — Sincronizzazione Piano Attivo (PRIORITÀ MASSIMA)
  const { subscription } = useProfileSubscription();
  const [selected, setSelected] = useState<string>(subscription.plan);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { processSubscription, loading: stripeLoading } = useUniversalStripePayment();
  
  // Componente React da utilizzare come leftComponent
  const LeftComponent = () => (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => window.history.back()} 
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );

  // TASK 1 — Sincronizzazione Piano Attivo da Supabase + Checkout Handler
  useEffect(() => {
    console.log('🔥 M1SSION™ SUBSCRIPTIONS PAGE MOUNTED');
    console.log('🔥 M1SSION™ Current location:', window.location.href);
    console.log('🔥 M1SSION™ Current subscription plan:', subscription.plan);
    
    setProfileImage(localStorage.getItem('profileImage'));
    // Forza sincronizzazione con hook subscription
    setSelected(subscription.plan);
    
    // Handle checkout parameter for Stripe payment
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutTier = urlParams.get('checkout');
    const tier = urlParams.get('tier');
    
    console.log('🔍 M1SSION™ URL PARAMS:', { 
      checkoutTier, 
      tier, 
      fullUrl: window.location.href,
      search: window.location.search,
      hasParams: !!checkoutTier && !!tier
    });
    
    if (checkoutTier && tier) {
      console.log(`🚀 M1SSION™ AUTO-CHECKOUT TRIGGER: ${tier}`);
      console.log(`🔧 M1SSION™ processSubscription available:`, typeof processSubscription);
      
      // Immediato call senza delay
      console.log(`⚡ M1SSION™ CALLING IMMEDIATE processSubscription(${tier})`);
      handleStripeCheckout(tier);
    } else {
      console.log('❌ M1SSION™ NO CHECKOUT PARAMS - checkoutTier:', checkoutTier, 'tier:', tier);
    }
  }, [subscription.plan, processSubscription]);

  const handleStripeCheckout = async (tier: string) => {
    try {
      console.log(`💳 M1SSION™ STRIPE CHECKOUT START: ${tier}`);
      console.log(`🔧 M1SSION™ processSubscription function:`, typeof processSubscription);
      console.log(`👤 M1SSION™ stripeLoading state:`, stripeLoading);
      
      if (!processSubscription) {
        console.error('❌ M1SSION™ processSubscription not available');
        toast.error('Sistema di pagamento non disponibile');
        return;
      }
      
      if (stripeLoading) {
        console.log('⏳ M1SSION™ Already processing Stripe checkout...');
        return;
      }
      
      console.log(`🔄 M1SSION™ Calling processSubscription for ${tier}...`);
      console.log(`🚀 M1SSION™ About to call processSubscription('${tier}')`);
      
      await processSubscription(tier);
      
      console.log(`✅ M1SSION™ processSubscription completed for ${tier}`);
      toast.success(`✅ Checkout ${tier} attivato - reindirizzamento in corso...`);
      
    } catch (error) {
      console.error('❌ M1SSION™ Stripe checkout FAILED:', error);
      console.error('❌ M1SSION™ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
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
