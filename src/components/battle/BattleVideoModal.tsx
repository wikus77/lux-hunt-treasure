/**
 * Battle Video Modal - Fullscreen video for WIN/LOSE
 * Shows cinematic video before the result modal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, VolumeX, Volume2, Trophy, Skull, Sparkles } from 'lucide-react';

interface BattleVideoModalProps {
  isOpen: boolean;
  won: boolean;
  onClose: () => void;
}

type Phase = 'video' | 'result';

const WIN_VIDEO = '/assets/video/M1SSION-BATTLE-WIN-v3.mp4'; // 🔥 Alta qualità
const LOSE_VIDEO = '/assets/video/M1SSION-BATTLE-LOSE-v3.mp4'; // 🔥 Alta qualità (38s)

export function BattleVideoModal({
  isOpen,
  won,
  onClose,
}: BattleVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoAudioEnabled, setVideoAudioEnabled] = useState(true); // 🔥 Start with audio enabled
  const [phase, setPhase] = useState<Phase>('video');

  // Reset phase when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('video');
      setVideoAudioEnabled(true); // 🔥 Audio enabled by default (user already tapped "ATTIVA ATTACCO")
    }
  }, [isOpen]);

  // Auto-play when opened - WITH AUDIO (user interaction already happened via "ATTIVA ATTACCO")
  useEffect(() => {
    if (isOpen && videoRef.current && phase === 'video') {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false; // 🔥 Start with audio ON (user already tapped button)
      videoRef.current.play().catch(() => {
        // If autoplay with audio fails, try muted and let user tap
        if (videoRef.current) {
          videoRef.current.muted = true;
          setVideoAudioEnabled(false);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isOpen, won, phase]);

  const handleVideoTapForAudio = useCallback(() => {
    if (videoRef.current && !videoAudioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setVideoAudioEnabled(true);
    }
  }, [videoAudioEnabled]);

  // When video ends, show result animation
  const handleVideoEnd = useCallback(() => {
    // 🛡️ Resetta MediaSession per impedire Dynamic Island
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      } catch (e) { /* ignore */ }
    }
    
    setPhase('result');
    // Auto close after result animation
    setTimeout(() => {
      onClose();
    }, 3000);
  }, [onClose]);

  const handleSkipVideo = useCallback(() => {
    if (phase === 'video') {
      setPhase('result');
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      onClose();
    }
  }, [onClose, phase]);

  if (!isOpen) {
    return null;
  }

  const videoSrc = won ? WIN_VIDEO : LOSE_VIDEO;
  // 🔥 NON spoilerare il risultato - mostra sempre "LAUNCHING"
  const accentColor = phase === 'video' ? '#00d4ff' : (won ? '#10b981' : '#ef4444');
  const title = phase === 'video' ? '🚀 LAUNCHING...' : (won ? '⚔️ VITTORIA!' : '💀 SCONFITTA!');
  const subtitle = phase === 'video' ? 'Attacco in corso...' : (won ? 'Hai distrutto il nemico!' : 'Il nemico ha resistito!');

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - ULTRA HIGH Z-INDEX */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[999998]"
          />

          {/* Modal Container Espandibile - Full Screen - ULTRA HIGH Z-INDEX */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[999999] overflow-hidden"
            style={{
              top: 'calc(47px + env(safe-area-inset-top, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div
              className="h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col"
              style={{
                borderColor: `${accentColor}30`,
                boxShadow: `0 -10px 40px ${accentColor}15, 0 0 0 1px ${accentColor}10`,
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab flex-shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <h3 
                    className="font-orbitron font-bold text-white text-[15px]"
                    style={{ textShadow: `0 0 10px ${accentColor}` }}
                  >
                    {title}
                  </h3>
                </div>
                <button
                  onClick={handleSkipVideo}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden relative">
                {phase === 'video' ? (
                  /* Video Phase - FULL SIZE */
                  <div
                    className="absolute inset-0"
                    onClick={handleVideoTapForAudio}
                    onTouchStart={handleVideoTapForAudio}
                  >
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full h-full object-cover"
                      playsInline
                      muted={!videoAudioEnabled}
                      onEnded={handleVideoEnd}
                      onError={handleSkipVideo}
                      // 🛡️ Impedisce attivazione Dynamic Island su iOS
                      disablePictureInPicture
                      disableRemotePlayback
                      controlsList="nodownload noremoteplayback"
                    />

                    {/* Audio hint overlay */}
                    {!videoAudioEnabled && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/70 backdrop-blur-sm"
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
                        {videoAudioEnabled ? (
                          <Volume2 className="w-6 h-6 text-white" />
                        ) : (
                          <VolumeX className="w-6 h-6 text-white/60" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Result Animation Phase */
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: won 
                        ? 'radial-gradient(circle at center, rgba(16,185,129,0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(239,68,68,0.3) 0%, transparent 70%)',
                    }}
                  >
                    {/* Flash effect */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 1, background: won ? '#10b981' : '#ef4444' }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />

                    {/* Pulsating rings */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border-2"
                        style={{
                          borderColor: won ? '#10b981' : '#ef4444',
                          width: 150 + i * 60,
                          height: 150 + i * 60,
                        }}
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}

                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
                    >
                      {won ? (
                        <div 
                          className="w-32 h-32 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 0 60px rgba(16,185,129,0.8), inset 0 0 30px rgba(255,255,255,0.2)',
                          }}
                        >
                          <Trophy className="w-16 h-16 text-white" />
                        </div>
                      ) : (
                        <div 
                          className="w-32 h-32 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 0 60px rgba(239,68,68,0.8), inset 0 0 30px rgba(255,255,255,0.2)',
                          }}
                        >
                          <Skull className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </motion.div>

                    {/* Result Text */}
                    <motion.h2
                      className="mt-8 text-4xl font-orbitron font-black uppercase tracking-widest"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      style={{
                        color: won ? '#10b981' : '#ef4444',
                        textShadow: won 
                          ? '0 0 30px rgba(16,185,129,0.8), 0 0 60px rgba(16,185,129,0.5)'
                          : '0 0 30px rgba(239,68,68,0.8), 0 0 60px rgba(239,68,68,0.5)',
                      }}
                    >
                      {won ? 'VITTORIA!' : 'SCONFITTA!'}
                    </motion.h2>

                    <motion.p
                      className="mt-3 text-lg text-white/80 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {won ? 'Hai distrutto il nemico!' : 'Il nemico ha resistito!'}
                    </motion.p>

                    {/* Sparkles for win */}
                    {won && (
                      <>
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={`sparkle-${i}`}
                            className="absolute"
                            initial={{ 
                              opacity: 0, 
                              scale: 0,
                              x: 0,
                              y: 0,
                            }}
                            animate={{ 
                              opacity: [0, 1, 0], 
                              scale: [0, 1, 0],
                              x: Math.cos(i * 30 * Math.PI / 180) * 150,
                              y: Math.sin(i * 30 * Math.PI / 180) * 150,
                            }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                          >
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                          </motion.div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Bottom Button */}
              <div className="px-4 pb-4 pt-2 flex-shrink-0">
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                  style={{
                    background: phase === 'video' 
                      ? 'linear-gradient(135deg, #00d4ff 0%, #0099ccCC 100%)'
                      : `linear-gradient(135deg, ${won ? '#10b981' : '#ef4444'} 0%, ${won ? '#059669' : '#dc2626'}CC 100%)`,
                    color: 'white',
                    boxShadow: phase === 'video'
                      ? '0 0 20px rgba(0,212,255,0.5)'
                      : `0 0 20px ${won ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkipVideo();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {phase === 'video' ? 'SALTA VIDEO' : 'CONTINUA'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

