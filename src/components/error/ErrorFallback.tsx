
import React from 'react';
import { Button } from "../ui/button";

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  message = "Si è verificato un errore nel caricamento di questa sezione.", 
  onRetry 
}) => {
  return (
    <div className="rounded-lg bg-m1ssion-deep-blue/30 border border-m1ssion-deep-blue p-4 text-center">
      <h3 className="text-lg font-medium mb-2">Oops!</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="bg-gradient-to-r from-m1ssion-blue/20 to-m1ssion-pink/20 hover:from-m1ssion-blue/30 hover:to-m1ssion-pink/30"
        >
          Riprova
        </Button>
      )}
    </div>
  );
};

export default ErrorFallback;
