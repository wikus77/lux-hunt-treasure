/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Intro State Hook
 */

import { useState, useEffect } from "react";

export const useIntroState = () => {
  const [introCompleted, setIntroCompleted] = useState(false);

  // Verifica se l'intro è già stata mostrata in precedenza
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const skipIntro = localStorage.getItem("skipIntro");
        if (skipIntro === "true") {
          console.log("Intro already shown, skipping...");
          setIntroCompleted(true);
        } else {
          console.log("No skipIntro flag found, will show intro");
          setIntroCompleted(false);
        }
      }
    } catch (error) {
      console.error("localStorage error:", error);
      setIntroCompleted(false);
    }
  }, []);

  return { introCompleted, setIntroCompleted };
};