// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// About Page - Cos'è M1SSION - CINEMATIC STYLE (slow fade + vertical drift)

import React from 'react';
import { useLocation } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Puzzle, Trophy, ChevronRight, MapPin, Zap, Target, Info, Sparkles } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// Cinematic animation variants - slower, more dramatic
const cinematicFade = {
  hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const driftUp = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.3 }
  }
};

const AboutPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <LandingHeader />
      
      {/* Cinematic Background - Layered depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#0a0a15] to-[#030308]" />
        
        {/* Deep layer - slow movement */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        </motion.div>
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      {/* HERO - Extra tall, cinematic entrance */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-20 pb-32 px-4 z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Floating badge */}
            <motion.div 
              className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm"
              variants={cinematicFade}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium tracking-[0.2em]">SCOPRI IL SISTEMA</span>
            </motion.div>
            
            {/* Main title - massive */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9]"
              variants={driftUp}
            >
              <span className="block text-white/90">Cos'è</span>
              <span className="block mt-2">
                <span className="text-[#00E5FF]">M1</span>
                <span className="text-white">SSION</span>
              </span>
            </motion.h1>
            
            {/* Subtitle - elegant */}
            <motion.p 
              className="text-xl md:text-2xl text-white/50 max-w-xl mx-auto font-light tracking-wide"
              variants={cinematicFade}
            >
              La prima caccia al tesoro globale con premi reali
            </motion.p>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2"
            animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(0,229,255,0.4)', 'rgba(255,255,255,0.2)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 bg-cyan-400 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 1 - Full width statement */}
      <section className="relative py-32 px-4 z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cinematicFade}
        >
          <div className="relative">
            {/* Large quote */}
            <motion.p 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Non è un gioco.
              <br />
              <span className="text-cyan-400">È un sistema.</span>
            </motion.p>
            
            {/* Accent line */}
            <motion.div 
              className="absolute -left-8 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-transparent"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ transformOrigin: 'top' }}
            />
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 - Framed content block */}
      <section className="relative py-16 px-4 z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
        >
          <div className="relative p-10 md:p-16 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30 rounded-br-3xl" />
            
            <motion.p 
              className="text-lg md:text-xl text-white/70 leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              M1SSION™ è un'esperienza investigativa geolocalizzata che trasforma il mondo reale in una mappa viva. 
              Ogni missione è costruita su indizi progressivi, analisi logica e decisioni strategiche.
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-white/70 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              In M1SSION™ <span className="text-cyan-400 font-semibold">non esistono simulazioni</span>: 
              chi arriva per primo sul posto giusto, vince davvero.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 - Three pillars - Tight spacing */}
      <section className="relative py-24 px-4 z-10">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Search, title: 'Caccia Investigativa', desc: "Non è un quiz. È un'indagine geolocalizzata con indizi progressivi da decifrare.", color: 'cyan' },
              { icon: Puzzle, title: 'Indizi Progressivi', desc: 'Ogni settimana nuovi indizi. Chi li collega trova il pattern.', color: 'purple' },
              { icon: Trophy, title: 'Premio Reale', desc: 'Il premio viene consegnato al vincitore. Non è una simulazione.', color: 'yellow' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className={`group relative p-8 rounded-2xl bg-gradient-to-br from-${item.color}-500/5 to-transparent border border-${item.color}-500/10 overflow-hidden`}
                variants={driftUp}
                whileHover={{ y: -8, borderColor: `var(--${item.color}-500)` }}
                transition={{ duration: 0.4 }}
              >
                {/* Glow on hover */}
                <motion.div 
                  className={`absolute inset-0 bg-${item.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <item.icon className={`w-8 h-8 ${item.color === 'cyan' ? 'text-cyan-400' : item.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
                </motion.div>
                
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 4 - Features grid - Large spacing */}
      <section className="relative py-40 px-4 z-10">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-16 text-center"
            variants={cinematicFade}
          >
            Cosa rende M1SSION <span className="text-cyan-400">unico</span>
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
          >
            {[
              { icon: MapPin, title: 'Geolocalizzazione reale', desc: 'La mappa non mostra il premio: mostra aree, segnali e anomalie. Sta a te interpretarli.', color: 'cyan' },
              { icon: Zap, title: 'Sistema BUZZ', desc: 'Ottieni indizi crittografati che restringono il campo di ricerca progressivamente.', color: 'purple' },
              { icon: Target, title: 'Final Shoot', desc: 'Dalla Settimana 4, se sei nel posto giusto, puoi eseguire il colpo finale. Solo 3 tentativi.', color: 'green' },
              { icon: Trophy, title: 'Premi unici', desc: 'Ogni premio esiste una sola volta. Quando viene vinto, sparisce per sempre.', color: 'yellow' },
            ].map((feature) => (
              <motion.div 
                key={feature.title}
                className="group flex items-start gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-500"
                variants={driftUp}
                whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-6 h-6 ${feature.color === 'cyan' ? 'text-cyan-400' : feature.color === 'purple' ? 'text-purple-400' : feature.color === 'green' ? 'text-green-400' : 'text-yellow-400'}`} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-cyan-400 transition-colors">{feature.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA - Floating card */}
      <section className="relative py-32 px-4 z-10">
        <motion.div 
          className="max-w-lg mx-auto text-center"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
            <motion.p 
              className="text-white/40 text-lg mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Pronto a entrare nel sistema?
            </motion.p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setLocation('/register')}
                className="px-12 py-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-lg font-black hover:shadow-[0_0_60px_rgba(0,229,255,0.5)] transition-all"
              >
                ENTRA NELLA MISSIONE
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default AboutPage;
