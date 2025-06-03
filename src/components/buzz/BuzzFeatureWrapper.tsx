
import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface BuzzFeatureWrapperProps {
  children: React.ReactNode;
}

const BuzzFeatureWrapper: React.FC<BuzzFeatureWrapperProps> = ({ children }) => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <div className="text-white text-center py-8">Caricamento...</div>;
  }

  if (!authState.isAuthenticated) {
    return <div className="text-red-500 text-center py-8">Accesso non autorizzato</div>;
  }

  return <>{children}</>;
};

export default BuzzFeatureWrapper;
