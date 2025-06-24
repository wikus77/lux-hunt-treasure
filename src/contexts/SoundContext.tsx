
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundContextType {
  soundPreference: string;
  volume: number[];
  isEnabled: boolean;
  updateSound: (sound: string) => void;
  updateVolume: (volume: number[]) => void;
  toggleSound: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundPreference, setSoundPreference] = useState('default');
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
    localStorage.setItem('soundEnabled', enabled.toString());
  };

  return (
    <SoundContext.Provider value={{ 
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
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

// Add the missing export for useSoundContext
export const useSoundContext = useSound;
