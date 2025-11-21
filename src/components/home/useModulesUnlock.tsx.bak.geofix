
import { useState, useEffect } from "react";

interface UnlockedModules {
  mission: boolean;
  analysis: boolean;
  intel: boolean;
  shortcuts: boolean;
}

export const useModulesUnlock = () => {
  const [unlockedModules, setUnlockedModules] = useState<UnlockedModules>(() => {
    try {
      const savedUnlocks = typeof window !== "undefined" && localStorage.getItem("unlockedModules");
      return savedUnlocks ? JSON.parse(savedUnlocks) : {
        mission: true, // Always unlocked
        analysis: false,
        intel: false,
        shortcuts: false
      };
    } catch (err) {
      console.warn("[useModulesUnlock] unlock state init error", err);
      return { mission: true, analysis: false, intel: false, shortcuts: false };
    }
  });

  // Simulate unlocking modules after certain time periods (for demo purposes)
  useEffect(() => {
    // Mission is already unlocked by default
    
    // Unlock Analysis after 10 seconds
    const analysisTimer = setTimeout(() => {
      unlockModule('analysis');
    }, 10000);
    
    // Unlock Intel after 15 seconds
    const intelTimer = setTimeout(() => {
      unlockModule('intel');
    }, 15000);
    
    // Unlock Shortcuts after 20 seconds
    const shortcutsTimer = setTimeout(() => {
      unlockModule('shortcuts');
    }, 20000);
    
    return () => {
      clearTimeout(analysisTimer);
      clearTimeout(intelTimer);
      clearTimeout(shortcutsTimer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("unlockedModules", JSON.stringify(unlockedModules));
  }, [unlockedModules]);

  const unlockModule = (moduleName: string) => {
    console.log(`[useModulesUnlock] Unlocking module: ${moduleName}`);
    setUnlockedModules(prev => ({
      ...prev,
      [moduleName]: true
    }));
    
    // Play unlock sound
    const unlockSound = new Audio('/sounds/chime.mp3');
    unlockSound.volume = 0.5;
    unlockSound.play().catch(e => console.warn("Audio play failed:", e));
  };

  const handleModuleClick = (moduleName: string) => {
    if (!unlockedModules[moduleName as keyof UnlockedModules]) {
      console.log(`[useModulesUnlock] Attempted to access locked module: ${moduleName}`);
      
      // Play denied access sound
      const deniedSound = new Audio('/sounds/buzz.mp3');
      deniedSound.volume = 0.3;
      deniedSound.play().catch(e => console.warn("Audio play failed:", e));
      
      // For demo purposes, let's unlock the module when clicked
      // In a real app, this would be triggered by actual game progress
      setTimeout(() => unlockModule(moduleName), 1500);
    }
  };

  const areAllModulesUnlocked = () => {
    return unlockedModules.mission && 
           unlockedModules.analysis && 
           unlockedModules.intel && 
           unlockedModules.shortcuts;
  };

  return {
    unlockedModules,
    unlockModule,
    handleModuleClick,
    areAllModulesUnlocked
  };
};

export default useModulesUnlock;
