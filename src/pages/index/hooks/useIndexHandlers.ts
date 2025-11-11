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
    setPageLoaded(isLoaded);
    setRenderContent(canRender);
  }, []);

  const handleIntroComplete = useCallback(() => {
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