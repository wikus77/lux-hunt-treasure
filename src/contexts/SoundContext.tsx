
import React, { createContext, useContext, useState, ReactNode } from "react";

type SoundContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled }}>
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
