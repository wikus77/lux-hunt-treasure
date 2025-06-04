
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundName: string, volume?: number) => void;
  isEnabled: boolean;
  volume: number;
  soundPreference: string;
  updateSound: (preference: string) => void;
  updateVolume: (volume: number) => void;
  toggleSound: (enabled?: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
};

// Export useSound alias for compatibility
export const useSound = () => {
  return useSoundContext();
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [soundPreference, setSoundPreference] = useState('buzz');

  const toggleSound = useCallback((enabled?: boolean) => {
    setIsSoundEnabled(enabled !== undefined ? enabled : prev => !prev);
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const updateSound = useCallback((preference: string) => {
    setSoundPreference(preference);
  }, []);

  const playSound = useCallback((soundName: string, volume: number = 0.5) => {
    if (!isSoundEnabled) return;

    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = volume;
      audio.play().catch(e => console.warn('Audio play failed:', e));
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  }, [isSoundEnabled]);

  const value: SoundContextType = {
    isSoundEnabled,
    isEnabled: isSoundEnabled,
    volume,
    soundPreference,
    toggleSound,
    updateVolume,
    updateSound,
    playSound,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};
