
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import { useEffect, useState } from "react";

type SoundType = "bell" | "buzz" | "chime" | "arcade";

export const useSoundEffects = () => {
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement | null>>({
    bell: null,
    buzz: null,
    chime: null,
    arcade: null,
  });
  
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  useEffect(() => {
    // Check if audio files exist and fallback gracefully
    const initializeAudio = async () => {
      try {
        // Create audio context for iOS compatibility
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        
        // Initialize audio elements with error handling
        const audioPromises = [
          { key: 'bell', path: '/sounds/bell.mp3' },
          { key: 'buzz', path: '/sounds/buzz.mp3' },
          { key: 'chime', path: '/sounds/chime.mp3' },
          { key: 'arcade', path: '/sounds/arcade.mp3' }
        ].map(async ({ key, path }) => {
          try {
            const audio = new Audio(path);
            audio.volume = 0.5;
            audio.preload = 'metadata';
            
            // Test if audio can be loaded
            await new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', resolve, { once: true });
              audio.addEventListener('error', reject, { once: true });
              audio.load();
            });
            
            return { key, audio };
          } catch (error) {
            console.warn(`Audio file ${path} non disponibile, utilizzando fallback silenzioso`);
            return { key, audio: null };
          }
        });
        
        const resolvedAudio = await Promise.all(audioPromises);
        const soundsMap = resolvedAudio.reduce((acc, { key, audio }) => {
          acc[key as SoundType] = audio;
          return acc;
        }, {} as Record<SoundType, HTMLAudioElement | null>);
        
        setSounds(soundsMap);
      } catch (error) {
        console.warn('Audio non supportato su questo dispositivo, modalità silenziosa attiva');
        setSounds({
          bell: null,
          buzz: null,
          chime: null,
          arcade: null,
        });
      }
    };
    
    initializeAudio();
    
    // Clean up function
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);
  
  const playSound = async (type: SoundType) => {
    if (isMuted || !sounds[type]) return;
    
    try {
      // Resume audio context if needed (iOS requirement)
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const sound = sounds[type];
      if (sound) {
        sound.currentTime = 0;
        await sound.play();
      }
    } catch (error) {
      // Fallback silenzioso - non logga errori per evitare spam console
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return { playSound, toggleMute, isMuted };
};

export default useSoundEffects;
