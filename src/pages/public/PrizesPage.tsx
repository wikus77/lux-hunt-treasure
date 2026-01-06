// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Prizes Page - VISUAL ANCHORS, IMAGERY FOCUSED

import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check, Trophy, Car, Watch, Gem, ShoppingBag, Package, ArrowRight } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// Prize categories
const categories = [
  { id: 'auto', title: 'Auto', icon: Car, color: '#00E5FF', count: 8 },
  { id: 'orologi', title: 'Orologi', icon: Watch, color: '#F59E0B', count: 10 },
  { id: 'gioielli', title: 'Gioielli', icon: Gem, color: '#A855F7', count: 9 },
  { id: 'borse', title: 'Borse', icon: ShoppingBag, color: '#EC4899', count: 6 },
  { id: 'tech', title: '99 Premi', icon: Package, color: '#22C55E', count: 14 },
];

// Featured prizes for hero
const heroImages = [
  { src: '/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png', name: 'Ferrari Purosangue' },
  { src: '/assets/prizes/orologi-reali/PATEK PHILIPPE.png', name: 'Patek Philippe' },
  { src: '/assets/prizes/gioielli-reali/DIAMANTI.png', name: 'Diamanti' },
  { src: '/assets/prizes/borse-reali/HERMES_BIRKIN.png', name: 'Hermès Birkin' },
];

// All prize data
const allPrizes: Record<string, Array<{ src: string; name: string }>> = {
  auto: [
    { src: '/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png', name: 'Ferrari Purosangue' },
    { src: '/assets/prizes/auto-reali/LAMBORGHINI.png', name: 'Lamborghini' },
    { src: '/assets/prizes/auto-reali/PORSCHE 911_CABRIO.png', name: 'Porsche 911 Cabrio' },
    { src: '/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png', name: 'Porsche Cayenne' },
    { src: '/assets/prizes/auto-reali/PORSCHE_PANAMERA.png', name: 'Porsche Panamera' },
    { src: '/assets/prizes/auto-reali/MERCEDES_AMG.png', name: 'Mercedes AMG' },
    { src: '/assets/prizes/auto-reali/BMW_M3.png', name: 'BMW M3' },
    { src: '/assets/prizes/auto-reali/ASTON_MARTIN.png', name: 'Aston Martin' },
  ],
  orologi: [
    { src: '/assets/prizes/orologi-reali/ROLEX DAY-DATE.png', name: 'Rolex Day-Date' },
    { src: '/assets/prizes/orologi-reali/PATEK PHILIPPE.png', name: 'Patek Philippe' },
    { src: '/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png', name: 'Rolex Submariner' },
    { src: '/assets/prizes/orologi-reali/CARTIER.png', name: 'Cartier' },
    { src: '/assets/prizes/orologi-reali/OMEGA.png', name: 'Omega' },
    { src: '/assets/prizes/orologi-reali/IWC PORTUGUESE.png', name: 'IWC Portuguese' },
    { src: '/assets/prizes/orologi-reali/PANERAI.png', name: 'Panerai' },
    { src: '/assets/prizes/orologi-reali/TUDOR.png', name: 'Tudor' },
  ],
  gioielli: [
    { src: '/assets/prizes/gioielli-reali/DIAMANTI.png', name: 'Diamanti' },
    { src: '/assets/prizes/gioielli-reali/LINGOTTO-ORO.png', name: 'Lingotto Oro' },
    { src: '/assets/prizes/gioielli-reali/solitario.png', name: 'Solitario' },
    { src: '/assets/prizes/gioielli-reali/BRACCIOALE TENNIS.png', name: 'Bracciale Tennis' },
    { src: '/assets/prizes/gioielli-reali/collana_pietra.png', name: 'Collana Preziosa' },
  ],
  borse: [
    { src: '/assets/prizes/borse-reali/HERMES_BIRKIN.png', name: 'Hermès Birkin' },
    { src: '/assets/prizes/borse-reali/HERMES_BIRKIN_COCCODRILLO.png', name: 'Birkin Coccodrillo' },
    { src: '/assets/prizes/borse-reali/CHANEL.png', name: 'Chanel' },
    { src: '/assets/prizes/borse-reali/LOUIS VUITTON_CLASSIC.png', name: 'Louis Vuitton' },
    { src: '/assets/prizes/borse-reali/YLS.png', name: 'YSL' },
  ],
  tech: [
    { src: '/assets/prizes/99premi/IPHONE.png', name: 'iPhone Pro Max' },
    { src: '/assets/prizes/99premi/MACBOOK.png', name: 'MacBook Pro' },
    { src: '/assets/prizes/99premi/IPAD_PRO.png', name: 'iPad Pro' },
    { src: '/assets/prizes/99premi/APPLE WATCH_ULTRA.png', name: 'Apple Watch Ultra' },
    { src: '/assets/prizes/99premi/AIRPODS_PRO.png', name: 'AirPods Pro' },
    { src: '/assets/prizes/99premi/RAYBAN_META.png', name: 'Ray-Ban Meta' },
  ],
};

const PrizesPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('auto');
  const [heroIndex, setHeroIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

  // Auto-rotate hero
  React.useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#030308] text-white overflow-x-hidden" ref={containerRef}>
      <LandingHeader />
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#030308]" />
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${activeCategoryData?.color || '#00E5FF'}08 0%, transparent 60%)`
          }}
        />
      </div>
      
      {/* HERO - Full viewport, image focused */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-10 pt-16">
        <motion.div 
          className="max-w-6xl mx-auto w-full"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.span 
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="w-3 h-3 inline mr-2" />
                Premi Reali
              </motion.span>
              
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="text-white/90">Vinci</span>
                <br />
                <span className="text-yellow-400">Davvero</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/50 max-w-md mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Non simulazioni. Consegna fisica al vincitore.
              </motion.p>
              
              {/* Category quick links */}
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                    style={{
                      backgroundColor: activeCategory === cat.id ? `${cat.color}20` : 'rgba(255,255,255,0.05)',
                      color: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.5)',
                      borderWidth: 1,
                      borderColor: activeCategory === cat.id ? `${cat.color}40` : 'transparent'
                    }}
                  >
                    {cat.title}
                  </button>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Right - Hero Image Showcase */}
            <motion.div 
              className="relative h-[50vh] md:h-[60vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Glow behind image */}
                  <motion.div 
                    className="absolute inset-0 rounded-3xl"
                    style={{ 
                      background: `radial-gradient(circle, ${categories[heroIndex % categories.length].color}20 0%, transparent 70%)` 
                    }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <img
                    src={heroImages[heroIndex].src}
                    alt={heroImages[heroIndex].name}
                    className="relative max-h-full max-w-full object-contain drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))' }}
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Image name */}
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
                key={heroImages[heroIndex].name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-white/40 text-sm">{heroImages[heroIndex].name}</span>
              </motion.div>
              
              {/* Dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === heroIndex ? 'bg-white w-6' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/30 text-sm"
          >
            Scorri per esplorare
          </motion.div>
        </motion.div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="relative py-24 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Category Tabs - Sticky */}
          <motion.div 
            className="sticky top-16 z-20 py-4 bg-[#030308]/90 backdrop-blur-md -mx-4 px-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="relative px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? `${cat.color}15` : 'transparent',
                      color: isActive ? cat.color : 'rgba(255,255,255,0.5)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border"
                        style={{ borderColor: `${cat.color}40` }}
                        layoutId="activeCategoryBorder"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5" />
                    <span>{cat.title}</span>
                    <span className="text-xs opacity-50">({cat.count})</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Prize Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {allPrizes[activeCategory]?.map((prize, index) => (
                <motion.div
                  key={prize.name}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Background */}
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${activeCategoryData?.color}10 0%, transparent 50%)` 
                    }}
                  />
                  
                  {/* Border */}
                  <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all duration-300" />
                  
                  {/* Image */}
                  <div className="absolute inset-4 flex items-center justify-center">
                    <img
                      src={prize.src}
                      alt={prize.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                  
                  {/* Hover overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                  >
                    <div>
                      <p className="text-white font-semibold">{prize.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">Consegna reale</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* VALUE PROPOSITION - Full width statement */}
      <section className="relative py-32 px-4 z-10">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-white/90">Ogni premio esiste</span>
            <br />
            <span className="text-yellow-400">una sola volta</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/50 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Quando viene vinto, sparisce. Nessun duplicato. Nessuna simulazione.
            Il premio viene consegnato fisicamente al vincitore.
          </motion.p>
          
          {/* Trust badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: Check, text: 'Premi verificati', color: '#22C55E' },
              { icon: Trophy, text: 'Consegna garantita', color: '#F59E0B' },
              { icon: Gem, text: 'Pezzi unici', color: '#A855F7' },
            ].map((badge) => (
              <div 
                key={badge.text}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ 
                  backgroundColor: `${badge.color}10`,
                  border: `1px solid ${badge.color}30`
                }}
              >
                <badge.icon className="w-4 h-4" style={{ color: badge.color }} />
                <span style={{ color: badge.color }} className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10">
        <motion.div 
          className="max-w-lg mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
            <motion.p 
              className="text-white/40 text-lg mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Pronto a vincere?
            </motion.p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setLocation('/register')}
                className="px-12 py-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-lg font-black hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all"
              >
                INIZIA LA CACCIA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PrizesPage;
