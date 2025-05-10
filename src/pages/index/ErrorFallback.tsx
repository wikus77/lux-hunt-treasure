
import React from "react";

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Fallback component to display when there's an error
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Si è verificato un errore</h2>
      <p className="mb-4">Ci scusiamo per l'inconveniente.</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-cyan-600 text-white rounded-md"
      >
        Ricarica la pagina
      </button>
    </div>
  );
};

export default ErrorFallback;
