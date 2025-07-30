// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// New Landing Page with White Design and Ink Drop Animation

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, X } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";

interface NewLandingPageProps {
  onRegisterClick: () => void;
  openInviteFriend: () => void;
}

const NewLandingPage = ({ onRegisterClick, openInviteFriend }: NewLandingPageProps) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Animation sequence: after 1 second start the ink drop animation
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase(1); // Start ink drop
    }, 1000);

    const timer2 = setTimeout(() => {
      setAnimationPhase(2); // Oil splash circle
    }, 1500);

    const timer3 = setTimeout(() => {
      setAnimationPhase(3); // Swirling black hole
    }, 2500);

    const timer4 = setTimeout(() => {
      setAnimationPhase(4); // "START M1SSION" appears
    }, 3500);

    const timer5 = setTimeout(() => {
      setShowAnimation(false); // Hide animation
      setShowModal(true); // Show subscription modal
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  // Subscription plans data (same as existing)
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
    <>
      {/* Main Container with White Background */}
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* White Header */}
        <header className="w-full h-20 bg-white flex items-center justify-center relative z-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold">
              <span 
                className="text-[#00FFFF]" 
                style={{ 
                  textShadow: "0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.3)" 
                }}
              >
                M1
              </span>
              <span 
                className="text-white"
                style={{
                  textShadow: "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000"
                }}
              >
                SSION
              </span>
            </h1>
          </div>
        </header>

        {/* Animation Overlay */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              className="fixed inset-0 z-30 flex items-center justify-center bg-white"
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Ink Drop Animation */}
              {animationPhase >= 1 && (
                <motion.div
                  className="absolute"
                  style={{ 
                    top: "10%", 
                    left: "50%", 
                    transform: "translateX(-50%)"
                  }}
                  initial={{ y: -100, scale: 0 }}
                  animate={{ 
                    y: animationPhase >= 2 ? 300 : 0,
                    scale: animationPhase >= 2 ? [1, 0.5, 2, 4] : 1,
                  }}
                  transition={{ 
                    duration: animationPhase >= 2 ? 1.5 : 1,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="w-8 h-8 bg-black rounded-full"
                    style={{
                      background: animationPhase >= 2 
                        ? "radial-gradient(circle, #000 0%, #333 50%, #000 100%)"
                        : "#000"
                    }}
                  />
                </motion.div>
              )}

              {/* Oil Splash Circle */}
              {animationPhase >= 2 && (
                <motion.div
                  className="absolute"
                  style={{ 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)"
                  }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: animationPhase >= 3 ? [2, 4, 6] : [0, 1, 2],
                    rotate: animationPhase >= 3 ? [0, 180, 360, 720] : 0,
                  }}
                  transition={{ 
                    duration: animationPhase >= 3 ? 2 : 1,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="w-32 h-32 bg-black rounded-full"
                    style={{
                      background: animationPhase >= 3
                        ? "conic-gradient(from 0deg, #000, #333, #000, #333, #000)"
                        : "radial-gradient(circle, #000 0%, rgba(0,0,0,0.7) 70%, transparent 100%)",
                      filter: animationPhase >= 3 
                        ? "blur(2px) contrast(1.5)" 
                        : "blur(1px)"
                    }}
                  />
                </motion.div>
              )}

              {/* "START M1SSION" Text */}
              {animationPhase >= 4 && (
                <motion.div
                  className="absolute text-center"
                  style={{ 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)"
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <h2 
                    className="text-3xl md:text-4xl font-orbitron font-bold text-white"
                    style={{
                      textShadow: "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0 0 10px rgba(255,255,255,0.8)"
                    }}
                  >
                    START M1SSION
                  </h2>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-gray-600 text-lg md:text-xl mb-8">
              Un premio attende chi sa vedere oltre.
              Gli indizi non sono nascosti: sono camuffati.
              Serve logica, freddezza e visione.
            </p>
            <p className="text-gray-800 text-xl md:text-2xl font-semibold">
              La sfida è iniziata. Questa è M1SSION™.
            </p>
          </div>
        </div>

        {/* Legal Information Section - Bottom */}
        <div className="bg-white border-t border-gray-200">
          <LandingFooter />
        </div>
      </div>

      {/* Subscription Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-black text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl md:text-3xl font-bold">
              <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span> Abbonamenti
            </DialogTitle>
            <p className="mt-4 text-white/70 text-center max-w-2xl mx-auto">
              Scegli il piano più adatto a te e inizia la tua avventura. Tutti i piani offrono la possibilità di vincere premi reali.
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={index}
                className={`rounded-xl relative p-6 ${sub.highlight ? 'bg-gradient-to-b from-[#00E5FF]/20 to-black/70 border border-[#00E5FF]/30' : 'bg-white/5 border border-white/10'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Badge per il piano consigliato */}
                {sub.highlight && (
                  <div className="absolute -top-3 -right-3 bg-[#00E5FF] text-black text-xs font-bold py-1 px-3 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Consigliato
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">{sub.title}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-white">{sub.price}</span>
                    {sub.period && <span className="text-white/50 text-sm">{sub.period}</span>}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {sub.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm">
                      <span className="text-green-400 mr-2 mt-0.5">✓</span>
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                  {sub.notIncluded?.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm">
                      <X className="w-3 h-3 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/50">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${sub.buttonColor} font-bold py-3 text-sm`}
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
          
          <div className="mt-8 text-center">
            <Button 
              onClick={() => setShowModal(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Continua a esplorare
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewLandingPage;