
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

// Sound types for proper typing
export type SoundType = 
  | "notification" 
  | "buzz" 
  | "chime" 
  | "arcade" 
  | "bell" 
  | "agentClick";

// Cache for sounds to avoid reloading
const soundCache: Record<string, HTMLAudioElement> = {};

/**
 * Custom hook for playing sound effects
 */
export const useSoundEffects = () => {
  // Preload sounds
  useEffect(() => {
    // List of sounds to preload
    const soundsToPreload: SoundType[] = ["notification", "buzz", "chime", "arcade", "bell", "agentClick"];
    
    // Preload each sound
    soundsToPreload.forEach(sound => {
      try {
        let path = `/sounds/${sound}.mp3`;
        // Special path for buzz sound
        if (sound === "buzz") {
          path = "/buzz-sound.mp3";
        }
        
        const audio = new Audio(path);
        audio.preload = "auto";
        soundCache[sound] = audio;
      } catch (error) {
        console.error(`Error preloading sound: ${sound}`, error);
      }
    });
    
    // Cleanup
    return () => {
      // No need to clean up audio elements, they'll be garbage collected
    };
  }, []);
  
  /**
   * Play a sound effect
   * @param sound The sound to play
   * @param volume Optional volume (0-1)
   */
  const playSound = useCallback((sound: SoundType, volume = 0.5) => {
    try {
      // Default path based on sound type
      let path = `/sounds/${sound}.mp3`;
      
      // Special case for buzz sound which has a different path
      if (sound === "buzz") {
        path = "/buzz-sound.mp3";
      }
      
      // Use cached audio if available, otherwise create a new one
      let audio = soundCache[sound];
      if (!audio) {
        audio = new Audio(path);
        soundCache[sound] = audio;
      }
      
      // Reset audio to beginning if it's currently playing
      audio.currentTime = 0;
      audio.volume = volume;
      
      // Play the sound
      const playPromise = audio.play();
      
      // Handle promise to catch any autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing sound: ${sound}`, error);
        });
      }
    } catch (error) {
      console.error(`Error playing sound: ${sound}`, error);
      toast.error("Impossibile riprodurre il suono");
    }
  }, []);

  return { playSound };
};

export default useSoundEffects;
