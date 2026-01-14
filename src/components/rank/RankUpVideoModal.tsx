/**
 * M1SSION™ — Rank Up Video Modal
 * Video celebrativo full-screen per avanzamento di grado
 * NESSUNA interferenza durante la visione (no popup, no scroll, no touch)
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { HierarchyLevel } from '@/config/hierarchyConfig';

interface RankUpVideoModalProps {
  isOpen: boolean;
  newRank: HierarchyLevel;
  onComplete: () => void;
}

export const RankUpVideoModal: React.FC<RankUpVideoModalProps> = ({
  isOpen,
  newRank,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  // 🔒 Blocca scroll SOLO durante il video (non durante l'attesa del pulsante)
  useEffect(() => {
    if (isOpen && videoStarted) {
      document.body.style.overflow = 'hidden';
      
      const preventScroll = (e: Event) => {
        e.preventDefault();
      };
      
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('wheel', preventScroll);
      };
    }
  }, [isOpen, videoStarted]);

  // Reset state quando si apre
  useEffect(() => {
    if (isOpen) {
      setVideoEnded(false);
      setShowAnimation(false);
      setFadeOut(false);
      setVideoError(false);
      setVideoStarted(false);
    }
  }, [isOpen]);

  // 🔊 Attiva video CON AUDIO quando l'utente clicca
  const handleRankUp = useCallback(() => {
    console.log('[RankUp] Button clicked, starting video...');
    setVideoStarted(true);
    
    // Piccolo delay per assicurare che il video element sia renderizzato
    setTimeout(() => {
      if (videoRef.current && newRank.videoPath) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        videoRef.current.play()
          .then(() => {
            console.log('[RankUp] Video started successfully');
          })
          .catch(err => {
            console.warn('[RankUp] Play failed:', err);
            setVideoError(true);
          });
      } else if (!newRank.videoPath) {
        // Se non c'è video, mostra direttamente l'animazione
        setVideoError(true);
      }
    }, 100);
  }, [newRank.videoPath]);

  // Quando il video finisce
  const handleVideoEnd = useCallback(() => {
    console.log('[RankUp] Video ended, showing animation');
    setVideoEnded(true);
    setShowAnimation(true);
    
    // Mostra animazione per 4 secondi, poi dissolvenza
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 4000);
  }, [onComplete]);

  // Se non c'è video o errore, mostra solo l'animazione
  useEffect(() => {
    if (isOpen && videoStarted && (!newRank.videoPath || videoError)) {
      console.log('[RankUp] No video or error, showing animation directly');
      setVideoEnded(true);
      setShowAnimation(true);
      
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, 4000);
    }
  }, [isOpen, videoStarted, newRank.videoPath, videoError, onComplete]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 999999999,
          background: '#000',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: fadeOut ? 1 : 0.3 }}
      >
        {/* PULSANTE RANK UP - Prima del video */}
        {!videoStarted && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${newRank.color}30 0%, #000 70%)`,
              }}
            />
            
            {/* Icona rank */}
            <motion.div
              className="text-[80px] mb-6 relative z-10"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                filter: `drop-shadow(0 0 30px ${newRank.color})`,
              }}
            >
              {newRank.icon}
            </motion.div>
            
            <motion.p
              className="text-white/70 text-lg font-medium tracking-[0.3em] uppercase mb-2 relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              NUOVO GRADO SBLOCCATO
            </motion.p>
            
            <motion.h2
              className="text-4xl font-black uppercase mb-8 relative z-10"
              style={{ color: newRank.color }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {newRank.name}
            </motion.h2>
            
            {/* Pulsante RANK UP */}
            <motion.button
              type="button"
              onClick={handleRankUp}
              className="relative z-50 flex items-center gap-3 px-10 py-5 rounded-full font-bold text-2xl uppercase tracking-wider cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${newRank.color}, ${newRank.color}99)`,
                color: '#000',
                boxShadow: `0 0 30px ${newRank.color}80, 0 0 60px ${newRank.color}40`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-7 h-7 fill-current" />
              <span>RANK UP</span>
            </motion.button>
          </motion.div>
        )}

        {/* VIDEO FULL SCREEN */}
        {videoStarted && newRank.videoPath && !videoError && !videoEnded && (
          <video
            ref={videoRef}
            src={newRank.videoPath}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={false}
            onEnded={handleVideoEnd}
            onError={() => {
              console.warn('[RankUp] Video error');
              setVideoError(true);
            }}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback"
            style={{
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ANIMAZIONE RANK UP (dopo video) */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Particelle di sfondo */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: newRank.color,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                      y: [0, -100 - Math.random() * 200],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: Math.random() * 1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>

              {/* Glow radiale */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at center, ${newRank.color}40 0%, transparent 60%)`,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />

              {/* Contenuto principale */}
              <motion.div
                className="relative z-10 text-center px-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.3 }}
              >
                {/* Titolo */}
                <motion.p
                  className="text-white/70 text-lg font-medium tracking-[0.3em] uppercase mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  STATO AVANZAMENTO LIVELLO
                </motion.p>

                {/* Icona/Stemma grande */}
                <motion.div
                  className="text-[120px] leading-none mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.7 }}
                  style={{
                    filter: `drop-shadow(0 0 30px ${newRank.color}) drop-shadow(0 0 60px ${newRank.color})`,
                  }}
                >
                  {newRank.icon}
                </motion.div>

                {/* Nome del rank */}
                <motion.h1
                  className="text-5xl sm:text-6xl font-black uppercase tracking-wider mb-4"
                  style={{
                    color: newRank.color,
                    textShadow: `0 0 20px ${newRank.color}, 0 0 40px ${newRank.color}`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {newRank.name}
                </motion.h1>

                {/* Livello */}
                <motion.p
                  className="text-white/60 text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Livello {newRank.level}
                </motion.p>

                {/* Barra decorativa */}
                <motion.div
                  className="mt-8 mx-auto h-1 rounded-full"
                  style={{ background: newRank.color }}
                  initial={{ width: 0 }}
                  animate={{ width: 200 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                />
              </motion.div>

              {/* Anelli rotanti */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="absolute w-64 h-64 rounded-full border-2"
                  style={{ borderColor: `${newRank.color}30` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute w-80 h-80 rounded-full border"
                  style={{ borderColor: `${newRank.color}20` }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full border"
                  style={{ borderColor: `${newRank.color}10` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default RankUpVideoModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
