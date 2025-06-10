
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type SoundContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  volume: number[];
  soundPreference: string;
  isEnabled: boolean;
  updateSound: (sound: string) => void;
  updateVolume: (volume: number[]) => void;
  toggleSound: (enabled: boolean) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundPreference, setSoundPreference] = useState('buzz');
  const [volume, setVolume] = useState([75]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const savedSound = localStorage.getItem('buzzSound');
    if (savedSound) {
      setSoundPreference(savedSound);
    }

    const savedVolume = localStorage.getItem('buzzVolume');
    if (savedVolume) {
      setVolume([Number(savedVolume)]);
    }
    
    const savedEnabled = localStorage.getItem('soundEnabled');
    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === 'true');
      setSoundEnabled(savedEnabled === 'true');
    }
  }, []);

  const updateSound = (sound: string) => {
    setSoundPreference(sound);
    localStorage.setItem('buzzSound', sound);
  };

  const updateVolume = (newVolume: number[]) => {
    setVolume(newVolume);
    localStorage.setItem('buzzVolume', newVolume[0].toString());
  };
  
  const toggleSound = (enabled: boolean) => {
    setIsEnabled(enabled);
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  return (
    <SoundContext.Provider value={{ 
      soundEnabled,
      setSoundEnabled,
      soundPreference, 
      volume, 
      isEnabled, 
      updateSound, 
      updateVolume,
      toggleSound
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

// Add the missing export for useSoundContext
export const useSoundContext = useSound;
