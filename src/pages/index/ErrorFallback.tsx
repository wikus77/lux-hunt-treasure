
import React from "react";

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Fallback component to display when there's an error
 * Aggiornato con migliore gestione degli errori e log di debug
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  // Log dettagliato per aiutare nel debug
  React.useEffect(() => {
    if (error) {
      console.error("ErrorFallback ricevuto errore:", error);
      console.error("Stack trace:", error.stack);
    }
  }, [error]);

  if (!error) return null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Si è verificato un errore</h2>
      <p className="mb-4">Ci scusiamo per l'inconveniente.</p>
      <div className="p-4 bg-black/30 border border-red-500/20 rounded-md mb-4 max-w-lg overflow-auto">
        <p className="text-sm text-red-400">{error.message || 'Errore sconosciuto'}</p>
      </div>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
      >
        Ricarica la pagina
      </button>
    </div>
  );
};

export default ErrorFallback;
