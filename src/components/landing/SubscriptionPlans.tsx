// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Star, Diamond, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  icon: React.ElementType;
  features: string[];
  highlighted?: boolean;
  earlyAccessHours?: number;
  gradient: string;
  borderGlow: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'base',
    name: 'Base – Gratis',
    price: 0,
    icon: Star,
    features: [
      'Funzioni base (accesso alla missione con restrizioni)',
      'Supporto email standard',
      '1 indizio settimanale base'
    ],
    gradient: 'from-gray-600 to-gray-800',
    borderGlow: 'shadow-gray-500/20'
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 3.99,
    icon: Zap,
    earlyAccessHours: 2,
    features: [
      'Tutti i vantaggi Base',
      '3 indizi premium aggiuntivi a settimana',
      'Accesso anticipato di 2 ore agli eventi',
      'Badge Silver nel profilo'
    ],
    gradient: 'from-slate-400 to-slate-600',
    borderGlow: 'shadow-slate-400/30'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 6.99,
    icon: Crown,
    earlyAccessHours: 12,
    highlighted: true,
    features: [
      'Tutti i vantaggi Silver',
      '4 indizi premium aggiuntivi a settimana',
      'Accesso anticipato di 12 ore agli eventi',
      'Partecipazione alle estrazioni Gold',
      'Badge Gold esclusivo nel profilo'
    ],
    gradient: 'from-yellow-400 to-yellow-600',
    borderGlow: 'shadow-yellow-400/40'
  },
  {
    id: 'black',
    name: 'Black',
    price: 9.99,
    icon: Diamond,
    earlyAccessHours: 24,
    features: [
      'Tutti i vantaggi Gold',
      'Accesso VIP anticipato di 24 ore agli eventi',
      '5 indizi premium aggiuntivi a settimana',
      'Badge Black esclusivo'
    ],
    gradient: 'from-gray-900 to-black',
    borderGlow: 'shadow-purple-500/40'
  },
  {
    id: 'titanium',
    name: 'Titanium',
    price: 29.99,
    icon: Infinity,
    earlyAccessHours: 48,
    features: [
      'Tutti i vantaggi Black',
      '5 indizi premium aggiuntivi a settimana',
      'Accesso VIP anticipato di 48 ore agli eventi',
      'Supporto prioritario dedicato (24/7)',
      'Eventi esclusivi M1SSION™',
      'Badge Titanium esclusivo'
    ],
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    borderGlow: 'shadow-purple-600/60'
  }
];

export const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUnifiedAuth();

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Devi essere autenticato per selezionare un piano');
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      // Here you would integrate with your payment system
      // For now, we'll just show a toast
      toast.success(`Piano ${planId.toUpperCase()} selezionato!`, {
        description: 'Redirecting to payment...'
      });

      // Simulate payment flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Errore nella selezione del piano');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-cyan-400 glow-text">M1</span>
            <span className="text-white">SSION™ PLANS</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Scegli il tuo livello di accesso alla missione
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 backdrop-blur-md border transition-all duration-300 hover:scale-105 cursor-pointer ${
                plan.highlighted 
                  ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10' 
                  : 'border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50'
              } ${plan.borderGlow} hover:shadow-2xl`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                    Più Popolare
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  {plan.originalPrice && (
                    <div className="text-gray-500 line-through text-sm">€{plan.originalPrice}</div>
                  )}
                  <div className="text-3xl font-bold text-white">
                    {plan.price === 0 ? 'GRATIS' : `€${plan.price}`}
                  </div>
                  {plan.earlyAccessHours && (
                    <div className="text-cyan-400 text-sm font-semibold mt-1">
                      Accesso {plan.earlyAccessHours}h prima
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </div>
                ))}
              </div>

              <Button
                className={`w-full font-semibold ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black'
                    : 'bg-gradient-to-r from-cyan-500 to-primary hover:from-cyan-600 hover:to-primary/80 text-white'
                }`}
                disabled={isLoading && selectedPlan === plan.id}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Elaborando...
                  </div>
                ) : (
                  plan.price === 0 ? 'Inizia Gratis' : 'Seleziona Piano'
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            💳 Pagamenti sicuri • 🔒 Dati protetti • ⚡ Attivazione istantanea
          </p>
        </div>
      </div>
    </div>
  );
};