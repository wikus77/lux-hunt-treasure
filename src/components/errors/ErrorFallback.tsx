
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-2xl font-bold text-red-500 mb-4">Qualcosa è andato storto</div>
      <div className="mb-6 text-center max-w-md">
        {message || "Si è verificato un errore durante il caricamento della landing page."}
      </div>
      <Button 
        onClick={() => window.location.reload()}
        className="bg-cyan-600 hover:bg-cyan-700"
      >
        Ricarica la pagina
      </Button>
    </div>
  );
};

export default ErrorFallback;
