
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundContextType {
  soundPreference: string;
  volume: number[];
  updateSound: (sound: string) => void;
  updateVolume: (volume: number[]) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundPreference, setSoundPreference] = useState('default');
  const [volume, setVolume] = useState([75]);

  useEffect(() => {
    const savedSound = localStorage.getItem('buzzSound');
    if (savedSound) {
      setSoundPreference(savedSound);
    }

    const savedVolume = localStorage.getItem('buzzVolume');
    if (savedVolume) {
      setVolume([Number(savedVolume)]);
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

  return (
    <SoundContext.Provider value={{ soundPreference, volume, updateSound, updateVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
