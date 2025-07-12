import React, { useState, useEffect } from 'react';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SubscriptionBenefits } from "@/components/subscription/SubscriptionBenefits";
import { SubscriptionFAQ } from "@/components/subscription/SubscriptionFAQ";

const Subscriptions = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("Base");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Componente React da utilizzare come leftComponent
  const LeftComponent = () => (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate(-1)} 
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
    
    // Carica l'abbonamento corrente
    const currentPlan = localStorage.getItem('subscription_plan');
    if (currentPlan) {
      setSelected(currentPlan);
    }
    
    // Ascolta cambiamenti nell'abbonamento
    const handleStorageChange = () => {
      const updatedPlan = localStorage.getItem('subscription_plan');
      if (updatedPlan) {
        setSelected(updatedPlan);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
