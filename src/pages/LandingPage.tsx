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
      {/* Enhanced Dynamic Background with Animated Gradient + Nebula Particles + Volumetric Fog */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 50%, rgba(0, 229, 255, 0.05) 100%)",
              "linear-gradient(135deg, rgba(255, 0, 255, 0.05) 0%, rgba(0, 229, 255, 0.05) 50%, rgba(255, 0, 255, 0.05) 100%)",
              "linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 50%, rgba(0, 229, 255, 0.05) 100%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Volumetric Fog Effect */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0, 229, 255, 0.1) 0%, transparent 60%)",
            filter: "blur(60px)"
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -20, 10, -15, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
            opacity: [0.03, 0.08, 0.05, 0.06, 0.03]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Enhanced Nebula Particles with Scroll Sync */}
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#FF00FF" : "#FFC107",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, -30, 0, 25, 0],
              x: [0, 15, -15, 10, 0],
              opacity: [0.08, 0.15, 0.08, 0.12, 0.08],
              scale: [0.5, 1.2, 0.8, 1.5, 0.5]
            }}
            transition={{
              duration: Math.random() * 22 + 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 8
            }}
          />
        ))}
      </div>

      <BackgroundParallax />
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      
      {/* Enhanced Floating Action Buttons - Fixed position */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setShowPrizeDetails(true)}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:shadow-xl"
            size="icon"
          >
            <Info className="h-6 w-6" />
            <span className="sr-only">Dettagli premi</span>
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={openInviteFriend}
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:shadow-xl"
            size="icon"
          >
            <UserPlus className="h-6 w-6" />
            <span className="sr-only">Invita un amico</span>
          </Button>
        </motion.div>
      </div>

      {/* HERO SECTION - Enhanced with Cinematic WOW Effects */}
      <motion.section 
        className="relative min-h-[70vh] w-full flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Cinematic Background with Volumetric Light */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-[#111]"
            animate={{
              background: [
                "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.9) 50%, #111111 100%)",
                "linear-gradient(to bottom, #000511 0%, rgba(0,20,40,0.9) 50%, #111111 100%)",
                "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.9) 50%, #111111 100%)"
              ]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Volumetric Light Beam with Soft Edges and Parallax */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-full opacity-20"
            style={{
              background: "linear-gradient(180deg, rgba(0, 229, 255, 0.4) 0%, rgba(0, 229, 255, 0.1) 40%, transparent 100%)",
              filter: "blur(40px)",
              clipPath: "polygon(45% 0%, 55% 0%, 65% 100%, 35% 100%)"
            }}
            animate={{
              x: [0, 10, -10, 5, 0],
              opacity: [0.15, 0.25, 0.15, 0.3, 0.15],
              scaleX: [1, 1.1, 0.9, 1.05, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Noise Animation on Light Beam */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-full opacity-10"
            style={{
              background: "radial-gradient(ellipse 100px 800px at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
              filter: "blur(20px)"
            }}
            animate={{
              y: [0, -50, 0, 30, 0],
              opacity: [0.05, 0.15, 0.08, 0.12, 0.05],
              scale: [1, 1.2, 0.8, 1.1, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Enhanced Hero Particles with Scroll Sync */}
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#FF00FF" : "#FFC107",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(1px)"
              }}
              animate={{
                y: [0, -40, 0, 30, 0],
                x: [0, 20, -15, 10, 0],
                opacity: [0.08, 0.25, 0.12, 0.2, 0.08],
                scale: [0.5, 1.5, 0.8, 1.3, 0.5]
              }}
              transition={{
                duration: Math.random() * 18 + 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 6
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          className="z-10 max-w-5xl mx-auto relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Enhanced Main Title with Pulsing Glow */}
          <motion.h1 
            className="text-4xl md:text-6xl xl:text-7xl font-orbitron font-light mb-4 relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(0, 229, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.4), 0 0 60px rgba(0, 229, 255, 0.2)",
                "0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 229, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.3)",
                "0 0 20px rgba(0, 229, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.4), 0 0 60px rgba(0, 229, 255, 0.2)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            WELCOME TO{" "}
            <span className="relative">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
          </motion.h1>
          
          {/* Sequential Fade-in Subtitles */}
          <motion.p 
            className="text-green-400 text-sm md:text-base font-orbitron tracking-widest mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            MISSION START
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            Un premio attende chi sa vedere oltre.
            Gli indizi non sono nascosti: sono camuffati.
            Serve logica, freddezza e visione.
            La sfida è iniziata. Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>.
          </motion.p>
          
          <motion.p 
            className="text-yellow-300 text-sm md:text-base font-orbitron tracking-widest mb-10 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            IT IS POSSIBLE
          </motion.p>
          
          {/* Enhanced Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.0 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-full"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "linear-gradient(45deg, #00E5FF, #FF00FF, #00E5FF)",
                    "linear-gradient(135deg, #FF00FF, #00E5FF, #FF00FF)",
                    "linear-gradient(45deg, #00E5FF, #FF00FF, #00E5FF)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <button 
                className="relative px-8 py-3 text-black font-bold bg-transparent hover:bg-transparent transition-all duration-300"
                onClick={handleRegisterClick}
                style={{
                  textShadow: "0 0 10px rgba(0,0,0,0.8)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "drop-shadow(0 0 20px rgba(0, 229, 255, 0.8))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                }}
              >
                JOIN THE HUNT
              </button>
            </motion.div>
            
            <motion.button 
              className="px-8 py-3 rounded-full text-white font-bold bg-black/30 border border-white/20 hover:bg-black/50 hover:border-white/40 transition-all duration-300 relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textShadow = "0 0 15px rgba(255, 255, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = "none";
              }}
            >
              <motion.span
                className="absolute inset-0 border border-white/10 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 5px rgba(255, 255, 255, 0.1)",
                    "0 0 15px rgba(255, 255, 255, 0.3)",
                    "0 0 5px rgba(255, 255, 255, 0.1)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              LEARN MORE
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CONTAINER PREMI IN PALIO - Cinematic Scroll Zoom Effect */}
      <motion.section 
        className="relative py-20 px-4 bg-black"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="relative m1ssion-glass-card overflow-hidden bg-black/60 backdrop-blur-xl shadow-lg p-10"
            initial={{ scale: 0.95, rotateX: 5, rotateY: 2 }}
            whileInView={{ scale: 1, rotateX: 0, rotateY: 0 }}
            whileHover={{ 
              scale: 1.03,
              rotateX: 2,
              rotateY: 2,
              boxShadow: "0 0 50px rgba(255, 0, 255, 0.4), 0 0 100px rgba(0, 229, 255, 0.3)"
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
              boxShadow: "0 0 30px rgba(0, 229, 255, 0.2)"
            }}
          >
            {/* Label "Premi M1SSION™" */}
            <motion.div 
              className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-[#00E5FF] text-sm font-bold border border-cyan-500/30"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Premi M1SSION™
            </motion.div>
            
            <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 overflow-hidden rounded-lg">
              <motion.img 
                src="/lovable-uploads/12d4f02b-454c-41c7-b5b3-6aa5a5975086.png" 
                alt="M1SSION PREMI IN PALIO - MISSIONE UOMO"
                className="w-full h-full object-cover shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Enhanced Neon Animated Overlay */}
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(0, 229, 255, 0.08) 50%, transparent 70%)",
                  mixBlendMode: "screen"
                }}
                animate={{
                  background: [
                    "linear-gradient(45deg, transparent 30%, rgba(0, 229, 255, 0.08) 50%, transparent 70%)",
                    "linear-gradient(45deg, transparent 30%, rgba(255, 0, 255, 0.08) 50%, transparent 70%)",
                    "linear-gradient(45deg, transparent 30%, rgba(0, 229, 255, 0.08) 50%, transparent 70%)"
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Glowing Border Effect */}
              <motion.div 
                className="absolute inset-0 border-2 border-transparent rounded-lg"
                animate={{
                  borderColor: [
                    "rgba(0, 229, 255, 0.3)",
                    "rgba(255, 0, 255, 0.3)",
                    "rgba(0, 229, 255, 0.3)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Disclaimer Overlay */}
              <motion.div 
                className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-white text-[14px] md:text-[18px] font-medium border border-white/20"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                Image for illustrative purposes only
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Launch Progress Bar - Animated */}
      <motion.section 
        className="relative py-16 px-4 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold mb-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span> in arrivo
          </motion.h3>
          
           <motion.div 
             className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 mb-4"
             initial={{ scale: 0.8, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.4 }}
           >
             {/* Living Progress Bar with Wave Animation */}
             <motion.div
               className="h-full rounded-full relative overflow-hidden"
               style={{
                 background: "linear-gradient(90deg, #00E5FF, #FF00FF, #00E5FF)"
               }}
               animate={{
                 background: [
                   "linear-gradient(90deg, #00E5FF, #FF00FF, #00E5FF)",
                   "linear-gradient(90deg, #FF00FF, #00E5FF, #FF00FF)",
                   "linear-gradient(90deg, #00E5FF, #FF00FF, #00E5FF)"
                 ],
                 width: ["0%", "78%"],
                 borderRadius: ["0px", "50px 50px 50px 50px", "0px"]
               }}
               transition={{
                 background: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                 width: { duration: 2, ease: "easeOut" },
                 borderRadius: { duration: 4, repeat: Infinity, ease: "easeInOut" }
               }}
             />
             
             {/* Wave Animation Effect */}
             <motion.div
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
               animate={{ 
                 x: ["-100%", "100%"],
                 scaleY: [1, 1.2, 1, 0.8, 1]
               }}
               transition={{ 
                 x: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                 scaleY: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
               }}
             />
             
             {/* Pulse Glow Effect */}
             <motion.div
               className="absolute inset-0 rounded-full"
               animate={{
                 boxShadow: [
                   "0 0 10px rgba(0, 229, 255, 0.3)",
                   "0 0 20px rgba(255, 0, 255, 0.5)",
                   "0 0 10px rgba(0, 229, 255, 0.3)"
                 ]
               }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             />
           </motion.div>
          
          <motion.p 
            className="text-white/70 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            78% completato - La caccia inizia presto
          </motion.p>
        </div>
      </motion.section>

      {/* WELCOME TO M1SSION™ Text Section */}
      <motion.section 
        className="relative py-20 px-4 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/* REGISTRATION FORM SECTION - Cinematic Split Reveal Effect */}
      <motion.section 
        className="relative py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-cyan-900/40 to-pink-900/40"></div>
        <div className="max-w-lg mx-auto relative z-10">
          <motion.div 
            className="relative m1ssion-glass-card overflow-hidden bg-black/60 backdrop-blur-xl shadow-lg p-10 text-center"
            initial={{ 
              clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
              scale: 1.1
            }}
            whileInView={{ 
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              scale: 1
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(0, 229, 255, 0.3)"
            }}
            transition={{ 
              clipPath: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
              scale: { duration: 0.8, ease: "easeOut" }
            }}
            style={{
              boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)"
            }}
          >
            {/* Split Reveal Light Bands */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-magenta-400/20 to-transparent"
              initial={{ x: "100%" }}
              whileInView={{ x: "-100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
            />
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl"
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, #ec4899, #d946ef, #ec4899, #d946ef)"
                  }}
                  animate={{
                    background: [
                      "linear-gradient(45deg, #ec4899, #d946ef, #ec4899, #d946ef)",
                      "linear-gradient(135deg, #d946ef, #ec4899, #d946ef, #ec4899)",
                      "linear-gradient(45deg, #ec4899, #d946ef, #ec4899, #d946ef)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <Button 
                  onClick={handleRegisterClick}
                  className="relative w-full bg-transparent text-white text-xl font-bold py-4 px-12 hover:bg-transparent transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
                  style={{
                    boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(236, 72, 153, 0.3)";
                  }}
                >
                  START M1SSION
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* SCOPRI M1SSION SECTION - 4 Steps */}
      <motion.section 
        className="py-20 px-4 bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
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
      </motion.section>

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