// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
// M1SSION™ Custom Navigation Hook - Replacement for react-router-dom
// Compatibilità Capacitor iOS al 100%

import React, { useCallback, useEffect } from 'react';
import { useRoutingStore, routingHelpers } from '@/stores/routingStore';

export interface NavigationLocation {
  pathname: string;
}

export interface NavigationHook {
  navigate: (path: string, options?: { replace?: boolean }) => void;
  goBack: () => boolean;
  location: NavigationLocation;
  currentPath: string;
  isCapacitor: boolean;
}

// Hook that replaces useNavigate and useLocation from react-router-dom
export const useNavigation = (): NavigationHook => {
  const { 
    currentPath, 
    navigate: storeNavigate, 
    goBack: storeGoBack, 
    isCapacitor,
    setCapacitorMode 
  } = useRoutingStore();

  // Detect Capacitor environment on mount
  useEffect(() => {
    const isCapacitorApp = typeof window !== 'undefined' && 
      (window.location.protocol === 'capacitor:' || 
       (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));
    
    setCapacitorMode(isCapacitorApp);
    
    console.log('🧭 NAVIGATION HOOK: Capacitor mode:', isCapacitorApp);
  }, [setCapacitorMode]);

  // Custom navigate function with iOS optimizations
  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    console.log('🧭 NAVIGATION: Navigating to:', path, options);
    
    // iOS WebView scroll fix
    if (isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
    
    storeNavigate(path, options?.replace || false);
  }, [storeNavigate, isCapacitor]);

  // Custom go back function
  const goBack = useCallback(() => {
    console.log('🧭 NAVIGATION: Going back');
    
    const success = storeGoBack();
    
    // iOS WebView scroll fix
    if (isCapacitor && success) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
    
    return success;
  }, [storeGoBack, isCapacitor]);

  // Create location object compatible with react-router-dom
  const location: NavigationLocation = {
    pathname: currentPath,
  };

  return {
    navigate,
    goBack,
    location,
    currentPath,
    isCapacitor,
  };
};

// Hook that replaces useSearchParams from react-router-dom
export const useSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  
  const setSearchParams = useCallback((params: URLSearchParams | Record<string, string>) => {
    const newParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const url = new URL(window.location.href);
    url.search = newParams.toString();
    window.history.pushState({}, '', url.toString());
  }, []);

  return [searchParams, setSearchParams] as const;
};

// Hook that replaces useParams from react-router-dom
export const useParams = () => {
  // For now, return empty params since we don't have dynamic routes
  // Can be extended later if needed
  return {};
};

// Direct replacement functions for components that used react-router-dom directly
export const navigationHelpers = {
  explicitNavigate: routingHelpers.explicitNavigate,
  explicitGoBack: routingHelpers.explicitGoBack,
  getCurrentPath: routingHelpers.getExplicitCurrentPath,
  getRouteConfig: routingHelpers.getExplicitRouteConfig,
};

// Custom Link component to replace react-router-dom Link
export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  onClick?: () => void;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, replace, onClick }) => {
  const { navigate } = useNavigation();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    navigate(to, { replace });
  }, [navigate, to, replace, onClick]);

  return React.createElement('a', {
    href: to,
    onClick: handleClick,
    className: className
  }, children);
};

console.log('✅ M1SSION Custom Navigation Hook initialized');