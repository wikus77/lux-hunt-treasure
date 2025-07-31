// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, Info, IdCard, UserCheck, Check, MapPin, Award, X, Sparkles, ArrowDown, Play, ChevronRight } from "lucide-react";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import LandingFooter from "@/components/landing/LandingFooter";
import AdminEmergencyLogin from "@/components/auth/AdminEmergencyLogin";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [, setLocation] = useLocation();
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [showEmergencyLogin, setShowEmergencyLogin] = useState(false);
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);

  console.log('🌟 M1SSION™ LANDING PAGE - Xavier Cusso Style - Showing to anonymous user');

  // GSAP Animations setup
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Hero entrance animation
    if (titleRef.current) {
      gsap.fromTo(titleRef.current.children, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power2.out" }
      );
    }
    
    // Sections reveal on scroll
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(section, 
          { y: 50, opacity: 0 },
          {
            y: 0, 
            opacity: 1, 
            duration: 0.8,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // 🚨 EMERGENCY ADMIN ACCESS TRIGGER (Triple click logo)
  const [logoClickCount, setLogoClickCount] = useState(0);
  
  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        console.log('🚨 EMERGENCY ACCESS ACTIVATED');
        setShowEmergencyLogin(true);
        return 0; // Reset counter
      }
      // Reset after 2 seconds
      setTimeout(() => setLogoClickCount(0), 2000);
      return newCount;
    });
  };

  // 🚨 EMERGENCY ACCESS TRIGGER - Global keyboard listener
  useEffect(() => {
    const handleKeySequence = (e: KeyboardEvent) => {
      // Ctrl + Shift + E = Emergency Admin Login
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        console.log('🚨 EMERGENCY ACCESS TRIGGERED - Keyboard');
        setShowEmergencyLogin(true);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeySequence);
    return () => document.removeEventListener('keydown', handleKeySequence);
  }, []);

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
    <div className="min-h-screen bg-black overflow-x-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,229,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,255,0.1),transparent_50%)]" />
        
        {/* Floating Elements */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? "#00E5FF" : "#FF00FF",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <motion.button 
          onClick={() => setShowPrizeDetails(true)}
          className="p-4 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Info className="h-6 w-6" />
        </motion.button>
        
        <motion.button 
          onClick={openInviteFriend}
          className="p-4 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-400 hover:bg-purple-500/30 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className="h-6 w-6" />
        </motion.button>
      </div>
      
      {/* HERO SECTION - Xavier Cusso Style */}
      <section 
        ref={heroRef}
        className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden"
      >
        {/* Main Title */}
        <div className="z-10 max-w-6xl mx-auto">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-7xl lg:text-[8rem] font-black leading-none mb-6"
          >
            <div className="overflow-hidden">
              <span className="text-cyan-400 glow-text block drop-shadow-[0_0_30px_rgba(0,229,255,0.8)]">
                M1
              </span>
            </div>
            <div className="overflow-hidden -mt-8">
              <span className="text-white block">
                SSION<span className="text-2xl align-top">™</span>
              </span>
            </div>
          </h1>
          
          <motion.p 
            className="text-2xl md:text-3xl text-gray-300 font-black tracking-[0.3em] mb-12 uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            MISSION START
          </motion.p>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 mb-16 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            Un premio attende chi sa vedere oltre. Gli indizi non sono nascosti: sono camuffati. 
            Serve logica, freddezza e visione. La sfida è iniziata.
          </motion.p>
          
          <motion.div 
            className="text-yellow-300 text-lg md:text-xl tracking-[0.5em] mb-16 relative overflow-hidden font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            IT IS POSSIBLE
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center overflow-visible"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            <motion.button 
              className="px-12 py-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-black text-xl font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] transition-all duration-500 relative overflow-hidden group"
              onClick={handleRegisterClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">JOIN THE HUNT</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
            
            <motion.button 
              className="px-12 py-6 rounded-full text-white font-black uppercase tracking-wider bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LEARN MORE
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </section>

      {/* PREMI IN PALIO SECTION - Xavier Cusso Style */}
      <section 
        ref={(el) => el && (sectionsRef.current[0] = el)}
        className="relative py-32 px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-none">
              <span className="text-white">PREMI </span><span className="text-cyan-400">REALI</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Non simulazioni. Non gettoni virtuali. Premi tangibili che puoi toccare, usare, possedere.
            </p>
          </motion.div>

          <motion.div 
            className="relative h-[60vh] rounded-3xl bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-60" />
            
            <img 
              src="/lovable-uploads/12d4f02b-454c-41c7-b5b3-6aa5a5975086.png" 
              alt="M1SSION PREMI IN PALIO"
              className="w-full h-full object-cover"
            />
            
            {/* Animated scanner effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-lg text-white/80 text-sm">
              Image for representation purposes
            </div>
          </motion.div>
        </div>
      </section>

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
                width: ["0%", "78%"]
              }}
              transition={{
                background: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                width: { duration: 2, ease: "easeOut" }
              }}
            />
            
            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
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

      {/* REGISTRATION FORM SECTION - Stile M1SSION Prize con Gradient Animato */}
      <motion.section 
        className="relative py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-cyan-900/40 to-pink-900/40"></div>
        <div className="max-w-lg mx-auto relative z-10">
          <motion.div 
            className="relative m1ssion-glass-card overflow-hidden bg-black/60 backdrop-blur-xl shadow-lg p-10 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
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
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80"></div>
        
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

      {/* Emergency Admin Login Modal */}
      {showEmergencyLogin && (
        <AdminEmergencyLogin onClose={() => setShowEmergencyLogin(false)} />
      )}

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
    </div>
  );
};

export default LandingPage;