// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Subscriptions Info Page - Abbonamenti - Con Animazioni Premium

import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, Sparkles, CreditCard, ChevronDown } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const plans = [
  {
    name: 'Base',
    price: '€0',
    period: '/mese',
    highlight: false,
    color: 'cyan',
    features: [
      'Accesso alla missione con restrizioni',
      'Supporto email standard',
      '1 indizio settimanale base'
    ],
    buttonText: 'Inizia Gratis',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    name: 'Silver',
    price: '€3.99',
    period: '/mese',
    highlight: false,
    color: 'gray',
    features: [
      'Tutti i vantaggi Base',
      '3 indizi premium a settimana',
      'Accesso anticipato 2 ore',
      'Badge Silver nel profilo'
    ],
    buttonText: 'Scegli Silver',
    gradient: 'from-gray-400 to-gray-500'
  },
  {
    name: 'Gold',
    price: '€6.99',
    period: '/mese',
    highlight: true,
    color: 'yellow',
    features: [
      'Tutti i vantaggi Silver',
      '4 indizi premium a settimana',
      'Accesso anticipato 12 ore',
      'Estrazioni Gold esclusive',
      'Badge Gold nel profilo'
    ],
    buttonText: 'Scegli Gold',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Black',
    price: '€9.99',
    period: '/mese',
    highlight: false,
    color: 'black',
    features: [
      'Tutti i vantaggi Gold',
      '5 indizi premium a settimana',
      'Accesso VIP 24 ore',
      'Badge Black esclusivo'
    ],
    buttonText: 'Scegli Black',
    gradient: 'from-gray-800 to-gray-900'
  },
  {
    name: 'Titanium',
    price: '€29.99',
    period: '/mese',
    highlight: false,
    color: 'purple',
    features: [
      'Tutti i vantaggi Black',
      '7 indizi premium a settimana',
      'Accesso VIP 48 ore',
      'Supporto prioritario 24/7',
      'Eventi esclusivi M1SSION™'
    ],
    buttonText: 'Scegli Titanium',
    gradient: 'from-purple-400 to-pink-500'
  }
];

const faqs = [
  {
    question: 'Posso vincere con il piano Base?',
    answer: 'Sì, tutti i piani permettono di vincere. I piani premium offrono più indizi e accesso anticipato, ma il premio finale è accessibile a tutti.'
  },
  {
    question: 'Posso cambiare piano?',
    answer: 'Sì, puoi effettuare l\'upgrade o il downgrade in qualsiasi momento dalle impostazioni del tuo profilo.'
  },
  {
    question: 'Come funzionano gli indizi premium?',
    answer: 'Gli indizi premium sono più dettagliati e ti danno un vantaggio nella risoluzione della missione. Vengono sbloccati settimanalmente in base al tuo piano.'
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const SubscriptionsInfoPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <LandingHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a12] to-black" />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(234,179,8,0.08),transparent_60%)]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(168,85,247,0.06),transparent_60%)]"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CreditCard className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium tracking-wider">PIANI E PREZZI</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-mission font-black mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-cyan-400">M1SSION</span> Abbonamenti
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Scegli il piano più adatto a te. Tutti i piani permettono di vincere premi reali.
          </motion.p>
        </motion.div>
      </section>

      {/* Plans Grid */}
      <section className="relative py-12 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative bg-white/5 border rounded-xl p-5 ${
                  plan.highlight 
                    ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent' 
                    : 'border-white/10'
                }`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  borderColor: plan.highlight ? 'rgba(234,179,8,0.7)' : 'rgba(255,255,255,0.2)',
                  boxShadow: plan.highlight ? '0 0 40px rgba(234,179,8,0.3)' : '0 0 20px rgba(255,255,255,0.1)'
                }}
              >
                {plan.highlight && (
                  <motion.div 
                    className="absolute -top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Consigliato
                  </motion.div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setLocation('/register')}
                    className={`w-full bg-gradient-to-r ${plan.gradient} text-white font-bold py-2 rounded-full`}
                  >
                    {plan.buttonText}
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-12 px-4 z-10">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            className="text-2xl font-bold text-white mb-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Domande Frequenti
          </motion.h2>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                variants={itemVariants}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-white font-semibold">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: openFaq === index ? 'auto' : 0,
                    opacity: openFaq === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-gray-400 text-sm">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-4 z-10">
        <motion.div 
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/50 mb-4">Inizia gratis, poi decidi.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setLocation('/register')}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-lg font-black hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all"
            >
              INIZIA GRATIS
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SubscriptionsInfoPage;
