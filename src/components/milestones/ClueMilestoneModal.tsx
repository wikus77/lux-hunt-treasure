/**
 * CLUE MILESTONE MODAL™ — Popup di celebrazione LEVEL UP con VIDEO
 * Prima mostra video briefing, poi animazione LEVEL UP minimale ma scenica
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Zap, VolumeX, Volume2, X } from 'lucide-react';
import type { ClueMilestone } from '@/hooks/useClueMilestones';

// 🎬 Video path
const LEVELUP_VIDEO = '/assets/video/LEVELUP-BRIF-VIDEO.mp4';

interface ClueMilestoneModalProps {
  milestone: ClueMilestone | null;
  onClose: () => void;
}

// Fasi dell'animazione
type AnimationPhase = 'video' | 'levelup' | 'rewards' | 'done';

export const ClueMilestoneModal: React.FC<ClueMilestoneModalProps> = ({ milestone, onClose }) => {
  const [phase, setPhase] = useState<AnimationPhase>('video');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset quando cambia milestone
  useEffect(() => {
    if (milestone) {
      setPhase('video');
      setAudioEnabled(false);
      
      // Prova a far partire il video con audio
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.play().then(() => {
            setAudioEnabled(true);
          }).catch(() => {
            // Fallback: video muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }, 100);
    }
  }, [milestone]);

  // Tap per attivare audio
  const handleTapForAudio = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  // Video terminato -> passa a LEVEL UP
  const handleVideoEnd = useCallback(() => {
    setPhase('levelup');
  }, []);

  // Skip video
  const handleSkipVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase('levelup');
  }, []);

  // 2️⃣ Dopo LEVEL UP, mostra rewards
  useEffect(() => {
    if (phase === 'levelup') {
      setTimeout(() => setPhase('rewards'), 2000);
    }
  }, [phase]);

  // 3️⃣ Dopo rewards, chiudi e triggera slot machine
  useEffect(() => {
    if (phase === 'rewards' && milestone) {
      const closeTimer = setTimeout(() => {
        setPhase('done');
        
        // Scroll in alto per vedere il pill M1U
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Dispatch evento per slot machine PRIMA di chiudere
        console.log('[ClueMilestoneModal] 🎰 Dispatching m1u-credited for slot machine');
        window.dispatchEvent(new CustomEvent('m1u-credited', {
          detail: { amount: milestone.m1u }
        }));
        
        // Chiudi modal dopo un breve delay
        setTimeout(onClose, 500);
      }, 2500);

      return () => clearTimeout(closeTimer);
    }
  }, [phase, milestone, onClose]);

  if (!milestone || !milestone.title) return null;

  const modalContent = (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop con blur */}
          <motion.div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FASE 1: VIDEO */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {phase === 'video' && (
            <motion.div
              className="relative w-full max-w-[90vw] max-h-[85vh] aspect-video rounded-3xl overflow-hidden"
              style={{
                boxShadow: `
                  0 0 100px rgba(0, 209, 255, 0.4),
                  0 0 200px rgba(217, 70, 239, 0.2),
                  0 25px 50px rgba(0, 0, 0, 0.8)
                `,
                border: '3px solid rgba(0, 209, 255, 0.4)',
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={handleTapForAudio}
              onTouchStart={handleTapForAudio}
            >
              {/* Video */}
              <video
                ref={videoRef}
                src={LEVELUP_VIDEO}
                className="w-full h-full object-cover"
                playsInline
                muted={!audioEnabled}
                onEnded={handleVideoEnd}
                onError={handleSkipVideo}
                // 🛡️ Impedisce attivazione Dynamic Island su iOS
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noremoteplayback"
              />
              
              {/* Audio hint overlay */}
              {!audioEnabled && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/60 backdrop-blur-sm"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <VolumeX className="w-10 h-10 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">Tocca per l'audio</span>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Audio indicator */}
              <div className="absolute bottom-4 left-4">
                <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  {audioEnabled ? (
                    <Volume2 className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white/60" />
                  )}
                </div>
              </div>
              
              {/* Skip button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkipVideo();
                }}
                className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/80 transition-all text-sm font-medium"
              >
                Salta →
              </button>
              
              {/* Glow borders */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl" 
                style={{ 
                  boxShadow: 'inset 0 0 60px rgba(0, 209, 255, 0.2), inset 0 0 120px rgba(217, 70, 239, 0.1)' 
                }} 
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FASE 2: LEVEL UP! - Minimale ma scenico */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {phase === 'levelup' && (
            <>
              {/* Particelle esplosive */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 rounded-full"
                    style={{
                      background: ['#00D1FF', '#D946EF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#FFD700'][i % 7],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                      y: (Math.random() - 0.5) * window.innerHeight * 0.8,
                      opacity: [1, 1, 0],
                      scale: [0, 2, 0.5],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      delay: Math.random() * 0.2,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
              
              {/* Flash di luce */}
              <motion.div
                className="absolute inset-0 bg-white pointer-events-none"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Contenuto LEVEL UP */}
              <motion.div
                className="relative z-10 text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              >
                {/* Icona stella animata */}
                <motion.div
                  className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0],
                  }}
                  transition={{ duration: 0.8, repeat: 2 }}
                >
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                        'drop-shadow(0 0 60px rgba(255, 215, 0, 1))',
                        'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                      ],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Star className="w-20 h-20 text-yellow-400" fill="currentColor" />
                  </motion.div>
                </motion.div>
                
                {/* Testo LEVEL UP */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  <motion.p 
                    className="text-lg font-bold tracking-[0.5em] text-cyan-400 mb-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✦ CONGRATULAZIONI ✦
                  </motion.p>
                  
                  <motion.h1
                    className="text-6xl sm:text-7xl font-orbitron font-black mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #00D1FF 50%, #D946EF 75%, #22C55E 100%)',
                      backgroundSize: '300% 300%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 80px rgba(255, 215, 0, 0.5)',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    LEVEL UP!
                  </motion.h1>
                  
                  <motion.p
                    className="text-2xl sm:text-3xl font-bold text-white/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {milestone.title}
                  </motion.p>
                  
                  <motion.p
                    className="text-lg text-white/60 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {milestone.threshold} indizi trovati
                  </motion.p>
                </motion.div>
              </motion.div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FASE 3: REWARDS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {phase === 'rewards' && (
            <motion.div
              className="relative z-10 w-full max-w-md px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div 
                className="rounded-3xl p-8 text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(10, 15, 30, 0.98) 0%, rgba(5, 10, 20, 0.99) 100%)',
                  border: '2px solid rgba(0, 209, 255, 0.4)',
                  boxShadow: '0 0 60px rgba(0, 209, 255, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Title */}
                <p className="text-sm tracking-[0.3em] text-cyan-400 mb-1">SEI ORA</p>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
                  {milestone.title}
                </h2>

                {/* Rewards */}
                <div className="flex flex-col gap-4">
                  {/* M1U Reward */}
                  <motion.div
                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(0, 209, 255, 0.2) 100%)',
                      border: '2px solid rgba(34, 197, 94, 0.5)',
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
                    }}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <Sparkles className="w-7 h-7 text-green-400" />
                    <span className="text-4xl font-black text-green-400">+{milestone.m1u} M1U</span>
                    <Sparkles className="w-7 h-7 text-yellow-400" />
                  </motion.div>

                  {/* PE Reward */}
                  <motion.div
                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                      border: '2px solid rgba(168, 85, 247, 0.5)',
                      boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
                    }}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                  >
                    <Zap className="w-7 h-7 text-purple-400" />
                    <span className="text-4xl font-black text-purple-400">+{milestone.pe} PE</span>
                    <Zap className="w-7 h-7 text-pink-400" />
                  </motion.div>
                </div>

                {/* Loading */}
                <motion.p
                  className="text-white/50 text-sm mt-6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Accredito in corso...
                </motion.p>
              </div>
            </motion.div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );

  // Usa createPortal per renderizzare nel body (sopra tutto)
  return createPortal(modalContent, document.body);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
