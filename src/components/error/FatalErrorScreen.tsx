// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Fatal Error Screen - Last resort fallback

import React from 'react';
import { Button } from '@/components/ui/button';

interface FatalErrorScreenProps {
  error?: Error;
  onRetry?: () => void;
}

export const FatalErrorScreen: React.FC<FatalErrorScreenProps> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">⚠️</div>
        
        <h1 className="text-2xl font-bold font-orbitron text-foreground">
          ERRORE DI SISTEMA
        </h1>
        
        <p className="text-muted-foreground">
          L'applicazione M1SSION™ ha riscontrato un errore critico.
          Riavvia l'app per continuare.
        </p>
        
        {error && (
          <details className="text-left text-xs bg-muted p-3 rounded">
            <summary className="cursor-pointer font-medium">Dettagli tecnici</summary>
            <pre className="mt-2 overflow-auto max-h-32">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={onRetry || (() => window.location.reload())}
            className="w-full"
            variant="default"
          >
            🔄 Riavvia App
          </Button>
          
          <Button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full"
            variant="outline"
          >
            🔨 Reset Completo
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
            variant="ghost"
          >
            🏠 Torna alla Home
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          M1SSION™ © 2025 NIYVORA KFT™
        </div>
      </div>
    </div>
  );
};

export default FatalErrorScreen;