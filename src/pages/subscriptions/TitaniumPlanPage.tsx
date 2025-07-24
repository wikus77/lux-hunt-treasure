// ✅ File conforme M1SSION™ — BY JOSEPH MULE
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Infinity, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FakeStripeCheckout from '@/components/payment/FakeStripeCheckout';
import { getDisplayPrice } from '@/lib/constants/pricingConfig';

const TitaniumPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const planFeatures = [
    "Tutti i vantaggi Black",
    "Accesso illimitato a tutto",
    "Badge Titanium esclusivo neon",
    "Supporto prioritario 24/7",
    "Eventi esclusivi Titanium VIP",
    "Accesso beta alle nuove funzioni",
    "Missioni Titanium esclusive",
    "Priorità assoluta nelle code",
    "Concierge personale dedicato"
  ];

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
        <UnifiedHeader leftComponent={<M1ssionText />} />
      </header>
      
      <motion.main 
        className="text-white"
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card mx-2 sm:mx-4 mt-4 mb-4 border-2 border-cyan-500/30">
          <div className="p-3 sm:p-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/subscriptions')}
                className="p-2 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Piano Titanium</h1>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                Ultimate
              </Badge>
            </div>
            
            {/* Plan Details */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Infinity className="h-8 w-8 text-cyan-400" />
                <h2 className="text-3xl font-bold text-white">M1SSION™ Titanium</h2>
              </div>
              <p className="text-4xl font-bold text-primary mb-2">{getDisplayPrice("Titanium")}</p>
              <p className="text-white/60">al mese</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <Crown className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Esperienza Ultimate Completa</span>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Cosa include:</h3>
              <div className="space-y-3">
                {planFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Infinity className="h-4 w-4 text-cyan-400" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusive Notice */}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
              <p className="text-center text-white font-medium">
                ⚡ Accesso supremo alle funzionalità più avanzate di M1SSION™
              </p>
            </div>

            {/* Payment Section */}
            {/* Payment Section */}
            <FakeStripeCheckout 
              planName="Titanium"
              planPrice={getDisplayPrice("Titanium")}
              planFeatures={planFeatures}
            />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default TitaniumPlanPage;