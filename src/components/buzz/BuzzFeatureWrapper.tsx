
import React, { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface BuzzFeatureWrapperProps {
  children: ReactNode;
}

const BuzzFeatureWrapper: React.FC<BuzzFeatureWrapperProps> = ({ children }) => {
  // BYPASS: Since authentication is bypassed, always show content
  console.log("🔓 BUZZ FEATURE WRAPPER: Authentication bypassed, showing content");

  // Always render content since auth is bypassed
  return <>{children}</>;
};

export default BuzzFeatureWrapper;
