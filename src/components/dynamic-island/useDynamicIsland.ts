
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLongPress } from "@/hooks/useLongPress";

export const useDynamicIsland = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle haptic feedback
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(30); // 30ms vibration for subtle feedback
    }
  };

  // Long press handler for mobile
  const handleLongPress = () => {
    triggerHapticFeedback();
    setIsOpen(true);
  };

  // Configure long press
  const longPress = useLongPress(handleLongPress, {
    threshold: 400 // 400ms threshold for long press
  });

  // Handle click for desktop
  const handleClick = () => {
    if (!isMobile) {
      setIsOpen(!isOpen);
    }
  };

  // Auto-close expanded view after a timeout
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => setIsOpen(false), 7000);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Add backdrop blur when popup is open (mobile only)
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent && isMobile) {
      if (isOpen) {
        mainContent.style.filter = 'blur(3px)';
        mainContent.style.opacity = '0.6';
        mainContent.style.transition = 'filter 0.3s, opacity 0.3s';
      } else {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    }
    
    return () => {
      if (mainContent) {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    };
  }, [isOpen, isMobile]);

  return {
    isOpen,
    isMobile,
    longPress,
    handleClick,
  };
};

export default useDynamicIsland;
