
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Bug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EmailDebugPanelProps {
  lastError: string | null;
  lastResponse: any;
  showDebugInfo: boolean;
  showDetailedDebug: boolean;
  setShowDebugInfo: (show: boolean) => void;
  setShowDetailedDebug: (show: boolean) => void;
}

const EmailDebugPanel: React.FC<EmailDebugPanelProps> = ({
  lastError,
  lastResponse,
  showDebugInfo,
  showDetailedDebug,
  setShowDebugInfo,
  setShowDetailedDebug
}) => {
  if (!lastError && !showDebugInfo) return null;
  
  return (
    <div className="mb-4 space-y-2">
      {lastError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Errore: {lastError}
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2 p-0 h-auto" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? 'Nascondi dettagli' : 'Mostra dettagli'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showDebugInfo && (
        <div className="space-y-2">
          <div className="bg-gray-900 text-white p-3 rounded text-xs overflow-auto max-h-32">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Debugging info</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={() => setShowDetailedDebug(!showDetailedDebug)}
              >
                {showDetailedDebug ? 
                  <><ChevronUp className="h-3 w-3 mr-1" /> Nascondi dettagli</> : 
                  <><ChevronDown className="h-3 w-3 mr-1" /> Mostra dettagli</>
                }
              </Button>
            </div>
            <p>Assicurati che:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>La chiave API Resend sia configurata correttamente nelle variabili d'ambiente di Supabase</li>
              <li>Il dominio di invio sia verificato su Resend</li>
              <li>L'email destinataria non sia bloccata o inesistente</li>
              <li>Le quote del servizio email non siano esaurite</li>
            </ol>
            
            {showDetailedDebug && lastResponse && (
              <div className="mt-3 pt-2 border-t border-gray-700">
                <p className="font-semibold mb-1">Risposta API:</p>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => window.open("https://vkjrqirvdvjbemsfzxof.supabase.co/functions/send-email/logs", "_blank")}
            >
              <Bug className="h-3 w-3" /> Visualizza logs completi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDebugPanel;
