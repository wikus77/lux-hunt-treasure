// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, Info, IdCard, UserCheck, Check, MapPin, Award, X, Sparkles, ArrowDown, Play, ChevronRight } from "lucide-react";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import LandingFooter from "@/components/landing/LandingFooter";
import AdminEmergencyLogin from "@/components/auth/AdminEmergencyLogin";
import CookieBanner from "@/components/gdpr/CookieBanner";
import { MindsetMicroTest } from "@/components/landing/MindsetMicroTest";
import { PremiumPlansAccordion } from "@/components/landing/PremiumPlansAccordion";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingTranslations } from "@/hooks/useLandingTranslations";
import "../styles/landing-flip-cards.css";
import "../styles/landing-premium.css";

gsap.registerPlugin(ScrollTrigger);

// Prize images array for carousel
const prizeImages = [
  "/lovable-uploads/eccb4710-0336-46f8-9137-906f61fbdebd.png", // Main Ferrari/Lambo image
  "/lovable-uploads/211b98b7-646d-4c40-80d6-416ac71a54fc.png", // Lamborghini Huracán
  "/lovable-uploads/2f1f79ad-4221-4a49-a188-81e28222514d.png", // Ferrari SF90 Stradale
  "/lovable-uploads/3b5f5a13-bb71-472b-9348-6e52c12cba7e.png", // Aston Martin DBX
  "/lovable-uploads/7bda6b4a-6ac6-489d-8b2f-b9a4f9c312a2.png", // Porsche 911 Turbo
  "/assets/m1ssion-prize/hero-forest-watch.png", // Rolex Watch
  "/assets/m1ssion-prize/hero-forest-lambo.png", // Lamborghini Forest
];

