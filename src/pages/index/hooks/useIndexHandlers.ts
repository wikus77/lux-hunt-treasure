/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Index Handlers Hook
 */

import { useState, useCallback } from "react";

export const useIndexHandlers = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  // Handlers for child components
  const handleLoaded = useCallback((isLoaded: boolean, canRender: boolean) => {
    console.log("handleLoaded chiamato con:", { isLoaded, canRender });
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
    console.log("Intro completed callback, setting introCompleted to true");
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("skipIntro", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  }, []);

  const handleCountdownComplete = useCallback((isCompleted: boolean) => {
    setCountdownCompleted(isCompleted);
  }, []);

  const handleRetry = useCallback(() => {
    console.log("Retry richiesto dall'utente");
    window.location.reload();
  }, []);

  return {
    pageLoaded,
    renderContent,
    countdownCompleted,
    handleLoaded,
    handleIntroComplete,
    handleCountdownComplete,
    handleRetry
  };
};