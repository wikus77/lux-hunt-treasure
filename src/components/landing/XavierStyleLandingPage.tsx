// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Xavier Cusso Style Landing Page - Bold Typography & Cinematic Animations

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, X, ArrowRight } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import GlobalPulseBar from "@/components/pulse/GlobalPulseBar";
import AgentDNAWidget from "@/components/dna/AgentDNAWidget";
import PowerBuzzModal from "@/components/monetization/PowerBuzzModal";
import { M1UnitsPill } from "@/components/m1units/M1UnitsPill";

interface XavierStyleLandingPageProps {
  onRegisterClick: () => void;
  openInviteFriend: () => void;
}

const XavierStyleLandingPage = ({ onRegisterClick, openInviteFriend }: XavierStyleLandingPageProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showPowerBuzz, setShowPowerBuzz] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Reveal animation for title characters
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char');
      chars.forEach((char, index) => {
        const element = char as HTMLElement;
        setTimeout(() => {
          element.style.transform = 'translateY(0)';
          element.style.opacity = '1';
        }, index * 100 + 500);
      });
    }

    // Sections reveal animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        className="char inline-block transition-all duration-500 ease-out"
        style={{ 
          display: char === ' ' ? 'inline' : 'inline-block',
          transform: 'translateY(100px)',
          opacity: 0
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

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
      buttonColor: 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]'
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
      buttonColor: 'bg-gradient-to-r from-slate-300 to-slate-500 text-black hover:shadow-[0_0_20px_rgba(148,163,184,0.6)]'
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
      buttonColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.6)]'
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
      buttonColor: 'bg-gradient-to-r from-gray-800 to-black text-white hover:shadow-[0_0_20px_rgba(75,85,99,0.6)]'
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
      buttonColor: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* M1 Units Pill - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <M1UnitsPill />
      </div>

      {/* Animated Background */}
      <div className="fixed inset-0 bg-animated opacity-80" />
      
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto relative z-10">
          {/* Main Title - Xavier Cusso Style */}
          <div ref={titleRef} className="mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
              <div className="overflow-hidden">
                <span className="text-cyan-400 glow-text block">
                  {splitText("M1")}
                </span>
              </div>
              <div className="overflow-hidden -mt-4">
                <span className="text-white block">
                  {splitText("SSION")}
                </span>
              </div>
            </h1>
          </div>

          {/* Subtitle with glitch effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              UN PREMIO ATTENDE CHI SA VEDERE OLTRE.<br />
              GLI INDIZI NON SONO NASCOSTI: SONO CAMUFFATI.<br />
              SERVE LOGICA, FREDDEZZA E VISIONE.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            <Button
              onClick={() => setShowModal(true)}
              className="group bg-gradient-to-r from-cyan-400 to-purple-600 text-black text-lg px-8 py-4 rounded-none hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 hover:scale-105"
            >
              INIZIA LA MISSIONE
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Living Map™ 2.0 - PULSE & DNA Widgets */}
      <section className="relative py-16 px-4 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Global PULSE Bar */}
            <div className="flex items-center justify-center">
              <GlobalPulseBar onPowerBuzzClick={() => setShowPowerBuzz(true)} />
            </div>
            
            {/* Agent DNA Widget */}
            <div className="flex items-center justify-center">
              <AgentDNAWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Description Section */}
      <section ref={addToRefs} className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-12 text-white">
            LA SFIDA È INIZIATA.<br />
            <span className="text-gradient bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              QUESTA È M1SSION™
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Un'esperienza che trascende il gaming tradizionale. Ogni indizio è una chiave, 
            ogni decisione un passo verso la verità. I confini tra reale e digitale si dissolvono 
            in un'avventura che mette alla prova intelligenza, intuito e determinazione.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={addToRefs} className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "INTELLIGENZA",
                description: "Ogni enigma richiede logica pura e capacità di analisi. Non esistono soluzioni casuali.",
                accent: "from-cyan-400 to-blue-600"
              },
              {
                title: "INTUITO",
                description: "Oltre la logica, serve l'istinto per cogliere i dettagli che altri non vedono.",
                accent: "from-purple-400 to-pink-600"
              },
              {
                title: "DETERMINAZIONE",
                description: "Solo chi persevera fino alla fine può ambire ai premi più esclusivi.",
                accent: "from-yellow-400 to-orange-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative p-8 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <h3 className="text-2xl font-black mb-4 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={addToRefs} className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-16 text-white">
            I NOSTRI <span className="text-cyan-400">VALORI</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              "SFIDA COSTANTE: Ogni momento è un'opportunità per superare i propri limiti",
              "ECCELLENZA: Solo i migliori raggiungeranno i premi più ambiti",
              "INNOVAZIONE: Tecnologie all'avanguardia per un'esperienza senza precedenti", 
              "COMMUNITY: Una rete globale di menti brillanti unite dalla stessa passione"
            ].map((value, index) => (
              <motion.div
                key={index}
                className="text-xl text-gray-300 p-6 border-l-4 border-cyan-400"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-white/10">
        <LandingFooter />
      </div>

      {/* Subscription Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-black/95 text-white border border-cyan-400/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl md:text-4xl font-black">
              <span className="text-cyan-400">M1</span><span className="text-white">SSION</span> 
              <span className="block text-xl mt-2 font-normal text-gray-300">ABBONAMENTI</span>
            </DialogTitle>
            <p className="mt-6 text-gray-300 text-center max-w-3xl mx-auto text-lg">
              Scegli il piano più adatto a te e inizia la tua avventura. Tutti i piani offrono la possibilità di vincere premi reali.
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-12">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={index}
                className={`relative p-6 backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  sub.highlight 
                    ? 'bg-gradient-to-b from-cyan-400/20 to-black/70 border-cyan-400/50' 
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {sub.highlight && (
                  <div className="absolute -top-3 -right-3 bg-cyan-400 text-black text-xs font-bold py-1 px-3 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Consigliato
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white">{sub.title}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-white">{sub.price}</span>
                    {sub.period && <span className="text-gray-400 text-sm">{sub.period}</span>}
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {sub.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm">
                      <span className="text-cyan-400 mr-2 mt-0.5 font-bold">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                  {sub.notIncluded?.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm">
                      <X className="w-3 h-3 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${sub.buttonColor} font-black py-3 text-sm transition-all duration-300 hover:scale-105`}
                  onClick={() => {
                    setShowModal(false);
                    onRegisterClick();
                  }}
                >
                  {sub.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => setShowModal(false)}
              variant="outline"
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-bold"
            >
              Continua a esplorare
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Power Buzz Modal */}
      <PowerBuzzModal 
        open={showPowerBuzz} 
        onOpenChange={setShowPowerBuzz} 
      />
    </div>
  );
};

export default XavierStyleLandingPage;