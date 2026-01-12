// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * QR WIN FLOW - State machine per l'esperienza QR Gratta e Vinci
 * 
 * Fasi:
 * 1. VIDEO - Video intro M1QR-WIN.mp4
 * 2. VIDEO-FADING - Dissolvenza post video
 * 3. SHOWCASE - Premi attivi
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PrizeShowcase from './PrizeShowcase';
import './qrwin.css';

type Phase = 'video' | 'video-fading' | 'checking' | 'success' | 'success-fading' | 'showcase';

// Video path - M1QR-WIN-v2.mp4 in /public/assets/video/
const VIDEO_SRC = '/assets/video/M1QR-WIN-v2.mp4';

const TIMING = {
  checking: 2400,
  success: 1380,
  fadeOut: 800, // fade transition duration (increased for smoother effect)
  videoFade: 1000, // video fade out duration
};

const QrWinFlow: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('video');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Try autoplay with audio on mount (works on desktop if user interacted before)
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      // Try to unmute - will work on desktop if MEI is high
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
        }).catch(() => {
          // Autoplay with audio blocked - keep muted
          video.muted = true;
          video.play();
        });
      };
      
      // Small delay to let video start
      setTimeout(tryUnmute, 100);
    }
  }, [phase]);

  // Handle tap anywhere to enable audio (for mobile)
  const handleScreenTap = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  // Generate confetti particles
  const confettiParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * 360;
      const distance = 150 + Math.random() * 100;
      const tx = Math.cos((angle * Math.PI) / 180) * distance;
      const ty = Math.sin((angle * Math.PI) / 180) * distance - 50;
      const rot = Math.random() * 720;
      const colors = ['#FFD700', '#00E5FF', '#22C55E', '#9333EA', '#FF6B6B'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.2;
      
      return { id: i, tx, ty, rot, color, delay };
    });
  }, []);

  // Generate background particles
  const bgParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
    }));
  }, []);

  // Haptic feedback (safe for iOS)
  const triggerHaptic = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch (e) {
      // Silent fail
    }
  }, []);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    setPhase('video-fading');
  }, []);

  // Handle video error (fallback to showcase)
  const handleVideoError = useCallback(() => {
    console.warn('[QrWinFlow] Video failed to load, skipping to showcase');
    setVideoError(true);
    setPhase('showcase');
  }, []);

  // Phase transitions
  useEffect(() => {
    // Video fading → showcase
    if (phase === 'video-fading') {
      const timer = setTimeout(() => {
        setPhase('showcase');
      }, TIMING.videoFade);
      return () => clearTimeout(timer);
    }

    // Legacy phases (kept for backward compatibility, not used when video is present)
    if (phase === 'checking') {
      const timer = setTimeout(() => {
        setPhase('success');
        triggerHaptic();
      }, TIMING.checking);
      return () => clearTimeout(timer);
    }

    if (phase === 'success') {
      const timer = setTimeout(() => {
        setPhase('success-fading');
      }, TIMING.success);
      return () => clearTimeout(timer);
    }

    if (phase === 'success-fading') {
      const timer = setTimeout(() => {
        setPhase('showcase');
      }, TIMING.fadeOut);
      return () => clearTimeout(timer);
    }
  }, [phase, triggerHaptic]);

  // Handle CTA
  const handleContinue = useCallback(() => {
    window.location.href = 'https://www.m1ssion.eu/landing';
  }, []);

  return (
    <div className="qrwin-container">
      {/* PHASE: VIDEO - Fullscreen intro video */}
      {(phase === 'video' || phase === 'video-fading') && !videoError && (
        <div 
          className={`qrwin-video-container ${phase === 'video-fading' ? 'qrwin-video-fading' : ''}`}
          onClick={handleScreenTap}
          onTouchStart={handleScreenTap}
        >
          <video
            ref={videoRef}
            className="qrwin-video"
            src={VIDEO_SRC}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          />
          {/* Minimal audio icon - bottom left, very subtle */}
          {!audioEnabled && (
            <div className="qrwin-audio-indicator">
              🔇
            </div>
          )}

          {/* Skip button for accessibility */}
          <button 
            className="qrwin-video-skip"
            onClick={() => setPhase('video-fading')}
          >
            Salta →
          </button>
        </div>
      )}

      {/* Background Effects - only show after video */}
      {phase !== 'video' && phase !== 'video-fading' && (
        <>
          <div className="qrwin-bg-gradient" />
          <div className="qrwin-particles">
            {bgParticles.map((p) => (
              <div
                key={p.id}
                className="qrwin-particle"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* PHASE: CHECKING (legacy - not used when video is present) */}
      {phase === 'checking' && (
        <div className="qrwin-checking">
          <div className="qrwin-scanner">
            <div className="qrwin-scanner-ring" />
            <div className="qrwin-scanner-ring" />
            <div className="qrwin-scanner-ring" />
            <div className="qrwin-scanner-core" />
            <div className="qrwin-scanline" />
          </div>
          <h1 className="qrwin-checking-title">Verifica accesso in corso...</h1>
          <p className="qrwin-checking-subtitle">Attendere</p>
        </div>
      )}

      {/* PHASE: SUCCESS */}
      {(phase === 'success' || phase === 'success-fading') && (
        <div className={`qrwin-success ${phase === 'success-fading' ? 'qrwin-fade-out' : ''}`}>
          {/* Flash effect */}
          <div className="qrwin-success-flash" />
          
          {/* Confetti */}
          <div className="qrwin-confetti">
            {confettiParticles.map((p) => (
              <div
                key={p.id}
                className="qrwin-confetti-particle"
                style={{
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  '--rot': `${p.rot}deg`,
                  backgroundColor: p.color,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Check Icon */}
          <div className="qrwin-success-icon">
            <div className="qrwin-success-glow" />
            <CheckCircle2 className="qrwin-success-check" />
          </div>

          {/* Text */}
          <h1 className="qrwin-success-title">ACCESSO CONFERMATO</h1>
          <p className="qrwin-success-subtitle">Benvenuto in M1SSION</p>
        </div>
      )}

      {/* PHASE: SHOWCASE */}
      {phase === 'showcase' && (
        <PrizeShowcase onContinue={handleContinue} />
      )}
    </div>
  );
};

export default QrWinFlow;
