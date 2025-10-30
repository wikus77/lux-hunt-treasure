// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ARCHETYPE_CONFIGS } from './dnaTypes';
import type { DNAProfile } from './dnaTypes';
import { TesseractDNA } from './TesseractDNA';
import { RubikDNACube } from './visuals/RubikDNACube';
import { Rubik4Scene } from './rubik/Rubik4Scene';
import { NeuralLinksScene } from './neural/NeuralLinksScene';
import { DNAErrorBoundary } from './common/DNAErrorBoundary';
import { DNAEvolutionScene } from './DNAEvolutionScene';
import { MindFractalLite } from './mind-fractal-lite/MindFractalLite';
import { MindFractal3D } from './mind-fractal3d/MindFractal3D';
import { ArchetypeIcon } from './ArchetypeIcon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { X, Info } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface DNAHubProps {
  dnaProfile: DNAProfile;
  events?: Array<{
    id: string;
    source: string;
    delta: any;
    note?: string;
    created_at: string;
  }>;
  onEvolve?: () => void;
}

/**
 * M1SSION DNA™ Hub - Living Identity Dashboard
 * 
 * The central interface for viewing and managing agent DNA.
 * Features:
 * - Dynamic pentagon visualization of 5 DNA attributes
 * - Evolution timeline with mutation history
 * - Archetype badge and description
 * - Cinematic evolution trigger
 */
