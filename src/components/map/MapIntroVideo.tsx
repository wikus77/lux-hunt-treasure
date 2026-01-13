// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * MAP INTRO VIDEO - Video briefing che parte all'ingresso nella pagina Mappa
 * 
 * Features:
 * - Video che parte automaticamente (muted per policy browser)
 * - Tap ovunque per attivare audio
 * - Tasto SKIP discreto
 * - Tasto "Non mostrare più" (salva in localStorage)
 * - Dissolvenza alla fine verso la Mappa
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2 } from 'lucide-react';
import './MapIntroVideo.css';

const VIDEO_SRC = '/assets/video/BUZZ-BRIF-VIDEO.mp4';
const STORAGE_KEY = 'm1_map_video_dismissed';

// 🔧 ADMIN EMAILS that can always see videos (reset on load)
const ADMIN_EMAILS = ['wikus77@hotmail.it'];

interface MapIntroVideoProps {
  onComplete: () => void;
  userEmail?: string;
}

const MapIntroVideo: React.FC<MapIntroVideoProps> = ({ onComplete, userEmail }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user has dismissed the video permanently
  // ADMIN override: always show video for admin emails
  useEffect(() => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    
    // 🔧 ADMIN: Reset video dismissal for admin users
    if (isAdmin) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[MapIntroVideo] 🔧 Admin detected, video reset');
      return; // Don't check dismissed for admins
    }
    
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete, userEmail]);

  // Try autoplay with audio on mount
  useEffect(() => {
    if (isVisible && videoRef.current && !videoError) {
      const video = videoRef.current;
      
      // Try to unmute - will work on desktop if MEI is high
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
        }).catch(() => {
          // Autoplay with audio blocked - keep muted
          video.muted = true;
          video.play().catch(() => {
            // Even muted autoplay failed
            setVideoError(true);
            onComplete();
          });
        });
      };
      
      // Small delay to let video initialize
      setTimeout(tryUnmute, 100);
    }
  }, [isVisible, videoError, onComplete]);

  // Handle tap anywhere to enable audio (for mobile)
  const handleScreenTap = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 800); // Fade duration
  }, [onComplete]);

  // Handle video error
  const handleVideoError = useCallback(() => {
    console.warn('[MapIntroVideo] Video failed to load');
    setVideoError(true);
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  // Handle SKIP button
  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  }, [onComplete]);

  // Handle "Non mostrare più" button
  const handleDismissPermanently = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`map-intro-video-container ${isFading ? 'fading' : ''}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        onClick={handleScreenTap}
        onTouchStart={handleScreenTap}
      >
        {/* Video */}
        <video
          ref={videoRef}
          className="map-intro-video"
          src={VIDEO_SRC}
          autoPlay
          playsInline
          muted
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          // 🛡️ Impedisce attivazione Dynamic Island su iOS
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noremoteplayback"
        />

        {/* Audio indicator (discreto in basso a sinistra) */}
        {!audioEnabled && (
          <motion.div 
            className="map-intro-audio-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            <VolumeX className="w-4 h-4" />
            <span>Tap per audio</span>
          </motion.div>
        )}

        {/* Audio ON indicator */}
        {audioEnabled && (
          <motion.div 
            className="map-intro-audio-on"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Volume2 className="w-4 h-4" />
          </motion.div>
        )}

        {/* Tasti discreti in basso a destra */}
        <div className="map-intro-controls">
          {/* Tasto "Non mostrare più" */}
          <motion.button
            className="map-intro-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDismissPermanently();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 0.8 }}
            transition={{ delay: 1 }}
          >
            Non mostrare più
          </motion.button>

          {/* Tasto SKIP */}
          <motion.button
            className="map-intro-skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Salta →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MapIntroVideo;

