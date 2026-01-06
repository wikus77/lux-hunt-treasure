// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, Info, IdCard, Check, MapPin, X, Sparkles, ArrowDown, Play, ChevronRight, ChevronDown } from "lucide-react";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import AdminEmergencyLogin from "@/components/auth/AdminEmergencyLogin";
import CookieBanner from "@/components/gdpr/CookieBanner";
import { MindsetMicroTest } from "@/components/landing/MindsetMicroTest";
import LandingMapTiler from "@/components/landing/LandingMapTiler";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingTranslations } from "@/hooks/useLandingTranslations";
import "../styles/landing-flip-cards.css";
import "../styles/landing-premium.css";
import "../styles/landing-effects.css";

gsap.registerPlugin(ScrollTrigger);

// Prize images array for carousel - One from each category
const prizeImages = [
  "/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png", // Auto
  "/assets/prizes/orologi-reali/ROLEX DAY-DATE.png", // Orologi
  "/assets/prizes/gioielli-reali/DIAMANTI.png", // Gioielli
  "/assets/prizes/borse-reali/HERMES_BIRKIN.png", // Borse
  "/assets/prizes/99premi/IPHONE.png", // 99 Premi
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
  const [welcomeExpanded, setWelcomeExpanded] = useState(false);
  
  // Mouse position for parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  
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

  // Mouse tracking for parallax effect (desktop only)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only track if not on touch device
      if (window.matchMedia('(hover: hover)').matches) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        // Normalize to -1 to 1 range
        const x = (clientX / innerWidth - 0.5) * 2;
        const y = (clientY / innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  // Subscription plans data (used in showLearnMore modal)
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
      {/* Navigation Header */}
      <LandingHeader />
      
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
      
      {/* HERO SECTION - Premium Cinematic with Parallax */}
      <section 
        ref={heroRef}
        className="relative w-full flex flex-col items-center justify-start text-center px-4 pb-2 overflow-hidden"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Ambient Background with Parallax */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Noise texture */}
          <div className="noise-overlay" />
          
          {/* Gradient orbs with parallax */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full hero-ambient-pulse"
            style={{ 
              background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)',
              x: mousePosition.x * -20,
              y: mousePosition.y * -20,
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full hero-ambient-pulse"
            style={{ 
              background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
              x: mousePosition.x * -15,
              y: mousePosition.y * -15,
              animationDelay: '4s'
            }}
          />
          
          {/* Subtle grid lines */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Main Title - AAA Animated Glow with Parallax */}
        <motion.div 
          className="z-10 max-w-6xl mx-auto hero-hover-glow"
          style={{
            x: mousePosition.x * 8,
            y: mousePosition.y * 8,
          }}
          animate={{
            scale: isHeroHovered ? 1.02 : 1,
          }}
          transition={{ 
            scale: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
            x: { duration: 0.1 },
            y: { duration: 0.1 },
          }}
        >
          <motion.h1 
            ref={titleRef}
            className="text-6xl md:text-7xl lg:text-[8rem] font-bold leading-none mb-6 relative"
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Glow Layer Behind Text - Enhanced */}
            <motion.span
              className="absolute inset-0 text-[#00E5FF] blur-2xl"
              animate={{ 
                opacity: isHeroHovered ? [0.4, 0.7, 0.4] : [0.2, 0.4, 0.2],
                scale: [1, 1.03, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              M1SSION™
            </motion.span>
            {/* Secondary glow layer */}
            <motion.span
              className="absolute inset-0 text-purple-500 blur-3xl opacity-20"
              animate={{ 
                opacity: [0.1, 0.25, 0.1],
                scale: [1.02, 1.05, 1.02]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              aria-hidden="true"
            >
              M1SSION™
            </motion.span>
            {/* Main Text */}
            <span className="relative">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
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
          
          {/* Countdown Timer - AAA Micro-tick */}
          <motion.p
            className="text-xs md:text-sm text-white/50 uppercase tracking-[0.3em] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
          >
            Prossima Missione tra
          </motion.p>
          <motion.div 
            className="flex justify-center gap-2 md:gap-4 mb-6"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Days */}
            <motion.div 
              className="countdown-box text-center relative overflow-hidden"
              whileHover={{ scale: 1.08, borderColor: 'rgba(0,229,255,0.5)' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0"
                whileHover={{ opacity: 1 }}
              />
              <motion.div 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number relative"
                key={countdown.days}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {String(countdown.days).padStart(2, '0')}
              </motion.div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Giorni</div>
            </motion.div>
            <motion.div 
              className="text-2xl md:text-3xl font-bold text-white/20 self-center"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >:</motion.div>
            
            {/* Hours */}
            <motion.div 
              className="countdown-box text-center relative overflow-hidden"
              whileHover={{ scale: 1.08, borderColor: 'rgba(0,229,255,0.5)' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number"
                key={countdown.hours}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {String(countdown.hours).padStart(2, '0')}
              </motion.div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Ore</div>
            </motion.div>
            <motion.div 
              className="text-2xl md:text-3xl font-bold text-white/20 self-center"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >:</motion.div>
            
            {/* Minutes */}
            <motion.div 
              className="countdown-box text-center relative overflow-hidden"
              whileHover={{ scale: 1.08, borderColor: 'rgba(0,229,255,0.5)' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 countdown-number"
                key={countdown.minutes}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {String(countdown.minutes).padStart(2, '0')}
              </motion.div>
              <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Minuti</div>
            </motion.div>
            <motion.div 
              className="text-2xl md:text-3xl font-bold text-white/20 self-center"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >:</motion.div>
            
            {/* Seconds - Micro-tick Animation */}
            <motion.div 
              className="countdown-box text-center relative overflow-hidden"
              style={{ borderColor: 'rgba(168,85,247,0.3)' }}
              whileHover={{ scale: 1.08, borderColor: 'rgba(168,85,247,0.6)' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Tick Flash */}
              <motion.div 
                className="absolute inset-0 bg-purple-500/20"
                key={countdown.seconds}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-400 countdown-number relative"
                key={`sec-${countdown.seconds}`}
                initial={{ scale: 1.1, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
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
            initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Primary CTA - Magnetic + Pulse */}
            <motion.button 
              className="relative px-10 py-5 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black text-base font-black uppercase tracking-wider overflow-hidden"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
                  detail: { action: "landing_cta_primary_click" } 
                }));
                const miniTest = document.getElementById('mission-mini-test');
                if (miniTest) {
                  miniTest.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 60px rgba(34,211,238,0.6), 0 0 100px rgba(34,211,238,0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ boxShadow: '0 0 30px rgba(34,211,238,0.4)' }}
              aria-label="Vai al test di mentalità"
            >
              {/* Pulse Ring */}
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              {/* Shimmer Effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
              <span className="relative z-10">{t('joinTheHunt')}</span>
            </motion.button>
            
            {/* Secondary CTA - Glass Effect */}
            <motion.button 
              className="px-10 py-5 rounded-full text-white font-bold uppercase tracking-wider bg-white/5 backdrop-blur-md border border-white/15 relative overflow-hidden"
              onClick={() => setShowLearnMore(true)}
              whileHover={{ 
                scale: 1.05, 
                borderColor: 'rgba(0,229,255,0.5)',
                backgroundColor: 'rgba(0,229,255,0.1)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">{t('learnMore')}</span>
            </motion.button>
          </motion.div>
          
          {/* Spectator Mode CTA */}
          <motion.button
            className="mt-3 text-white/50 text-xs hover:text-cyan-400 transition-colors flex items-center gap-1 mx-auto"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
                detail: { action: "landing_spectator_click" } 
              }));
              setLocation('/spectator');
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            <span>👁️</span>
            <span>GUARDA COME SPETTATORE</span>
          </motion.button>
        </motion.div>

        {/* Scroll Indicator - Minimal */}
        <motion.div 
          className="mt-4"
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-cyan-400/50" />
        </motion.div>
      </section>

      {/* REAL MAPTILER MAP - With Prize Markers */}
      <LandingMapTiler />

      {/* PREMI IN PALIO SECTION - AAA Premium */}
      <section 
        ref={(el) => el && (sectionsRef.current[0] = el)}
        className="relative py-16 px-4"
      >
        {/* Gradient Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/15 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-4 text-white leading-none relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Glow behind text */}
              <motion.span
                className="absolute inset-0 text-yellow-400 blur-2xl opacity-30"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                aria-hidden="true"
              >
                {t('realPrizes')}
              </motion.span>
              <span className="relative">{t('realPrizes')}</span>
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
            className="image-container-premium relative h-[40vh] md:h-[50vh] lg:h-[55vh] glass-container-glow overflow-hidden rounded-3xl"
            initial={{ opacity: 0, y: 80, scale: 0.95, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 40px 80px rgba(0,229,255,0.25), 0 0 100px rgba(168,85,247,0.15)'
            }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      {/* WHY MOST WILL FAIL - AAA Cinematic */}
      <motion.section 
        className="relative py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="glass-container p-8 md:p-10 text-center relative overflow-hidden border-l-4 border-red-500/50 rounded-2xl"
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            whileHover={{ 
              borderColor: 'rgba(239,68,68,0.8)',
              boxShadow: '0 20px 60px rgba(239,68,68,0.15)'
            }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Subtle animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-transparent"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <motion.h3 
              className="text-xl md:text-2xl font-bold mb-8 text-white relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Perché la maggior parte <span className="text-red-400">non vincerà</span>
            </motion.h3>
            
            <div className="space-y-5 text-left mb-8 relative">
              {[
                "Cercano scorciatoie invece di analizzare i pattern",
                "Ignorano gli indizi iniziali pensando siano irrilevanti",
                "Sottovalutano la connessione tra le informazioni"
              ].map((text, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-3 group"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <span className="text-white/80 group-hover:text-white transition-colors duration-300">{text}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.p 
              className="text-cyan-400 font-semibold text-sm md:text-base relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              M1SSION non premia chi prova.<br/>
              <span className="text-white font-bold">Premia chi capisce.</span>
            </motion.p>
            
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-red-500/50 via-transparent to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              style={{ transformOrigin: 'left' }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* MISSION ACTIVE Status Bar - AAA Live System */}
      <motion.section 
        className="relative py-12 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Status Badge */}
          <motion.div
            className="inline-flex items-center gap-3 mb-6 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ 
              boxShadow: [
                '0 0 15px rgba(34,197,94,0.2)',
                '0 0 30px rgba(34,197,94,0.4)',
                '0 0 15px rgba(34,197,94,0.2)'
              ]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              default: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          >
            {/* Pulsing Dot */}
            <motion.div 
              className="relative w-3 h-3"
            >
              <motion.div 
                className="absolute inset-0 rounded-full bg-green-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-full bg-green-400" />
            </motion.div>
            <span className="text-green-400 text-sm font-bold uppercase tracking-wider">Missione Attiva</span>
          </motion.div>
          
          <motion.h3 
            className="text-2xl md:text-3xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            La caccia è in corso
          </motion.h3>
          
          {/* Activity Bar - Living System */}
          <motion.div 
            className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30 mb-4"
            initial={{ scale: 0.9, opacity: 0, width: '50%', marginLeft: 'auto', marginRight: 'auto' }}
            whileInView={{ scale: 1, opacity: 1, width: '100%' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Animated Pulse Wave */}
            <motion.div
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
              animate={{ x: ['-128px', 'calc(100% + 128px)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Secondary Wave */}
            <motion.div
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
              animate={{ x: ['-96px', 'calc(100% + 96px)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            />
          </motion.div>
          
          <motion.p 
            className="text-white/60 text-sm mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
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

      {/* WELCOME TO M1SSION™ Text Section - AAA Accordion */}
      <motion.section 
        className="relative py-12 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="glass-container p-8 md:p-10 text-center relative overflow-hidden cursor-pointer rounded-2xl"
            onClick={() => setWelcomeExpanded(!welcomeExpanded)}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            whileHover={{ 
              borderColor: 'rgba(0,229,255,0.4)', 
              boxShadow: '0 0 80px rgba(0,229,255,0.15), 0 20px 60px rgba(0,0,0,0.4)'
            }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="flex items-center justify-center gap-4 relative">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                WELCOME TO{" "}
                <span>
                  <span className="text-[#00E5FF]">M1</span>
                  <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
                </span>
              </motion.h2>
              <motion.div
                animate={{ rotate: welcomeExpanded ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ChevronDown className="w-7 h-7 text-cyan-400" />
              </motion.div>
            </div>
            
            <motion.div
              initial={false}
              animate={{ 
                height: welcomeExpanded ? 'auto' : 0,
                opacity: welcomeExpanded ? 1 : 0,
                marginTop: welcomeExpanded ? 24 : 0
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
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
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </motion.div>
        </div>
      </motion.section>

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