// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Landing Page con modifiche chirurgiche richieste

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, Info, IdCard, UserCheck, Check, MapPin, Award, X, Sparkles } from "lucide-react";
import BackgroundParallax from "@/components/ui/background-parallax";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import ParallaxContainer from "@/components/ui/parallax-container";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [, setLocation] = useLocation();
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  console.log('🌟 M1SSION™ LANDING PAGE - Showing to anonymous user');

  const handleRegisterClick = () => {
    console.log('🚀 M1SSION™ User clicking register button - redirecting to /register');
    setLocation('/register');
  };

  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  // Step data for "Scopri M1SSION" section
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

  // Subscription plans data - MODIFICATO: adattato per allineamento singola riga
  const subscriptions = [
    {
      title: 'Base – Gratis',
      price: '€0',
      period: '/mese',
      highlight: false,
      features: [
        "Funzioni base (accesso alla missione con restrizioni)",
        "Supporto email standard",
        "1 indizio settimanale base"
      ],
      notIncluded: [
        "Nessun accesso anticipato agli eventi",
        "Nessun badge esclusivo"
      ],
      buttonText: 'Inizia Gratis',
      buttonColor: 'bg-gradient-to-r from-[#00E5FF] to-[#008eb3] text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]'
    },
    {
      title: 'Silver',
      price: '€3.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Base",
        "3 indizi premium aggiuntivi a settimana",
        "Accesso anticipato di 2 ore agli eventi",
        "Badge Silver nel profilo"
      ],
      buttonText: 'Scegli Silver',
      buttonColor: 'bg-gradient-to-r from-[#C0C0C0] to-[#919191] text-black hover:shadow-[0_0_15px_rgba(192,192,192,0.5)]'
    },
    {
      title: 'Gold',
      price: '€6.99',
      period: '/mese',
      highlight: true,
      features: [
        "Tutti i vantaggi Silver",
        "4 indizi premium aggiuntivi a settimana",
        "Accesso anticipato di 12 ore agli eventi",
        "Partecipazione alle estrazioni Gold",
        "Badge Gold esclusivo nel profilo"
      ],
      buttonText: 'Scegli Gold',
      buttonColor: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]'
    },
    {
      title: 'Black',
      price: '€9.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Gold",
        "Accesso VIP anticipato di 24 ore agli eventi",
        "5 indizi premium aggiuntivi a settimana",
        "Badge Black esclusivo"
      ],
      buttonText: 'Scegli Black',
      buttonColor: 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.7)]'
    },
    {
      title: 'Titanium',
      price: '€29.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Black",
        "7 indizi premium aggiuntivi a settimana",
        "Accesso VIP anticipato di 48 ore agli eventi",
        "Supporto prioritario dedicato (24/7)",
        "Eventi esclusivi M1SSION™",
        "Badge Titanium esclusivo"
      ],
      buttonText: 'Scegli Titanium',
      buttonColor: 'bg-gradient-to-r from-[#E6E6FA] to-[#FFD700] text-black hover:shadow-[0_0_15px_rgba(230,230,250,0.8)]'
    }
  ];

  return (
    <ParallaxContainer>
      <BackgroundParallax />
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      {/* Floating Action Buttons - Fixed position */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <Button 
          onClick={() => setShowPrizeDetails(true)}
          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          size="icon"
        >
          <Info className="h-6 w-6" />
          <span className="sr-only">Dettagli premi</span>
        </Button>
        
        <Button 
          onClick={openInviteFriend}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          size="icon"
        >
          <UserPlus className="h-6 w-6" />
          <span className="sr-only">Invita un amico</span>
        </Button>
      </div>
      
      {/* HERO SECTION - WELCOME TO M1SSION™ */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-16">
        {/* Static background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-black to-[#111]">
          {/* Static dots */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                background: i % 2 === 0 ? "#00E5FF" : "#8A2BE2",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.4,
                filter: "blur(1px)"
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="z-10 max-w-5xl mx-auto">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-orbitron font-light mb-4">
            WELCOME TO{" "}
            <span>
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
          </h1>
          
          {/* MISSION START */}
          <p className="text-green-400 text-sm md:text-base font-orbitron tracking-widest mb-8">
            MISSION START
          </p>
          
          {/* Description text */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Un premio attende chi sa vedere oltre.
            Gli indizi non sono nascosti: sono camuffati.
            Serve logica, freddezza e visione.
            La sfida è iniziata. Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>.
          </p>
          
          <p className="text-yellow-300 text-sm md:text-base font-orbitron tracking-widest mb-10">
            IT IS POSSIBLE
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="neon-button px-8 py-3 rounded-full text-black font-bold bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              onClick={handleRegisterClick}
            >
              JOIN THE HUNT
            </button>
            <button 
              className="px-8 py-3 rounded-full text-white font-bold bg-black/30 border border-white/10 hover:bg-black/50 hover:border-white/20"
            >
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* NUOVO CONTAINER EXTRA - Aggiunto come richiesto */}
      <section className="relative py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🏆 Premi in Palio</h3>
            <div className="mb-6">
              <img 
                src="/lovable-uploads/12d4f02b-454c-41c7-b5b3-6aa5a5975086.png" 
                alt="M1SSION PREMI IN PALIO - MISSIONE UOMO"
                className="w-full h-64 object-cover rounded-lg border border-gray-700"
              />
            </div>
            <p className="text-gray-300">Vinci premi di lusso partecipando alle missioni M1SSION™</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Launch Progress Bar */}
      <LaunchProgressBar 
        targetDate={new Date(2025, 5, 19, 12, 0, 0)}  
        onCountdownComplete={() => {}}
      />

      {/* WELCOME TO M1SSION™ Text Section */}
      <section className="relative py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-orbitron mb-8">
              WELCOME TO{" "}
              <span>
                <span className="text-[#00E5FF]">M1</span>
                <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </span>
            </h2>
            
            <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
              In the near future... The world becomes a gameboard. The clues are encrypted. The stakes are real.
            </p>
            
            <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
              Thousands will try. Only a few will see the pattern. You're not just chasing a prize—you're chasing the proof that you can outthink them all.
            </p>

            <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
              This is <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. The countdown has begun. Are you ready?
            </p>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM SECTION - MODIFICATO: Pulsante attivo */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-cyan-900/40 to-pink-900/40"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Registrati per{" "}
              <span>
                <span className="text-[#00E5FF]">M1</span>
                <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </span>
            </h2>
            
            <p className="text-white/70 mb-6">
              Ottieni accesso esclusivo e un codice referral unico. Preparati per l'avventura che cambierà tutto.
            </p>
            
            <div className="space-y-4">
              <p className="text-yellow-400 text-lg font-semibold">
                🔒 Registrazioni chiuse
              </p>
              <p className="text-white/60 text-sm">
                Le registrazioni sono temporaneamente sospese in preparazione al lancio.
              </p>
              <Button 
                onClick={handleRegisterClick}
                className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xl font-bold py-4 px-12 rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                START M1SSION
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SCOPRI M1SSION SECTION - 4 Steps */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Scopri <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
            {/* Linea connettore per desktop */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#FFC107] to-[#FF00FF] z-0"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="glass-card relative z-10"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
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

          <div className="text-center">
            <Button 
              onClick={handleRegisterClick}
              className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black font-bold px-8 py-6 rounded-full text-lg hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              size="lg"
            >
              Inizia La Tua M1SSION
            </Button>
          </div>
        </div>
      </section>

      {/* STAY UPDATED SECTION */}
      <section className="py-12 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/70 mb-8">
            Get the latest updates about M1SSION™ and be the first to know about new challenges.
          </p>
        </div>
      </section>

      {/* SUBSCRIPTION SECTION - MODIFICATO: Allineamento singola riga */}
      <section className="py-16 px-4 bg-black relative">
        <div className="absolute inset-0 bg-[url('/public/images/grid-pattern.png')] opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold inline-block">
              <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span> Abbonamenti
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Scegli il piano più adatto a te e inizia la tua avventura. Tutti i piani offrono la possibilità di vincere premi reali.
            </p>
          </motion.div>
          
          {/* MODIFICATO: Grid per allineamento singola riga con 5 colonne */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={index}
                className={`rounded-xl relative p-4 ${sub.highlight ? 'bg-gradient-to-b from-[#00E5FF]/20 to-black/70 border border-[#00E5FF]/30' : 'bg-white/5 border border-white/10'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Badge per il piano consigliato */}
                {sub.highlight && (
                  <div className="absolute -top-3 -right-3 bg-[#00E5FF] text-black text-xs font-bold py-1 px-2 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Top
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{sub.title}</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-white">{sub.price}</span>
                    {sub.period && <span className="text-white/50 text-xs">{sub.period}</span>}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {sub.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                  {sub.features.length > 3 && (
                    <p className="text-white/60 text-xs">+{sub.features.length - 3} altri vantaggi</p>
                  )}
                </div>
                
                <Button
                  onClick={handleRegisterClick}
                  className={`w-full text-sm py-2 ${sub.buttonColor}`}
                  disabled={false}
                >
                  {sub.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              Tutti i piani sono soggetti ai termini e condizioni di servizio.
            </p>
          </div>
        </div>
      </section>

      {/* AGE VERIFICATION SECTION */}
      <section className="py-20 px-4 bg-black relative">
        <div className="max-w-lg mx-auto">
          <motion.div
            className="glass-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <IdCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Verifica la tua identità
              </h2>
              <p className="text-white/70">
                Per garantire un'esperienza di gioco sicura e conforme alle normative, è necessario completare la verifica dell'identità prima di ricevere premi.
              </p>
            </div>
            
            <Button 
              onClick={handleRegisterClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-full hover:shadow-[0_0_15px_rgba(128,0,128,0.5)]"
            >
              Vai alla verifica identità
            </Button>
          </motion.div>
        </div>
      </section>

      {/* INSTALLATION SECTION */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Installa <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h2>
            
            <p className="text-lg mb-8 text-gray-200">
              Per installare M1SSION™ sul tuo dispositivo mobile:
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center text-gray-300">
                <span className="mr-2">📱</span>
                <span><strong>iOS (Safari):</strong> premi il tasto "Condividi" e seleziona "Aggiungi alla Home"</span>
              </div>
              <div className="flex items-center justify-center text-gray-300">
                <span className="mr-2">🤖</span>
                <span><strong>Android (Chrome):</strong> apri il menu ⋮ e premi "Installa App"</span>
              </div>
            </div>
            
            <Button 
              onClick={handleRegisterClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full"
            >
              Aggiungi M1SSION™ alla tua Home
            </Button>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Modals */}
      {showPrizeDetails && (
        <PrizeDetailsModal 
          isOpen={showPrizeDetails}
          onClose={() => setShowPrizeDetails(false)}
        />
      )}

      {/* Age Verification Modal */}
      {showAgeVerification && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-black/90 border border-purple-500/30 rounded-xl p-6 max-w-md w-full relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button
              onClick={() => setShowAgeVerification(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Verifica dell'età</h3>
              <p className="text-white/70 mb-6">
                Confermi di avere almeno 18 anni? Questo gioco è riservato solo ai maggiorenni.
              </p>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowAgeVerification(false);
                    handleRegisterClick();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Sì, ho 18+ anni
                </Button>
                <Button
                  onClick={() => setShowAgeVerification(false)}
                  variant="outline"
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Friend Modal */}
      {showInviteFriend && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-black/90 border border-purple-500/30 rounded-xl p-6 max-w-md w-full relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button
              onClick={() => setShowInviteFriend(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Invita un amico</h3>
              <p className="text-white/70 mb-6">
                Condividi M1SSION™ con i tuoi amici e guadagna vantaggi esclusivi!
              </p>
              
              <Button
                onClick={() => {
                  setShowInviteFriend(false);
                  handleRegisterClick();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Ottieni il tuo codice referral
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </ParallaxContainer>
  );
};

export default LandingPage;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ Landing Page - Con modifiche chirurgiche applicate
 */