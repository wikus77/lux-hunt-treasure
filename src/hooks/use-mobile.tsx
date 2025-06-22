
import { useState, useEffect } from "react";

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isCapacitorApp = !!(window as any).Capacitor;
      const isMobileUserAgent = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent);
      const isSmallScreen = window.innerWidth < breakpoint;
      
      setIsMobile(isMobileUserAgent || isCapacitorApp || isSmallScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    
    return () => window.removeEventListener("resize", checkDevice);
  }, [breakpoint]);

  return isMobile;
}