const LandingPage = () => {
  const [, setLocation] = useLocation();
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [showEmergencyLogin, setShowEmergencyLogin] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Use landing page translations with device language detection
  const { t } = useLandingTranslations();
  
  // Refs for GSAP animations and scroll-to-top
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  console.log('🌟 M1SSION™ LANDING PAGE - Xavier Cusso Style - Showing to anonymous user');

  // Prize carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrizeIndex((prev) => (prev + 1) % prizeImages.length);
    }, 4000); // Change image every 4 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Countdown to NEXT M1SSION - January 1, 2026 at 19:00 (next mission cycle)
  useEffect(() => {
    const targetDate = new Date('2026-01-01T19:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Optimized GSAP Animations setup
  useEffect(() => {
    // Hero entrance animation with better performance
    if (titleRef.current) {
      gsap.fromTo(titleRef.current.children, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out" }
      );
    }
    
    // Optimized sections reveal on scroll
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(section, 
          { y: 30, opacity: 0 },
          {
            y: 0, 
            opacity: 1, 
            duration: 0.6,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse",
              fastScrollEnd: true
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Mobile scroll-to-top functionality
  useEffect(() => {
    const handleStatusBarTap = (e: TouchEvent) => {
      // Detect tap on status bar area (top 44px of screen)
      if (e.touches[0].clientY <= 44 && window.scrollY > 100) {
        e.preventDefault();
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    };

    // Add event listener for mobile devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleStatusBarTap, { passive: false });
    }

    return () => {
      if ('ontouchstart' in window) {
        document.removeEventListener('touchstart', handleStatusBarTap);
      }
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

  // Function to handle card flip - Solo una alla volta
  const handleCardClick = (index: number) => {
    console.log(`🔄 Card ${index} clicked, current flipped:`, flippedCards);
    setFlippedCards(prev => 
      prev.includes(index) 
        ? [] // Se è già aperta, chiudi tutto
        : [index] // Altrimenti apri solo questa
    );
  };

  // Step data for "Scopri M1SSION" section
  const steps = [
    {
      icon: <UserCheck className="w-8 h-8 text-[#00E5FF]" />,
      title: "Registrazione",
      description: "Crea il tuo account su M1SSION e preparati alla sfida",
      details: "Accesso gratuito con il piano Base. Scegli tra 5 piani di abbonamento per accedere a indizi premium, eventi esclusivi e vantaggi unici. La registrazione include verifica dell'identità per garantire sicurezza e conformità normativa."
    },
    {
      icon: <Check className="w-8 h-8 text-[#00E5FF]" />,
      title: "Ricevi Indizi", 
      description: "Ogni settimana ricevi nuovi indizi via app ed email",
      details: "Gli indizi arrivano attraverso notifiche push, email crittografate e aggiornamenti in-app. Ogni piano offre un numero diverso di indizi settimanali: dal piano Base (1 indizio) al Titanium (8 indizi totali)."
    },
    {
      icon: <MapPin className="w-8 h-8 text-[#FFC107]" />,
      title: "Risolvi la Missione",
      description: "Analizza gli indizi e trova la posizione del premio",
      details: "Usa la mappa interattiva, decrittografa i codici, analizza pattern e coordinate GPS. Gli indizi sono interconnessi e richiedono logica, intuito e capacità di analisi per rivelare la posizione finale del tesoro."
    },
    {
      icon: <Award className="w-8 h-8 text-[#FF00FF]" />,
      title: "Vinci davvero",
      description: "Se sei il primo a trovare il premio, diventa tuo!",
      details: "I premi sono reali: auto di lusso, orologi, gioielli e altri oggetti di valore. Solo il primo che raggiunge la posizione esatta e completa la verifica finale ottiene il premio. Nessuna simulazione, solo vittorie concrete."
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
    <div className="min-h-screen bg-black overflow-x-hidden relative ambient-bg">
      {/* Noise Overlay - Subtle Film Grain */}
      <div className="noise-overlay" />
      
      {/* Vignette Effect */}
      <div className="vignette" />
      
      {/* Dynamic Background - Enhanced */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a12] to-black" />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,229,255,0.12),transparent_60%)]"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(168,85,247,0.1),transparent_60%)]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.03),transparent_70%)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating Particles - More Dense */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#8B5CF6" : "#FF00FF",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.15,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 20, -20, 0],
              opacity: [0.05, 0.25, 0.05],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 15
            }}
          />
        ))}
      </div>

      {/* Floating Action Buttons - Premium */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <motion.button 
          onClick={() => setShowPrizeDetails(true)}
          className="p-4 rounded-full bg-cyan-500/10 backdrop-blur-xl border border-cyan-400/20 text-cyan-400 breathing-glow transition-all duration-500"
          whileHover={{ scale: 1.15, boxShadow: '0 0 40px rgba(0,229,255,0.4)' }}
          whileTap={{ scale: 0.9 }}
        >
          <Info className="h-6 w-6" />
        </motion.button>
        
        <motion.button 
          onClick={openInviteFriend}
          className="p-4 rounded-full bg-purple-500/10 backdrop-blur-xl border border-purple-400/20 text-purple-400 breathing-glow-purple transition-all duration-500"
          whileHover={{ scale: 1.15, boxShadow: '0 0 40px rgba(168,85,247,0.4)' }}
          whileTap={{ scale: 0.9 }}
        >
          <UserPlus className="h-6 w-6" />
        </motion.button>
      </div>
      
      {/* HERO SECTION - Premium Cinematic */}
      <section 
        ref={heroRef}
        className="relative w-full flex flex-col items-center justify-start text-center px-4 pt-10 pb-2"
      >
        {/* Main Title - Enhanced Glow */}
        <div className="z-10 max-w-6xl mx-auto">
          <motion.h1 
            ref={titleRef}
            className="text-6xl md:text-7xl lg:text-[8rem] font-black leading-none mb-6"
            animate={{ 
              textShadow: [
                '0 0 40px rgba(0,229,255,0.4)',
                '0 0 80px rgba(0,229,255,0.6)',
                '0 0 40px rgba(0,229,255,0.4)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="overflow-hidden">
              <motion.span 
                className="text-cyan-400 block title-glow"
                style={{ 
                  textShadow: '0 0 60px rgba(0,229,255,0.8), 0 0 120px rgba(0,229,255,0.4)'
                }}
              >
                M1
              </motion.span>
            </div>
            <div className="overflow-hidden -mt-8">
              <span className="text-white block" style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                SSION<span className="text-2xl align-top">™</span>
              </span>
            </div>
          </motion.h1>
          
          <motion.p 
            className="text-2xl md:text-3xl font-bold tracking-[0.2em] mb-2 uppercase"
            style={{ color: '#00FF00', textShadow: '0 0 20px rgba(0,255,0,0.5)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            M1SSION IS LIVE
          </motion.p>
          <motion.p
            className="text-base md:text-lg text-cyan-400/80 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            La caccia è iniziata. Il premio è reale.
          </motion.p>
          
          {/* Countdown Timer - NEXT MISSION */}
          <motion.p
            className="text-xs md:text-sm text-white/50 uppercase tracking-[0.3em] mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            Prossima Missione tra
          </motion.p>
          <motion.div 
            className="flex justify-center gap-2 md:gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.9 }}
          >
            <motion.div 
              className="countdown-box text-center"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0,229,255,0.4)' }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number">
                {String(countdown.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Giorni</div>
            </motion.div>
            <div className="text-2xl md:text-3xl font-bold text-white/20 self-center">:</div>
            <motion.div 
              className="countdown-box text-center"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0,229,255,0.4)' }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number">
                {String(countdown.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Ore</div>
            </motion.div>
            <div className="text-2xl md:text-3xl font-bold text-white/20 self-center">:</div>
            <motion.div 
              className="countdown-box text-center"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0,229,255,0.4)' }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number">
                {String(countdown.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Minuti</div>
            </motion.div>
            <div className="text-2xl md:text-3xl font-bold text-white/20 self-center">:</div>
            <motion.div 
              className="countdown-box text-center"
              style={{ borderColor: 'rgba(168,85,247,0.3)' }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(168,85,247,0.5)' }}
            >
              <motion.div 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-400 countdown-number"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {String(countdown.seconds).padStart(2, '0')}
              </motion.div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Secondi</div>
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-6 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            {t('heroDescription')}
          </motion.p>
          
          <motion.div 
            className="text-yellow-300 text-base md:text-lg tracking-[0.5em] mb-4 relative font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <TypingEffect text="IT IS POSSIBLE" onComplete={() => setIsTypingComplete(true)} />
          </motion.div>
          
          {/* Tension/Competition Element */}
<motion.p 
            className="text-white/50 text-sm md:text-base mb-2 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.8 }}
          >
            La maggior parte si ferma alla settimana 2. Chi cerca scorciatoie non arriva al premio.
          </motion.p>
          <motion.p 
            className="text-yellow-400/80 text-xs md:text-sm mb-6 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 3.0 }}
          >
            Chi entra ora compete con chi ha già iniziato.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3 }}
            style={{ overflow: 'visible' }}
          >
            <motion.button 
              className="cta-premium px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black text-base font-black uppercase tracking-wider relative group"
              onClick={() => {
                // Dispatch tracking event
                window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
                  detail: { action: "landing_cta_primary_click" } 
                }));
                // Scroll to mini-test
                const miniTest = document.getElementById('mission-mini-test');
                if (miniTest) {
                  miniTest.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(34,211,238,0.6), 0 0 100px rgba(34,211,238,0.3)' }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: '0 0 30px rgba(34,211,238,0.3)', overflow: 'visible' }}
              aria-label="Vai al test di mentalità"
            >
              <span className="relative z-10">{t('joinTheHunt')}</span>
            </motion.button>
            
            <motion.button 
              className="px-8 py-4 rounded-full text-white font-bold uppercase tracking-wider bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-cyan-400/40 hover:text-cyan-400 transition-all duration-500"
              onClick={() => setShowLearnMore(true)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,229,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              style={{ overflow: 'visible' }}
            >
              {t('learnMore')}
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator - Minimal */}
        <motion.div 
          className="mt-4"
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-cyan-400/50" />
        </motion.div>
      </section>

      {/* WHY MOST WILL FAIL - Marketing Hook */}
      <motion.section 
        className="relative py-8 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="glass-container p-6 md:p-8 text-center relative overflow-hidden border-l-4 border-red-500/50"
            whileHover={{ borderColor: 'rgba(239,68,68,0.8)' }}
          >
            <motion.h3 
              className="text-xl md:text-2xl font-bold mb-6 text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Perché la maggior parte <span className="text-red-400">non vincerà</span>
            </motion.h3>
            
            <div className="space-y-4 text-left mb-6">
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Cercano scorciatoie invece di analizzare i pattern</span>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Ignorano gli indizi iniziali pensando siano irrilevanti</span>
              </motion.div>
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Sottovalutano la connessione tra le informazioni</span>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-cyan-400 font-semibold text-sm md:text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              M1SSION non premia chi prova.<br/>
              <span className="text-white">Premia chi capisce.</span>
            </motion.p>
            
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-red-500/30 via-transparent to-transparent" />
          </motion.div>
        </div>
      </motion.section>

      {/* PREMI IN PALIO SECTION - Premium */}
      <section 
        ref={(el) => el && (sectionsRef.current[0] = el)}
        className="relative py-8 px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-black mb-3 text-white leading-none"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}
              whileInView={{ 
                textShadow: ['0 0 20px rgba(0,229,255,0.3)', '0 0 40px rgba(0,229,255,0.5)', '0 0 20px rgba(0,229,255,0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t('realPrizes')}
            </motion.h2>
            <motion.p 
              className="text-base text-gray-400 max-w-2xl mx-auto subtitle-elegant mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t('realPrizesDescription')}
            </motion.p>
            <motion.p 
              className="text-sm text-cyan-400/80 max-w-2xl mx-auto font-medium mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Il premio viene consegnato fisicamente al vincitore. Nessun duplicato.
            </motion.p>
            <motion.p 
              className="text-xs text-red-400/80 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Ogni premio esiste una sola volta. Quando viene vinto, sparisce.
            </motion.p>
          </motion.div>

          <motion.div 
            className="image-container-premium relative h-[35vh] md:h-[45vh] lg:h-[50vh] glass-container-glow overflow-hidden"
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 30px 60px rgba(0,229,255,0.2)' }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-60 z-10" />
            
            {/* Prize Images Carousel */}
            {prizeImages.map((image, index) => (
              <motion.img 
                key={index}
                src={image}
                alt={`M1SSION PREMI IN PALIO ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentPrizeIndex === index ? 1 : 0,
                  scale: currentPrizeIndex === index ? 1 : 1.1
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                onLoad={() => {
                  if (index === 0) {
                    console.log('✅ Immagine Premi in Palio caricata con successo');
                    setImageLoaded(true);
                  }
                }}
              />
            ))}
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {prizeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPrizeIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPrizeIndex === index 
                      ? 'bg-cyan-400 w-6' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            
            {/* Animated scanner effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent z-10"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Caption always visible when image is loaded */}
            <div className="absolute bottom-4 right-4 text-white/60 text-xs font-normal bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/10 z-20">
              Image for illustration purposes only
            </div>
            
            {/* Credibility badge */}
            <div className="absolute bottom-4 left-4 text-green-400 text-xs font-semibold bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/30 z-20 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Consegna reale al vincitore
            </div>
          </motion.div>
        </div>
      </section>

      {/* MISSION ACTIVE Status Bar */}
      <motion.section 
        className="relative py-6 px-4"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
            animate={{ 
              boxShadow: [
                '0 0 10px rgba(34,197,94,0.2)',
                '0 0 20px rgba(34,197,94,0.4)',
                '0 0 10px rgba(34,197,94,0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm font-bold uppercase tracking-wider">Missione Attiva</span>
          </motion.div>
          
          <motion.h3 
            className="text-xl md:text-2xl font-bold mb-4 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            La caccia è in corso
          </motion.h3>
          
          <motion.div 
            className="relative w-full h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30 mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Animated pulse bar - no percentage, just activity indicator */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50"
              animate={{ 
                x: ["-100%", "100%"],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          <motion.p 
            className="text-white/60 text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Ogni decisione conta. Chi arriva tardi parte svantaggiato.
          </motion.p>
          
          {/* Micro Test di Mentalità */}
          <div id="mission-mini-test" className="scroll-mt-20">
            <MindsetMicroTest />
          </div>
        </div>
      </motion.section>

      {/* INSTALLATION SECTION - Premium Glass */}
      <section id="install-section" className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-container-glow p-6 md:p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ boxShadow: '0 0 80px rgba(0,229,255,0.15)' }}
            transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Installa <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h2>
            
            <p className="text-base mb-6 text-gray-300 subtitle-elegant">
              Per installare M1SSION™ sul tuo dispositivo mobile:
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <span className="mr-2">📱</span>
                <span><strong className="text-white">iOS (Safari):</strong> premi il tasto "Condividi" e seleziona "Aggiungi alla Home"</span>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <span className="mr-2">🤖</span>
                <span><strong className="text-white">Android (Chrome):</strong> apri il menu ⋮ e premi "Installa App"</span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              >
                Aggiungi M1SSION™ alla tua Home
              </Button>
            </motion.div>
            
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* WELCOME TO M1SSION™ Text Section - Premium */}
      <motion.section 
        className="relative py-6 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="glass-container p-6 md:p-8 text-center relative overflow-hidden"
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            whileHover={{ borderColor: 'rgba(0,229,255,0.3)', boxShadow: '0 0 60px rgba(0,229,255,0.1)' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-orbitron mb-6" style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
              WELCOME TO{" "}
              <span>
                <span className="text-[#00E5FF]" style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>M1</span>
                <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </span>
            </h2>
            
            <p className="text-base mb-4 max-w-3xl mx-auto text-white font-semibold leading-relaxed">
              Non stai entrando in un gioco.<br/>
              Stai entrando in un sistema.
            </p>
            
            <p className="text-base mb-4 max-w-3xl mx-auto text-gray-300 leading-relaxed">
              Thousands will try. Only a few will see the pattern. You're not just chasing a prize—you're chasing the proof that you can outthink them all.
            </p>

            <p className="text-base max-w-3xl mx-auto text-gray-300 leading-relaxed">
              This is <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. The countdown has begun. Are you ready?
            </p>

            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </motion.div>
        </div>
      </motion.section>

      {/* REGISTRATION FORM SECTION - Premium Gradient */}
      <motion.section 
        className="relative py-8 px-4"
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 70 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/15 to-transparent"></div>
        <div className="max-w-lg mx-auto relative z-10">
          <motion.div 
            className="relative glass-container-glow overflow-hidden p-6 text-center breathing-glow-purple"
            whileHover={{ scale: 1.03, boxShadow: '0 0 100px rgba(168,85,247,0.25)' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Registrati per{" "}
              <span>
                <span className="text-[#00E5FF]">M1</span>
                <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </span>
            </h2>
            
            <p className="text-white/60 mb-6 text-sm subtitle-elegant">
              Ottieni accesso esclusivo e un codice referral unico. Preparati per l'avventura che cambierà tutto.
            </p>
            
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden rounded-xl"
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, #ec4899, #8B5CF6, #ec4899)"
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <Button 
                  onClick={handleRegisterClick}
                  className="relative w-full bg-transparent text-white text-lg font-bold py-4 px-12 hover:bg-transparent transition-all duration-500"
                  style={{
                    boxShadow: "0 0 30px rgba(236, 72, 153, 0.4)"
                  }}
                >
                  START M1SSION
                </Button>
              </motion.div>
              
              {/* Trust micro-copy - riduzione frizione */}
              <p className="text-white/40 text-xs text-center">
                Accesso gratuito. La verifica serve solo in caso di vittoria.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* SCOPRI M1SSION SECTION - Premium */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Scopri <span className="text-[#00E5FF]" style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>M1</span><span className="text-white">SSION</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
            {/* Linea connettore per desktop */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#FFC107] to-[#FF00FF] z-0"></div>
            
            {steps.map((step, index) => {
              const isFlipped = flippedCards.includes(index);
              
              return (
                <motion.div
                  key={index}
                  className="relative z-10 perspective-1000"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-white z-30">
                    {index + 1}
                  </span>
                  
                  <div 
                    className={`mission-flip-card h-64 cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Front Side */}
                    <div className="mission-card-front glass-card">
                      <div className="mb-4 p-3 rounded-full bg-black/50 border border-white/10">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                      <p className="text-white/70 mb-4 leading-relaxed">{step.description}</p>
                      <p className="text-cyan-400 text-sm font-medium">Clicca per saperne di più</p>
                    </div>
                    
                    {/* Back Side */}
                    <div className="mission-card-back glass-card bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border border-cyan-400/30">
                      <div className="mb-3 p-2 rounded-full bg-cyan-400/20">
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-cyan-300">{step.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-4">{step.details}</p>
                      <p className="text-cyan-300 text-xs font-medium">Clicca per tornare indietro</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-8 mb-4">
            <button 
              onClick={handleRegisterClick}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium underline underline-offset-4 transition-colors"
            >
              Pronto? Registrati ora →
            </button>
          </div>
        </div>
      </section>

      {/* STAY UPDATED SECTION - Compact */}
      <motion.section 
        className="py-4 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-lg md:text-xl font-bold text-white mb-1"
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Stay Updated
          </motion.h2>
          <p className="text-white/40 text-xs subtitle-elegant">
            Get the latest updates about M1SSION™ and be the first to know about new challenges.
          </p>
        </div>
      </motion.section>

      {/* SUBSCRIPTION SECTION - Premium */}
      <motion.section 
        className="py-8 px-4 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <motion.h2 
              className="text-xl md:text-2xl font-bold inline-block"
              style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}
              whileInView={{ scale: [0.95, 1] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[#00E5FF]" style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>M1</span><span className="text-white">SSION</span> Abbonamenti
            </motion.h2>
            <p className="mt-2 text-white/40 max-w-2xl mx-auto text-xs subtitle-elegant">
              Scegli il piano più adatto a te e inizia la tua avventura. Tutti i piani offrono la possibilità di vincere premi reali.
            </p>
          </motion.div>
          
          {/* Piano Base - Sempre Visibile */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="subscription-card p-4 max-w-sm w-full"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{subscriptions[0].title}</h3>
                <div className="mt-2">
                  <span className="text-xl font-bold text-white">{subscriptions[0].price}</span>
                  {subscriptions[0].period && <span className="text-white/50 text-xs">{subscriptions[0].period}</span>}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {subscriptions[0].features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleRegisterClick}
                className={`w-full text-sm py-2 ${subscriptions[0].buttonColor}`}
                disabled={false}
              >
                {subscriptions[0].buttonText}
              </Button>
            </motion.div>
          </div>

          {/* Piani Premium - Accordion */}
          <PremiumPlansAccordion>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {subscriptions.slice(1).map((sub, index) => (
                <motion.div
                  key={index}
                  className={`subscription-card p-3 ${sub.highlight ? 'subscription-card-highlight bg-gradient-to-b from-[#00E5FF]/10 to-black/80' : ''}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  transition={{ delay: index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
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
          </PremiumPlansAccordion>

          <div className="text-center">
            <p className="text-white/50 text-xs">
              Tutti i piani sono soggetti ai termini e condizioni di servizio.
            </p>
          </div>
        </div>
      </motion.section>

      {/* AGE VERIFICATION SECTION - Premium */}
      <motion.section 
        className="py-8 px-4 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="max-w-lg mx-auto">
          <motion.div
            className="glass-container p-5 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ boxShadow: '0 0 60px rgba(168,85,247,0.15)' }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            viewport={{ once: true }}
          >
            <div className="mb-4">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(168,85,247,0.2)',
                    '0 0 40px rgba(168,85,247,0.4)',
                    '0 0 20px rgba(168,85,247,0.2)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block rounded-full p-3 bg-purple-500/10 mb-3"
              >
                <IdCard className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">
                Verifica la tua identità
              </h2>
              <p className="text-white/50 text-sm subtitle-elegant mb-2">
                Per garantire un'esperienza di gioco sicura e conforme alle normative, è necessario completare la verifica dell'identità prima di ricevere premi.
              </p>
              <p className="text-cyan-400/70 text-xs font-medium">
                ✓ La verifica serve solo per la consegna del premio al vincitore
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-full hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300"
              >
                Vai alla verifica identità
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <LandingFooter />
      
      {/* GDPR Cookie Banner */}
      <CookieBanner />

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
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
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
                Confermi di avere almeno 18 anni? Questo gioco è riservato ai maggiorenni.
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

      {/* SCOPRI DI PIÙ - Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 overflow-y-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          <motion.div
            className="bg-gradient-to-br from-gray-900/98 to-black/98 border border-cyan-500/40 rounded-2xl p-6 md:p-8 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button
              onClick={() => setShowLearnMore(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
            >
              <X className="w-7 h-7" />
            </button>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>
              </h2>
              <p className="text-cyan-400 text-lg font-semibold">La Prima Caccia al Tesoro Globale con Premi Reali</p>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-4" />
            </div>

            {/* 🎯 Cos'è M1SSION™ */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Cos'è M1SSION™
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                M1SSION™ è un gioco investigativo geolocalizzato che trasforma il mondo reale in una mappa viva.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Ogni missione è costruita su indizi progressivi, analisi logica e decisioni strategiche.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                In M1SSION™ <strong className="text-cyan-400">non esistono simulazioni</strong>: chi arriva per primo sul posto giusto, vince davvero.
              </p>
              <p className="text-white font-semibold italic">
                Non è fortuna. Non è simulazione. È intelligenza applicata al territorio reale.
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

            {/* 🧠 Come funziona davvero */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🧠</span>
                Come funziona davvero
              </h3>
              
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-cyan-400 font-bold mb-2">1. Entra come Agente</h4>
                  <p className="text-gray-300 text-sm">Registrati e crea il tuo account agente, accedi alla missione attiva. Ogni giocatore parte dalle stesse condizioni iniziali.</p>
                </div>

                {/* Step 2 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-cyan-400 font-bold mb-2">2. Analizza la Mappa</h4>
                  <p className="text-gray-300 text-sm">La mappa non mostra il premio: mostra aree, segnali e anomalie. Sta a te interpretarli. Cerca i 99 premi presenti in Mappa.</p>
                </div>

                {/* Step 3 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-cyan-400 font-bold mb-2">3. Attiva BUZZ (indizi)</h4>
                  <p className="text-gray-300 text-sm mb-3">Usando BUZZ ottieni indizi crittografati, rebus, triangolazioni e segnali geografici. Ogni BUZZ restringe il campo, ma non rivela mai direttamente la posizione.</p>
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <p className="text-purple-300 text-sm"><strong>🧭 BUZZ MAP</strong> - Oltre agli indizi, puoi usare BUZZ MAP per restringere l'area di ricerca sulla mappa. Più lo usi, più l'area si riduce e diventa precisa — ma non rivela mai direttamente la posizione finale: devi comunque arrivarci con logica e deduzione.</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-cyan-400 font-bold mb-2">4. Ragiona, collega, deduci</h4>
                  <p className="text-gray-300 text-sm">Gli indizi sono dipendenti tra loro e seguono una progressione settimanale:</p>
                  <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4">
                    <li>• da astratti</li>
                    <li>• a contestuali</li>
                    <li>• fino a comprensibili solo per chi ha seguito il percorso corretto</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-bold mb-2">5. Final Shoot (Settimana 4)</h4>
                  <p className="text-gray-300 text-sm mb-2">Il premio principale non si vince prima della Settimana 4. Da Settimana 4, se sei sul posto giusto, puoi tentare il colpo finale premendo il tasto sulla mappa (Final Shoot).</p>
                  <p className="text-red-400 text-sm font-semibold">⚠️ Hai solo 3 tentativi per missione.</p>
                  <p className="text-yellow-300 text-sm mt-2 font-semibold">Chi esegue il Final Shoot corretto per primo vince davvero.</p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

            {/* 🗺️ Premi & Struttura */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🗺️</span>
                Premi & Struttura di Gioco
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-bold mb-2">🏆 1 Premio Principale</h4>
                  <p className="text-gray-300 text-sm">Vincibile solo da Settimana 4 tramite Final Shoot</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/30">
                  <h4 className="text-cyan-400 font-bold mb-2">🎁 99 Premi Secondari</h4>
                  <p className="text-gray-300 text-sm">Già presenti sulla mappa, si vincono trovandoli e sbloccandoli: il premio viene assegnato al primo giocatore che lo trova.</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Premio Principale</strong> (1 premio per Missione, completamente casuale): Auto, orologi, oggetti esclusivi e premi fisici reali fanno parte del sistema.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

            {/* ⚠️ Regole Fondamentali */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Regole Fondamentali
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Devi avere almeno 18 anni</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Gli indizi non possono essere condivisi</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ogni agente gioca individualmente</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Il premio va al primo che scopre la sua posizione tramite Final Shoot</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verifica dell'identità obbligatoria prima del ritiro</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Tentativi di forzatura o manipolazione portano all'esclusione</span>
                </li>
              </ul>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

            {/* 🔐 Una cosa importante */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🔐</span>
                Una cosa importante
              </h3>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/30">
                <p className="text-gray-300 leading-relaxed mb-3">
                  M1SSION™ non premia la velocità, ma la <strong className="text-purple-300">capacità di leggere il sistema</strong>.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Chi tenta scorciatoie, deduzioni premature o copia, viene automaticamente penalizzato.
                </p>
                <p className="text-white font-bold text-lg">
                  M1SSION™ non è un gioco di fortuna.
                </p>
                <p className="text-cyan-400 font-semibold">
                  È strategia, deduzione, movimento reale.
                </p>
                <p className="text-yellow-400 font-bold mt-3">
                  Se sei il primo ad arrivare, vinci davvero.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

            {/* 🚀 CTA */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                <span className="text-2xl mr-3">🚀</span>
                Sei pronto a pensare come un agente?
              </h3>
              <p className="text-gray-400">Unisciti ora e inizia a osservare la mappa come nessuno ha mai fatto prima.</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => {
                  setShowLearnMore(false);
                  handleRegisterClick();
                }}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-8 py-4 rounded-full text-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
              >
                UNISCITI ORA
              </Button>
              <Button 
                onClick={() => setShowLearnMore(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg"
              >
                CHIUDI
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Typing Effect Component
const TypingEffect: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 120); // Smooth typing speed
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span className="inline-block">
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-yellow-300 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </span>
  );
};

export default LandingPage;