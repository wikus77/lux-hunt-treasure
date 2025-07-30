// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NUOVA LANDING PAGE - Design Bianco con Animazione Goccia d'Inchiostro

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, X, Info, UserPlus } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import AdminEmergencyLogin from "@/components/auth/AdminEmergencyLogin";

const LandingPage = () => {
  const [, setLocation] = useLocation();
  
  // Animation states
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  // Other modals
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [showEmergencyLogin, setShowEmergencyLogin] = useState(false);

  // 🚨 EMERGENCY ADMIN ACCESS TRIGGER (Triple click logo)
  const [logoClickCount, setLogoClickCount] = useState(0);
  
  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        setShowEmergencyLogin(true);
        return 0;
      }
      setTimeout(() => setLogoClickCount(0), 2000);
      return newCount;
    });
  };

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

  // Event handlers
  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    setLocation('/register');
  };

  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  // Subscription plans data
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
            <button onClick={handleLogoClick} className="font-orbitron">
              <h1 className="text-4xl md:text-5xl font-bold">
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
            </button>
          </div>
        </header>

        {/* Floating Action Buttons - Fixed position */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
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

        {/* CINEMATOGRAPHIC ANIMATION OVERLAY */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              className="fixed inset-0 z-30 bg-white overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.98) 100%),
                  radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(0,0,0,0.02) 0%, transparent 50%)
                `,
                backgroundSize: '100% 100%, 300px 300px, 400px 400px'
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {/* PHASE 1: REALISTIC INK DROP FROM TOP */}
              {animationPhase >= 1 && (
                <motion.div
                  className="absolute z-40"
                  style={{ 
                    top: "-20px", 
                    left: "50%", 
                    transform: "translateX(-50%)",
                    perspective: "1000px"
                  }}
                  initial={{ y: -50, scale: 0.5, rotateX: 45 }}
                  animate={{ 
                    y: animationPhase >= 2 ? 400 : 0,
                    scale: animationPhase >= 2 ? [0.5, 0.8, 1.2] : [0.5, 0.7, 1],
                    rotateX: animationPhase >= 2 ? [45, 0, 0] : [45, 15, 0]
                  }}
                  transition={{ 
                    duration: animationPhase >= 2 ? 1.2 : 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <div 
                    className="w-12 h-16 rounded-full relative"
                    style={{
                      background: `
                        radial-gradient(ellipse 50% 80% at center 20%, #1a1a1a 0%, #000 40%, #1a1a1a 70%, #000 100%)
                      `,
                      boxShadow: `
                        0 8px 32px rgba(0,0,0,0.6),
                        inset 0 2px 8px rgba(255,255,255,0.1),
                        0 0 0 1px rgba(0,0,0,0.8)
                      `,
                      filter: "blur(0.5px) contrast(1.2)",
                      transform: "rotateX(-15deg) rotateY(5deg)",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Ink drop highlight */}
                    <div 
                      className="absolute top-2 left-1/2 w-3 h-4 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                        transform: "translateX(-50%)"
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE 2: REALISTIC OIL SPLASH WITH 3D EFFECTS */}
              {animationPhase >= 2 && (
                <motion.div
                  className="absolute z-30"
                  style={{ 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)",
                    perspective: "800px"
                  }}
                  initial={{ scale: 0, rotateZ: 0 }}
                  animate={{ 
                    scale: animationPhase >= 3 ? [0, 1.5, 3, 4.5] : [0, 0.8, 1.5],
                    rotateZ: animationPhase >= 3 ? [0, 45, 180] : [0, 15, 0]
                  }}
                  transition={{ 
                    duration: animationPhase >= 3 ? 1.8 : 1.2,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  {/* Main oil stain with realistic 3D effect */}
                  <div 
                    className="w-32 h-32 rounded-full relative"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, #2a2a2a 0%, #000 25%, #1a1a1a 50%, #000 75%, #0a0a0a 100%)
                      `,
                      boxShadow: `
                        0 0 60px rgba(0,0,0,0.8),
                        inset 0 0 30px rgba(0,0,0,0.9),
                        inset 8px 8px 20px rgba(255,255,255,0.05),
                        inset -8px -8px 20px rgba(0,0,0,0.8),
                        0 20px 40px rgba(0,0,0,0.6)
                      `,
                      transform: "rotateX(75deg) rotateY(0deg) rotateZ(0deg)",
                      transformStyle: "preserve-3d",
                      filter: "contrast(1.3) brightness(0.9)"
                    }}
                  >
                    {/* Liquid surface texture */}
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `
                          conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 25%, transparent 50%, rgba(255,255,255,0.05) 75%, transparent 100%)
                        `,
                        filter: "blur(1px)"
                      }}
                    />
                    
                    {/* Oil splash edges with irregular shape */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: `${20 + Math.random() * 30}px`,
                          height: `${15 + Math.random() * 25}px`,
                          background: "radial-gradient(circle, #1a1a1a 0%, #000 60%, transparent 100%)",
                          top: "50%",
                          left: "50%",
                          transform: `
                            translate(-50%, -50%) 
                            rotate(${i * 45}deg) 
                            translateY(-${40 + Math.random() * 20}px)
                          `,
                          filter: "blur(0.5px)",
                          opacity: 0.7
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.2, 0.8, 1],
                          opacity: [0, 0.8, 0.6, 0.4]
                        }}
                        transition={{ 
                          duration: 1.5,
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PHASE 3: 3D BLACK HOLE VORTEX WITH GRAVITATIONAL EFFECT */}
              {animationPhase >= 3 && (
                <motion.div
                  className="absolute z-20"
                  style={{ 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)",
                    perspective: "600px"
                  }}
                  initial={{ scale: 4.5, rotate: 0 }}
                  animate={{ 
                    scale: [4.5, 3.5, 2.5, 1.8],
                    rotate: [0, 360, 720, 1080]
                  }}
                  transition={{ 
                    duration: 2.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  {/* Black hole center with event horizon */}
                  <div 
                    className="w-32 h-32 rounded-full relative"
                    style={{
                      background: `
                        radial-gradient(circle at center, #000 0%, #000 30%, #1a1a1a 60%, #000 100%)
                      `,
                      boxShadow: `
                        0 0 80px rgba(0,0,0,0.9),
                        inset 0 0 40px rgba(0,0,0,1),
                        0 0 120px rgba(0,0,0,0.7),
                        0 0 200px rgba(0,0,0,0.4)
                      `,
                      transform: "rotateX(0deg)",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Accretion disk rings with 3D perspective */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border"
                        style={{
                          width: `${140 + i * 40}px`,
                          height: `${60 + i * 20}px`,
                          borderColor: `rgba(${100 + i * 30}, ${50 + i * 20}, 0, ${0.6 - i * 0.1})`,
                          borderWidth: "2px",
                          top: "50%",
                          left: "50%",
                          transform: `
                            translate(-50%, -50%) 
                            rotateX(75deg) 
                            rotateZ(${i * 15}deg)
                          `,
                          transformStyle: "preserve-3d",
                          filter: "blur(1px) brightness(1.2)"
                        }}
                        animate={{ 
                          rotateZ: [i * 15, i * 15 + 360]
                        }}
                        transition={{ 
                          duration: 3 - i * 0.3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    ))}
                    
                    {/* Gravitational lensing effect */}
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `
                          conic-gradient(from 0deg, 
                            transparent 0%, 
                            rgba(255,255,255,0.1) 10%, 
                            transparent 20%,
                            rgba(255,255,255,0.05) 30%,
                            transparent 40%,
                            rgba(255,255,255,0.1) 50%,
                            transparent 60%,
                            rgba(255,255,255,0.05) 70%,
                            transparent 80%,
                            rgba(255,255,255,0.1) 90%,
                            transparent 100%
                          )
                        `,
                        filter: "blur(2px)",
                        animation: "spin 2s linear infinite"
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE 4: EMERGENT "START M1SSION" TEXT WITH CINEMATIC ENTRANCE */}
              {animationPhase >= 4 && (
                <motion.div
                  className="absolute text-center z-50"
                  style={{ 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)",
                    perspective: "800px"
                  }}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.3, 
                    rotateX: 90,
                    y: 100
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotateX: 0,
                    y: 0
                  }}
                  transition={{ 
                    duration: 1.2, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.3
                  }}
                >
                  <motion.button
                    onClick={() => {
                      setShowAnimation(false);
                      setShowModal(true);
                    }}
                    className="font-orbitron cursor-pointer group"
                    whileHover={{ 
                      scale: 1.05,
                      rotateX: 5
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h2 
                      className="text-4xl md:text-6xl font-bold text-white"
                      style={{
                        textShadow: `
                          3px 3px 0px #000, 
                          -3px -3px 0px #000, 
                          3px -3px 0px #000, 
                          -3px 3px 0px #000,
                          0 0 20px rgba(255,255,255,0.8),
                          0 0 40px rgba(255,255,255,0.4),
                          0 0 60px rgba(255,255,255,0.2)
                        `,
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                        transform: "rotateX(-5deg)",
                        transformStyle: "preserve-3d"
                      }}
                    >
                      START M1SSION
                    </h2>
                    
                    {/* Glowing underline effect */}
                    <motion.div
                      className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-4"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      style={{
                        boxShadow: "0 0 20px rgba(255,255,255,0.8)"
                      }}
                    />
                  </motion.button>
                </motion.div>
              )}
              
              {/* Ambient light effects for atmosphere */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 20% 30%, rgba(0,0,0,0.05) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 40%)
                  `
                }}
              />
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
                    handleRegisterClick();
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

      {/* Prize Details Modal */}
      <PrizeDetailsModal
        isOpen={showPrizeDetails} 
        onClose={() => setShowPrizeDetails(false)} 
      />

      {/* Age Verification Modal - Keeping original functionality */}
      {showAgeVerification && (
        <Dialog open={showAgeVerification} onOpenChange={setShowAgeVerification}>
          <DialogContent className="bg-black text-white">
            <DialogHeader>
              <DialogTitle>Verifica dell'età</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Devi avere almeno 18 anni per registrarti a M1SSION™.</p>
              <div className="flex gap-4">
                <Button onClick={handleAgeVerified} className="bg-[#00E5FF] text-black">
                  Ho più di 18 anni
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAgeVerification(false)}
                  className="border-white/20 text-white"
                >
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Friend Modal - Keeping original functionality */}
      {showInviteFriend && (
        <Dialog open={showInviteFriend} onOpenChange={setShowInviteFriend}>
          <DialogContent className="bg-black text-white">
            <DialogHeader>
              <DialogTitle>Invita un amico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Condividi M1SSION™ con i tuoi amici!</p>
              <Button 
                onClick={() => setShowInviteFriend(false)}
                className="bg-[#00E5FF] text-black"
              >
                Chiudi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Emergency Admin Login Modal */}
      {showEmergencyLogin && (
        <Dialog open={showEmergencyLogin} onOpenChange={setShowEmergencyLogin}>
          <DialogContent className="bg-black text-white">
            <DialogHeader>
              <DialogTitle>Accesso Admin di Emergenza</DialogTitle>
            </DialogHeader>
            <AdminEmergencyLogin onClose={() => setShowEmergencyLogin(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default LandingPage;
