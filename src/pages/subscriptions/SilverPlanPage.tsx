// ✅ File conforme M1SSION™ — BY JOSEPH MULE
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FakeStripeCheckout from '@/components/payment/FakeStripeCheckout';

const SilverPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const planFeatures = [
    "Tutti i vantaggi Base",
    "3 indizi premium aggiuntivi a settimana",
    "Accesso anticipato ai nuovi eventi",
    "Badge Silver nel profilo",
    "Supporto prioritario"
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
        <div className="glass-card mx-2 sm:mx-4 mt-4 mb-4">
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
              <h1 className="text-xl font-semibold">Piano Silver</h1>
            </div>
            
            {/* Plan Details */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Star className="h-8 w-8 text-silver" />
                <h2 className="text-3xl font-bold text-white">M1SSION™ Silver</h2>
              </div>
              <p className="text-4xl font-bold text-primary mb-2">€3,99</p>
              <p className="text-white/60">al mese</p>
            </div>

            {/* Features List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Cosa include:</h3>
              <div className="space-y-3">
                {planFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Star className="h-4 w-4 text-silver" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <FakeStripeCheckout 
              planName="Silver"
              planPrice="€3,99"
              planFeatures={planFeatures}
            />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default SilverPlanPage;