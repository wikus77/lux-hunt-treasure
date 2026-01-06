// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Team Page - Chi Siamo - Con Crew Carousel

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Shield, Globe, Sparkles, ChevronLeft, Users } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// Crew members from M1 CREW folder
const crewMembers = [
  { src: '/assets/crew-team/CEO M1SSION.png', role: 'CEO', name: 'Chief Executive Officer', description: 'Fondatore e visionario di M1SSION. Guida la strategia e la crescita globale.' },
  { src: '/assets/crew-team/CFO M1SSION.png', role: 'CFO', name: 'Chief Financial Officer', description: 'Gestisce le finanze e garantisce la sostenibilità dei premi reali.' },
  { src: '/assets/crew-team/CTO M1SSION.png', role: 'CTO', name: 'Chief Technology Officer', description: 'Architetto della piattaforma tecnologica e innovazione.' },
  { src: '/assets/crew-team/CMO M1SSION.png', role: 'CMO', name: 'Chief Marketing Officer', description: 'Responsabile brand, comunicazione e community.' },
  { src: '/assets/crew-team/CHRO M1SSION.png', role: 'CHRO', name: 'Chief Human Resources Officer', description: 'Sviluppa il team e la cultura aziendale M1SSION.' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const TeamPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % crewMembers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % crewMembers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + crewMembers.length) % crewMembers.length);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <LandingHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a12] to-black" />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,229,255,0.08),transparent_60%)]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(168,85,247,0.06),transparent_60%)]"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30"
            variants={itemVariants}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium tracking-wider">IL TEAM M1SSION</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-mission font-black mb-4"
            variants={itemVariants}
          >
            Chi <span className="text-cyan-400">Siamo</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Il team dietro M1SSION™
          </motion.p>
        </motion.div>
      </section>

      {/* Crew Carousel */}
      <section className="relative py-12 px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-cyan-500/30"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Images */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="relative aspect-[3/4] md:aspect-[4/3]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7 }}
              >
                <img
                  src={crewMembers[currentIndex].src}
                  alt={crewMembers[currentIndex].role}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Info Overlay */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-6"
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 mb-3">
                <span className="text-cyan-400 font-bold text-sm">{crewMembers[currentIndex].role}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{crewMembers[currentIndex].name}</h3>
              <p className="text-gray-300">{crewMembers[currentIndex].description}</p>
            </motion.div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {crewMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'bg-cyan-400 w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-12 px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ borderColor: 'rgba(0,229,255,0.4)', boxShadow: '0 0 40px rgba(0,229,255,0.1)' }}
          >
            <motion.h2 
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              La nostra missione
            </motion.h2>
            <motion.p 
              className="text-gray-400 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Creare esperienze che sfidano l'intelletto, premiano la deduzione 
              e trasformano il mondo reale in un campo di gioco dove 
              <span className="text-cyan-400 font-semibold"> chi capisce, vince</span>.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-12 px-4 z-10">
        <motion.div 
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group"
            variants={itemVariants}
            whileHover={{ scale: 1.05, borderColor: 'rgba(0,229,255,0.3)' }}
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0,229,255,0.4)' }}
            >
              <Shield className="w-7 h-7 text-cyan-400" />
            </motion.div>
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">Trasparenza</h3>
            <p className="text-gray-400 text-sm">
              Regole chiare, premi reali, nessuna simulazione. Quello che vedi è quello che ottieni.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group"
            variants={itemVariants}
            whileHover={{ scale: 1.05, borderColor: 'rgba(168,85,247,0.3)' }}
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
            >
              <Globe className="w-7 h-7 text-purple-400" />
            </motion.div>
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">Innovazione</h3>
            <p className="text-gray-400 text-sm">
              Tecnologia all'avanguardia per creare esperienze che non esistevano prima.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group"
            variants={itemVariants}
            whileHover={{ scale: 1.05, borderColor: 'rgba(234,179,8,0.3)' }}
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(234,179,8,0.4)' }}
            >
              <Sparkles className="w-7 h-7 text-yellow-400" />
            </motion.div>
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-yellow-400 transition-colors">Eccellenza</h3>
            <p className="text-gray-400 text-sm">
              Solo il meglio per i nostri agenti. Design, UX, premi: tutto al massimo livello.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Company Info */}
      <section className="relative py-12 px-4 z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-black/40 border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Informazioni Legali</h2>
            <div className="space-y-3 text-gray-400 text-sm">
              <p><strong className="text-white">Ragione Sociale:</strong> NIYVORA KFT™</p>
              <p><strong className="text-white">Sede:</strong> Budapest, Ungheria</p>
              <p><strong className="text-white">Brand:</strong> M1SSION™</p>
              <p className="text-white/50 text-xs mt-4">
                © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-4 z-10">
        <motion.div 
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/50 mb-4">Unisciti alla missione.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setLocation('/register')}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-lg font-black hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all"
            >
              ENTRA NELLA MISSIONE
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TeamPage;
