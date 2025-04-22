
import { useEffect, useRef } from 'react';

export const useBuzzSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initializeSound = (soundPreference: string, volume: number) => {
    const soundPath = getSoundPath(soundPreference);
    audioRef.current = new Audio(soundPath);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
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
