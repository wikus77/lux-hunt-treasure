
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
  
  useEffect(() => {
    // Initialize audio elements
    const bellSound = new Audio("/sounds/bell.mp3");
    const buzzSound = new Audio("/sounds/buzz.mp3");
    const chimeSound = new Audio("/sounds/chime.mp3");
    const arcadeSound = new Audio("/sounds/arcade.mp3");
    
    // Set initial volume
    [bellSound, buzzSound, chimeSound, arcadeSound].forEach(sound => {
      sound.volume = 0.5;
    });
    
    setSounds({
      bell: bellSound,
      buzz: buzzSound,
      chime: chimeSound,
      arcade: arcadeSound,
    });
    
    // Clean up function
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    };
  }, []);
  
  const playSound = (type: SoundType) => {
    if (isMuted || !sounds[type]) return;
    
    sounds[type]?.play().catch(err => {
      console.log("Error playing sound:", err);
    });
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return { playSound, toggleMute, isMuted };
};

export default useSoundEffects;
