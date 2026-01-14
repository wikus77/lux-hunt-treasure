/**
 * M1SSION™ — Rank Up Video Modal
 * Video celebrativo full-screen per avanzamento di grado
 * NESSUNA interferenza durante la visione (no popup, no scroll, no touch)
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
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
  const [waitingForUserAction, setWaitingForUserAction] = useState(true); // Aspetta click utente per audio

  // 🔒 Blocca scroll e touch quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      // Blocca scroll
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      
      // Blocca eventi touch/mouse (ma non il pulsante di attivazione)
      const preventInteraction = (e: Event) => {
        const target = e.target as HTMLElement;
        // Permetti click sul pulsante di attivazione
        if (target.closest('[data-activate-button]')) {
          return;
        }
        if (!videoEnded && !waitingForUserAction) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      document.addEventListener('touchmove', preventInteraction, { passive: false });
      document.addEventListener('wheel', preventInteraction, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.userSelect = '';
        document.removeEventListener('touchmove', preventInteraction);
        document.removeEventListener('wheel', preventInteraction);
      };
    }
  }, [isOpen, videoEnded, waitingForUserAction]);

  // Reset state quando si apre
  useEffect(() => {
    if (isOpen) {
      setVideoEnded(false);
      setShowAnimation(false);
      setFadeOut(false);
      setVideoError(false);
      setWaitingForUserAction(true); // Aspetta click per audio
    }
  }, [isOpen]);

  // 🔊 Attiva video CON AUDIO quando l'utente clicca
  const handleActivateVideo = useCallback(() => {
    setWaitingForUserAction(false);
    
    if (videoRef.current && newRank.videoPath) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      videoRef.current.play().catch(err => {
        console.warn('[RankUpVideo] Play failed:', err);
        setVideoError(true);
      });
    }
  }, [newRank.videoPath]);

  // Quando il video finisce
  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true);
    setShowAnimation(true);
    
    // Mostra animazione per 4 secondi, poi dissolvenza
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 1000); // Durata dissolvenza
    }, 4000);
  }, [onComplete]);

  // Se non c'è video, mostra solo l'animazione (dopo click)
  useEffect(() => {
    if (isOpen && !waitingForUserAction && (!newRank.videoPath || videoError)) {
      setVideoEnded(true);
      setShowAnimation(true);
      
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, 4000);
    }
  }, [isOpen, waitingForUserAction, newRank.videoPath, videoError, onComplete]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 999999999, // Massimo z-index possibile
          background: '#000',
          touchAction: 'none',
          userSelect: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: fadeOut ? 1 : 0.3 }}
      >
        {/* PULSANTE ATTIVAZIONE AUDIO/VIDEO */}
        {waitingForUserAction && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${newRank.color}30 0%, #000 70%)`,
              }}
            />
            
            {/* Icona rank */}
            <motion.div
              className="text-[80px] mb-6"
              animate={{
                scale: [1, 1.1, 1],
                filter: [`drop-shadow(0 0 20px ${newRank.color})`, `drop-shadow(0 0 40px ${newRank.color})`, `drop-shadow(0 0 20px ${newRank.color})`],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {newRank.icon}
            </motion.div>
            
            <motion.p
              className="text-white/70 text-lg font-medium tracking-[0.3em] uppercase mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              NUOVO GRADO SBLOCCATO
            </motion.p>
            
            <motion.h2
              className="text-4xl font-black uppercase mb-8"
              style={{ color: newRank.color }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {newRank.name}
            </motion.h2>
            
            {/* Pulsante attivazione */}
            <motion.button
              data-activate-button
              onClick={handleActivateVideo}
              className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl uppercase tracking-wider transition-all"
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
              <Play className="w-6 h-6 fill-current" />
              <span>ATTIVA PROMOZIONE</span>
              <Volume2 className="w-6 h-6" />
            </motion.button>
            
            <motion.p
              className="text-white/40 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Premi per vedere il video con audio
            </motion.p>
          </motion.div>
        )}

        {/* VIDEO FULL SCREEN */}
        {newRank.videoPath && !videoError && !videoEnded && !waitingForUserAction && (
          <video
            ref={videoRef}
            src={newRank.videoPath}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={false}
            onEnded={handleVideoEnd}
            onError={() => setVideoError(true)}
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

  // Renderizza nel body per massima priorità z-index
  return createPortal(modalContent, document.body);
};

export default RankUpVideoModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

