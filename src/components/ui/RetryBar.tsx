/**
 * Retry Bar Component for Network/Offline Errors
 * M1SSION™ - Enhanced Error Handling
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface RetryBarProps {
  isVisible: boolean;
  isOffline?: boolean;
  onRetry: () => void;
  onDismiss?: () => void;
  message?: string;
}

export const RetryBar: React.FC<RetryBarProps> = ({
  isVisible,
  isOffline = false,
  onRetry,
  onDismiss,
  message
}) => {
  if (!isVisible) return null;

  const defaultMessage = isOffline 
    ? 'Connessione persa. Alcune funzioni potrebbero non essere disponibili.'
    : 'Errore di rete. Riprova per continuare.';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-3 shadow-lg border-b border-destructive/20">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {message || defaultMessage}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
          >
            {isOffline ? (
              <>
                <Wifi className="h-4 w-4 mr-1" />
                Riconnetti
              </>
            ) : (
              'Riprova'
            )}
          </Button>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-destructive-foreground hover:bg-destructive-foreground/10"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};