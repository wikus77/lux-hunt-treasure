// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Navigation Button - Zustand Compatible

import React from "react";
import { useNavigateCompat } from "@/hooks/useNavigateCompat";
import { cn } from "@/lib/utils";

interface NavigationButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Button component that navigates using Zustand navigation system
 * Replacement for react-router-dom Link
 */
export const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  to, 
  children, 
  className,
  onClick 
}) => {
  const navigate = useNavigateCompat();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "text-sm text-white/60 hover:text-white transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
};

/**
 * Link-like component that navigates using Zustand navigation system
 * Replacement for react-router-dom Link with link styling
 */
export const NavigationLink: React.FC<NavigationButtonProps> = ({ 
  to, 
  children, 
  className,
  onClick 
}) => {
  const navigate = useNavigateCompat();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a 
      href="#"
      onClick={handleClick}
      className={cn(
        "text-sm text-white/60 hover:text-white transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </a>
  );
};