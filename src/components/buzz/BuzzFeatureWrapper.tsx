
import React, { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ErrorFallback from "../error/ErrorFallback";

interface BuzzFeatureWrapperProps {
  children: ReactNode;
}

const BuzzFeatureWrapper: React.FC<BuzzFeatureWrapperProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Se stiamo caricando, mostra un indicatore di caricamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-transparent border-projectx-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  // BYPASS: Since authentication is bypassed, always show content
  console.log("🔓 BUZZ FEATURE WRAPPER: Authentication bypassed, showing content");

  // Always render content since auth is bypassed
  return <>{children}</>;
};

export default BuzzFeatureWrapper;
