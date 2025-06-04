
import React, { ReactNode } from "react";
import { useAuthContext } from "@/contexts/auth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ErrorFallback from "../error/ErrorFallback";

interface BuzzFeatureWrapperProps {
  children: ReactNode;
}

const BuzzFeatureWrapper: React.FC<BuzzFeatureWrapperProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  // Se stiamo caricando, mostra un indicatore di caricamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-transparent border-projectx-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se l'utente non è autenticato, mostra un messaggio di login
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <h2 className="text-xl font-bold">Accedi per Utilizzare BUZZ</h2>
        <p className="text-muted-foreground mb-4">
          Devi effettuare l'accesso per utilizzare questa funzionalità e sbloccare indizi.
        </p>
        <Link to="/login">
          <Button className="bg-gradient-to-r from-projectx-blue to-projectx-pink">
            Accedi
          </Button>
        </Link>
      </div>
    );
  }

  // Se l'utente è autenticato, mostra il contenuto
  return <>{children}</>;
};

export default BuzzFeatureWrapper;