export const DNAHub: React.FC<DNAHubProps> = ({ 
  dnaProfile, 
  events = [],
  onEvolve
}) => {
  const [showEvolution, setShowEvolution] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showSkippedPill, setShowSkippedPill] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  
  // Feature flags: Mind Fractal 3D (full interactive version with nodes and arcs)
  const USE_MF3D = true;
  const USE_MIND_FRACTAL_LITE = false;
  const enableNeuralLinksDNA = false;
  const [enableTesseract] = useState(true); // Enable new HyperCube
  const [enableRubikDNA] = useState(true); // Enable Rubik 4x4 neon wireframe
  const { getCurrentUser } = useUnifiedAuth();

  const archetypeConfig = ARCHETYPE_CONFIGS[dnaProfile.archetype];
  const user = getCurrentUser();

  // Check if user skipped today's onboarding & show hint
  useEffect(() => {
    if (!user?.id) return;

    const getTodayKey = () => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const lastShown = localStorage.getItem(`dna:lastShown:${user.id}`);
    const completed = localStorage.getItem(`dna:completed:${user.id}`) === '1';
    const today = getTodayKey();

    // Show pill if skipped today and not completed
    setShowSkippedPill(lastShown === today && !completed);
    
    // Show hint once per day
    const hintKey = `dna:hintShown:${user.id}:${today}`;
    const hintShown = localStorage.getItem(hintKey) === '1';
    
    if (!hintShown && activeTab === 'overview') {
      setShowHint(true);
      localStorage.setItem(hintKey, '1');
      
      // Auto-hide after 2.5s
      setTimeout(() => setShowHint(false), 2500);
    }
  }, [user?.id, activeTab]);

  const handleEvolve = () => {
    setShowEvolution(true);
    onEvolve?.();
  };

  return (
    <>
      <div 
        className="min-h-screen bg-black text-white overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${archetypeConfig.color}15, transparent 70%), black`
        }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-white/10 backdrop-blur-xl bg-black/40 relative"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h1 
              className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              M1SSION DNA™
            </motion.h1>
            <p className="text-sm md:text-base text-white/60 font-medium">
              Identità Evolutiva dell'Agente — Codice Vivo
            </p>
          </div>

          {/* Skipped Today Pill */}
          <AnimatePresence>
            {showSkippedPill && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm"
              >
                <span className="text-xs text-yellow-400 font-medium">
                  Primo sequenziamento disponibile domani
                </span>
                <button
                  onClick={() => setShowSkippedPill(false)}
                  className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Archetype Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border backdrop-blur-xl"
            style={{
              backgroundColor: `${archetypeConfig.color}10`,
              borderColor: `${archetypeConfig.color}30`,
              boxShadow: `0 0 40px ${archetypeConfig.color}20`
            }}
          >
            <ArchetypeIcon 
              archetype={dnaProfile.archetype} 
              size={120}
            />
            <div className="flex-1 text-center md:text-left">
              <Badge 
                className="mb-2"
                style={{
                  backgroundColor: `${archetypeConfig.color}20`,
                  color: archetypeConfig.color,
                  borderColor: `${archetypeConfig.color}40`
                }}
              >
                {archetypeConfig.name}
              </Badge>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: archetypeConfig.color }}
              >
                {archetypeConfig.nameIt}
              </h2>
              <p className="text-white/70 text-sm md:text-base">
                {archetypeConfig.description}
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              DNA Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              Storia Genetica
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Hint Pill */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 px-4 py-2 mx-auto w-fit rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-cyan-400 font-medium">
                        Muovi il mouse / Trascina per ruotare — doppio clic per reset
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Accessibility Toggle */}
                <div className="flex items-center justify-center gap-3 px-4 py-2 mx-auto w-fit rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm text-white/70">Riduci animazioni</span>
                  <Switch
                    checked={reduceAnimations}
                    onCheckedChange={setReduceAnimations}
                    aria-label="Riduci animazioni DNA"
                  />
                </div>

                {/* Mind Fractal 3D - Interactive tunnel with nodes and electric arcs */}
                <div className="flex justify-center relative -mx-6 md:-mx-12">
                  {USE_MF3D ? (
                    <DNAErrorBoundary>
                      <MindFractal3D
                        className="w-full h-[700px] rounded-xl overflow-hidden"
                        onReady={() => console.log('[DNAHub] Mind Fractal 3D ready')}
                        onProgress={(p) => {
                          console.log('[DNAHub] Progress:', p);
                          window.dispatchEvent(new CustomEvent('mf:progress', { detail: p }));
                        }}
                        reduced={reduceAnimations}
                      />
                    </DNAErrorBoundary>
                  ) : USE_MIND_FRACTAL_LITE ? (
                    <div className="w-full h-[700px] relative overflow-hidden bg-black">
                      <DNAErrorBoundary>
                        <MindFractalLite 
                          seed={dnaProfile.intuito * 1000 + dnaProfile.audacia * 100 + dnaProfile.etica * 10 + dnaProfile.rischio}
                          reduced={reduceAnimations}
                          onReady={() => console.log('[DNAHub] Mind Fractal Lite ready')}
                          onBurst={() => console.log('[DNAHub] DNA Evolution burst triggered')}
                        />
                      </DNAErrorBoundary>
                    </div>
                  ) : enableNeuralLinksDNA ? (
                    <div className="w-full h-[700px] relative overflow-hidden">
                      <DNAErrorBoundary>
                        <NeuralLinksScene />
                      </DNAErrorBoundary>
                    </div>
                  ) : enableRubikDNA ? (
                    <div className="w-full h-[700px] relative overflow-hidden">
                      <DNAErrorBoundary>
                        <Rubik4Scene />
                      </DNAErrorBoundary>
                    </div>
                  ) : enableTesseract ? (
                    <div className="w-full h-[700px] relative overflow-hidden">
                      <RubikDNACube />
                    </div>
                  ) : (
                    <TesseractDNA
                      profile={dnaProfile} 
                      size={400}
                      disableTilt={reduceAnimations}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleEvolve}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8"
                  >
                    🧬 EVOLVI DNA
                  </Button>
                  <Button
                    onClick={() => setActiveTab('history')}
                    size="lg"
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 font-bold px-8"
                  >
                    📜 STORIA GENETICA
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Timeline */}
                <ScrollArea className="h-[500px] rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl p-6">
                  {events.length === 0 ? (
                    <div className="text-center text-white/50 py-12">
                      <p className="text-lg mb-2">Nessuna mutazione registrata</p>
                      <p className="text-sm">Le tue azioni future scriveranno la storia del tuo DNA</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event, idx) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.source}
                                </Badge>
                                <span className="text-xs text-white/50">
                                  {format(new Date(event.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                                </span>
                              </div>
                              {event.note && (
                                <p className="text-sm text-white/70 mb-2">{event.note}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(event.delta || {}).map(([key, val]: [string, any]) => (
                                  <span
                                    key={key}
                                    className={`text-xs font-mono px-2 py-1 rounded ${
                                      val > 0
                                        ? 'bg-green-500/20 text-green-400'
                                        : val < 0
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-white/10 text-white/60'
                                    }`}
                                  >
                                    {key.toUpperCase()}: {val > 0 ? '+' : ''}{val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Neon Glow Effect */}
          <div className="fixed inset-0 pointer-events-none">
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[100px]"
              style={{
                background: `radial-gradient(circle, ${archetypeConfig.color}, transparent 70%)`
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </div>

      {/* Evolution Scene */}
      <DNAEvolutionScene
        isOpen={showEvolution}
        archetype={dnaProfile.archetype}
        onComplete={() => setShowEvolution(false)}
      />
    </>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
