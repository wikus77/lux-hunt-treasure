// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Target, Clock, Trophy, Users, ArrowLeft, Check, UserCheck, MapPin, Award } from 'lucide-react';
import AnimatedLogo from '@/components/logo/AnimatedLogo';
import BackgroundParticles from '@/components/ui/background-particles';
import { Button } from '@/components/ui/button';
import PreRegistrationForm from '@/components/landing/PreRegistrationForm';
import { AnimatedCountdown } from '@/components/ui/animated-countdown';
import { getMissionDeadline } from '@/utils/countdownDate';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const HowItWorks: React.FC = () => {
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const { checkMissionStarted } = useUnifiedAuth();

  useEffect(() => {
    const checkMission = async () => {
      const isStarted = await checkMissionStarted();
      setCountdownCompleted(isStarted);
    };
    checkMission();
  }, [checkMissionStarted]);

  // Get mission deadline
  const targetDate = getMissionDeadline();

  // How it works steps
  const steps = [
    {
      icon: <UserCheck className="w-8 h-8 text-[#00E5FF]" />,
      title: "Registrazione",
      description: "Crea il tuo account su M1SSION e preparati alla sfida"
    },
    {
      icon: <Check className="w-8 h-8 text-[#00E5FF]" />,
      title: "Ricevi Indizi",
      description: "Ogni settimana ricevi nuovi indizi via app ed email"
    },
    {
      icon: <MapPin className="w-8 h-8 text-[#FFC107]" />,
      title: "Risolvi la Missione",
      description: "Analizza gli indizi e trova la posizione del premio"
    },
    {
      icon: <Award className="w-8 h-8 text-[#FF00FF]" />,
      title: "Vinci davvero",
      description: "Se sei il primo a trovare il premio, diventa tuo!"
    }
  ];

  // Prize data
  const menPrizes = [
    {
      icon: "⌚",
      name: "Rolex Explorer II",
      description: "Orologio luxury GMT, perfetto per le missioni",
      value: "€9.500"
    },
    {
      icon: "👟",
      name: "Nike Mag Limited",
      description: "Sneakers iconiche autoallaccianti edition",
      value: "€25.000"
    },
    {
      icon: "🎧",
      name: "Bang & Olufsen H95",
      description: "Cuffie premium con cancellazione rumore",
      value: "€800"
    },
    {
      icon: "🧥",
      name: "Moncler Grenoble",
      description: "Giacca tecnica da montagna haute couture",
      value: "€1.800"
    }
  ];

  const womenPrizes = [
    {
      icon: "👜",
      name: "Hermès Birkin",
      description: "Borsa arancione in pelle di coccodrillo",
      value: "€45.000"
    },
    {
      icon: "💐",
      name: "Nishane Ani Extrait",
      description: "Profumo di nicchia luxury persiano",
      value: "€300"
    },
    {
      icon: "💎",
      name: "Dior Tribales",
      description: "Orecchini con perle e cristalli signature",
      value: "€650"
    },
    {
      icon: "🕶️",
      name: "Celine Butterfly",
      description: "Occhiali da sole oversize acetato",
      value: "€450"
    }
  ];

  // Subscription plans
  const subscriptionPlans = [
    {
      name: "Base",
      price: "Gratuito",
      features: ["1 indizio al mese", "Accesso alle sfide basic", "Community chat"],
      color: "from-gray-500 to-gray-700"
    },
    {
      name: "Silver",
      price: "€9.99/mese",
      features: ["3 indizi al mese", "Hints premium", "Strumenti analisi"],
      color: "from-gray-400 to-gray-600"
    },
    {
      name: "Gold",
      price: "€19.99/mese",
      features: ["5 indizi al mese", "GPS avanzato", "Early access", "Support prioritario"],
      color: "from-yellow-400 to-yellow-600"
    },
    {
      name: "Black",
      price: "€39.99/mese",
      features: ["Indizi illimitati", "Intel tools", "Personal coach", "VIP events"],
      color: "from-purple-500 to-black"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles count={30} />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header with Logo and Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <AnimatedLogo />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            WELCOME TO <span className="text-cyan-400">M1SSION™</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Il gioco di realtà aumentata più avanzato al mondo. Preparati per un'esperienza senza precedenti.
          </p>
        </motion.div>

        {/* Countdown Display */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatedCountdown targetDate={targetDate} />
          <p className="text-sm text-gray-500 mt-4">
            {countdownCompleted 
              ? "🚀 M1SSION™ è attiva! L'avventura è iniziata." 
              : "🔒 Accesso abilitato automaticamente il giorno del lancio"}
          </p>
        </motion.div>

        {/* Pre-Registration Form */}
        <div className="mb-16">
          <PreRegistrationForm countdownCompleted={countdownCompleted} />
        </div>

        {/* How It Works Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-cyan-400">Scopri</span> M1SSION™
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#FFC107] to-[#FF00FF] z-0"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-black/50 p-6 rounded-xl border border-gray-800 relative z-10 hover:border-cyan-500/30 transition-all duration-300"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                whileHover={{ y: -5 }}
              >
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-white z-20">
                  {index + 1}
                </span>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-black/50 border border-white/10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prizes Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            💎 <span className="text-cyan-400">Premi in Palio</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Men's Prizes */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-center text-blue-400">👨 Target Uomo</h3>
              <div className="space-y-4">
                {menPrizes.map((prize, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{prize.icon}</div>
                      <div>
                        <h4 className="font-bold text-white">{prize.name}</h4>
                        <p className="text-sm text-gray-300">{prize.description}</p>
                        <p className="text-xs text-blue-400">Valore: {prize.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Women's Prizes */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-center text-pink-400">👩 Target Donna</h3>
              <div className="space-y-4">
                {womenPrizes.map((prize, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-xl border border-pink-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{prize.icon}</div>
                      <div>
                        <h4 className="font-bold text-white">{prize.name}</h4>
                        <p className="text-sm text-gray-300">{prize.description}</p>
                        <p className="text-xs text-pink-400">Valore: {prize.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-cyan-400">
            Abbonamenti
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-b ${plan.color} p-6 rounded-xl border border-white/10 text-center relative overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                <p className="text-2xl font-bold mb-4 text-white">{plan.price}</p>
                <ul className="space-y-2 text-sm text-white/80">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Timeline */}
        <motion.div
          className="bg-black/50 p-8 rounded-xl border border-cyan-500/30 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">
            Come Funziona M1SSION™
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg">Ricevi la Missione</h3>
                <p className="text-gray-400">
                  Ogni mese una nuova missione globale con coordinate segrete e indizi criptati.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg">Analizza gli Indizi</h3>
                <p className="text-gray-400">
                  Utilizza i nostri strumenti di intelligence per decifrare messaggi e calcolare posizioni.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg">Esegui il Final Shot</h3>
                <p className="text-gray-400">
                  Quando sei sicuro della posizione, esegui il tuo Final Shot per vincere la missione.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg">Vinci Premi Reali</h3>
                <p className="text-gray-400">
                  Ricevi premi fisici consegnati al tuo indirizzo e accedi al livello successivo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-cyan-400">
            Sei Pronto per la M1SSION™?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            {countdownCompleted 
              ? "L'avventura è iniziata! Entra nell'app e inizia la tua prima missione."
              : "La tua pre-registrazione è confermata. Torna qui il 19 Agosto 2025 alle 07:00 per iniziare la tua prima missione."
            }
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                Torna alla Home
              </Button>
            </Link>
            
            {countdownCompleted && (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                  Entra nell'App
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Identity Verification Section */}
        <motion.div
          className="bg-purple-500/10 border border-purple-500/30 p-8 rounded-xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-purple-400">
            Verifica Identità
          </h2>
          <p className="text-white/70 mb-6">
            Per garantire un'esperienza di gioco sicura e conforme alle normative,
            è necessario completare la verifica dell'identità prima di ricevere premi.
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
            Vai alla verifica identità
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <p className="text-gray-500 text-sm mb-4">
            © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
          </p>
          
          {/* App Store Badges */}
          <div className="flex justify-center gap-4">
            <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-lg">
              <span className="text-white/60 text-sm">📱 App Store</span>
            </div>
            <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-lg">
              <span className="text-white/60 text-sm">🤖 Google Play</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;