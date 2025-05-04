
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message }) => {
  // Garantisce che la pagina di fallback sia sempre visibile
  useEffect(() => {
    // Forza lo stile per massima visibilità
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#fff";
    document.body.style.display = "block";
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
    
    // Forza la visibilità dell'elemento di fallback
    const applyStyles = () => {
      const element = document.querySelector('.error-fallback');
      if (element) {
        const el = element as HTMLElement;
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.display = 'flex';
        el.style.backgroundColor = '#000';
        el.style.color = '#fff';
        el.style.position = 'fixed';
        el.style.top = '0';
        el.style.left = '0';
        el.style.right = '0';
        el.style.bottom = '0';
        el.style.zIndex = '9999';
      }
    };
    
    // Applica più volte per garantire la visibilità
    applyStyles();
    const timer1 = setTimeout(applyStyles, 10);
    const timer2 = setTimeout(applyStyles, 100);
    const timer3 = setTimeout(applyStyles, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 error-fallback"
      style={{
        opacity: 1, 
        display: 'flex',
        visibility: 'visible',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#000'
      }}
    >
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
