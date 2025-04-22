
import { useEffect, useRef } from 'react';

export const useBuzzSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initializeSound = (soundPreference: string, volume: number) => {
    const soundPath = getSoundPath(soundPreference);
    audioRef.current = new Audio(soundPath);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Preload the audio to ensure it plays instantly when needed
      audioRef.current.load();
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Error playing sound:", e);
          // Try to play again with user interaction
          document.addEventListener('click', function playOnClick() {
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.error("Error playing on click:", err));
            }
            document.removeEventListener('click', playOnClick);
          }, { once: true });
        });
      }
    }
  };

  const getSoundPath = (preference: string) => {
    switch (preference) {
      case 'chime':
        return "/sounds/chime.mp3";
      case 'bell':
        return "/sounds/bell.mp3";
      case 'arcade':
        return "/sounds/arcade.mp3";
      default:
        return "/sounds/buzz.mp3";
    }
  };

  return {
    initializeSound,
    playSound,
    getSoundPath
  };
};

export default useBuzzSound;
