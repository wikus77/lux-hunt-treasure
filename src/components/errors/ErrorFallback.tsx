
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message }) => {
  // Rimuoviamo l'useEffect e applichiamo stili semplici e diretti
  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        visibility: "visible",
        opacity: 1,
        backgroundColor: "#000",
        color: "#fff"
      }}
    >
      <div className="text-2xl font-bold text-red-500 mb-4">Qualcosa è andato storto</div>
      <div className="mb-6 text-center max-w-md">
        {message || "Si è verificato un errore durante il caricamento della pagina."}
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
