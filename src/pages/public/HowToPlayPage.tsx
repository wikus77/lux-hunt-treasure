// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// How To Play Page - STEP-BASED PROGRESSIVE REVEAL

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, UserCheck, MapPin, Zap, Target, Check, Gamepad2, ArrowRight, Lock } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const steps = [
  {
    number: 1,
    title: 'Entra come Agente',
    description: 'Registrati e crea il tuo account agente. Accedi alla missione attiva. Ogni giocatore parte dalle stesse condizioni iniziali.',
    icon: UserCheck,
    color: '#00E5FF',
    week: 'Settimana 1'
  },
  {
    number: 2,
    title: 'Analizza la Mappa',
    description: 'La mappa non mostra il premio: mostra aree, segnali e anomalie. Sta a te interpretarli. Cerca i 99 premi presenti in Mappa.',
    icon: MapPin,
    color: '#22C55E',
    week: 'Settimana 2'
  },
  {
    number: 3,
    title: 'Attiva BUZZ',
    description: 'Usando BUZZ ottieni indizi crittografati, rebus, triangolazioni e segnali geografici. Ogni BUZZ restringe il campo.',
    icon: Zap,
    color: '#A855F7',
    week: 'Settimana 3'
  },
  {
    number: 4,
    title: 'Final Shoot',
    description: 'Dalla Settimana 4, se sei nel posto giusto, puoi eseguire il colpo finale. Solo 3 tentativi. Chi arriva primo, vince.',
    icon: Target,
    color: '#F59E0B',
    week: 'Settimana 4'
  }
];

const HowToPlayPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#030308] text-white overflow-x-hidden">
      <LandingHeader />
      
      {/* Minimal Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#030308]" />
        {/* Single accent glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${steps[activeStep].color}08 0%, transparent 70%)` 
          }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Hero - Compact */}
      <section className="relative pt-24 pb-12 px-4 z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="text-white/70 text-sm font-medium tracking-wider">4 PASSAGGI • 4 SETTIMANE</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Come si <span className="text-cyan-400">Gioca</span>
          </motion.h1>
        </motion.div>
      </section>

      {/* Step Timeline - Progressive Reveal */}
      <section className="relative py-8 px-4 z-10">
        <div className="max-w-5xl mx-auto">
          
          {/* Progress Bar */}
          <motion.div 
            className="relative h-1 bg-white/10 rounded-full mb-16 max-w-3xl mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-yellow-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Step indicators on progress bar */}
            {steps.map((step, index) => (
              <motion.button
                key={index}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 cursor-pointer"
                style={{ 
                  left: `${(index / (steps.length - 1)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: index <= activeStep ? step.color : '#1a1a2e',
                  borderColor: step.color,
                }}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              />
            ))}
          </motion.div>

          {/* Active Step Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]">
            
            {/* Left - Step Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.span 
                  className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-4"
                  style={{ 
                    backgroundColor: `${steps[activeStep].color}15`,
                    color: steps[activeStep].color,
                    border: `1px solid ${steps[activeStep].color}30`
                  }}
                >
                  {steps[activeStep].week}
                </motion.span>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-white/30 mr-4">0{steps[activeStep].number}</span>
                  <span style={{ color: steps[activeStep].color }}>{steps[activeStep].title}</span>
                </h2>
                
                <p className="text-xl text-white/60 leading-relaxed mb-8">
                  {steps[activeStep].description}
                </p>
                
                {/* Step Navigation */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="border-white/20 text-white/60 hover:bg-white/10 disabled:opacity-30"
                  >
                    Precedente
                  </Button>
                  <Button
                    onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                    disabled={activeStep === steps.length - 1}
                    className="bg-white/10 hover:bg-white/20 text-white"
                    style={{ 
                      borderColor: steps[activeStep].color,
                      boxShadow: `0 0 20px ${steps[activeStep].color}30`
                    }}
                  >
                    Successivo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Right - Icon Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Background glow */}
                <motion.div 
                  className="absolute w-64 h-64 rounded-full blur-3xl"
                  style={{ backgroundColor: `${steps[activeStep].color}20` }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Icon container */}
                <motion.div
                  className="relative w-48 h-48 rounded-3xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${steps[activeStep].color}10`,
                    border: `2px solid ${steps[activeStep].color}30`,
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 0 40px ${steps[activeStep].color}20`,
                      `0 0 80px ${steps[activeStep].color}30`,
                      `0 0 40px ${steps[activeStep].color}20`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {React.createElement(steps[activeStep].icon, {
                    className: "w-24 h-24",
                    style: { color: steps[activeStep].color }
                  })}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* All Steps - Collapsed Grid */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h3 
            className="text-center text-white/40 text-sm uppercase tracking-wider mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Panoramica completa
          </motion.h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isExpanded = expandedStep === index;
              
              return (
                <motion.div
                  key={step.number}
                  className="relative cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                >
                  <motion.div
                    className="p-5 rounded-2xl border transition-all duration-300"
                    style={{ 
                      backgroundColor: isExpanded ? `${step.color}10` : 'rgba(255,255,255,0.02)',
                      borderColor: isExpanded ? `${step.color}40` : 'rgba(255,255,255,0.05)'
                    }}
                    whileHover={{ 
                      borderColor: `${step.color}40`,
                      y: -5
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <span className="text-2xl font-bold text-white/20">0{step.number}</span>
                    </div>
                    
                    <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                    <p className="text-xs text-white/40">{step.week}</p>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-white/60 mt-3 pt-3 border-t border-white/10"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Shoot Highlight */}
      <section className="relative py-16 px-4 z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative p-10 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(239,68,68,0.1) 100%)' }}>
            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-yellow-500/30" />
            
            {/* Animated corner */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32"
              style={{
                background: 'radial-gradient(circle at top right, rgba(245,158,11,0.3), transparent 70%)'
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Target className="w-7 h-7 text-yellow-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Final Shoot</h2>
                  <p className="text-white/50 text-sm">Il momento decisivo</p>
                </div>
              </div>
              
              <p className="text-white/70 text-lg mb-6">
                Il premio principale non si vince prima della Settimana 4. Da quel momento, 
                se sei sul posto giusto, puoi tentare il <span className="text-yellow-400 font-semibold">colpo finale</span>.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Solo 3 tentativi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Chi arriva primo, vince</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Rules - Minimal */}
      <section className="relative py-16 px-4 z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white/40 text-sm uppercase tracking-wider mb-6">Regole fondamentali</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                '18+ richiesto',
                'Gioco individuale',
                'Indizi non condivisibili',
                'KYC obbligatorio'
              ].map((rule, index) => (
                <motion.span
                  key={rule}
                  className="px-4 py-2 rounded-full text-sm text-white/60 border border-white/10 bg-white/5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {rule}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10">
        <motion.div 
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/40 text-lg mb-6">Hai capito il sistema. Ora entra.</p>
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
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default HowToPlayPage;
