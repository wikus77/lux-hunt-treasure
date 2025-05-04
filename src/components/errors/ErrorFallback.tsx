
import React from "react";

interface ErrorFallbackProps {
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message }) => {
  // Versione ultra-semplificata che usa solo stili inline
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      visibility: "visible",
      opacity: 1,
      backgroundColor: "#000",
      color: "#fff",
      padding: "16px"
    }}>
      <div style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: "#ff4444",
        marginBottom: "16px"
      }}>
        Qualcosa è andato storto
      </div>
      
      <div style={{
        marginBottom: "24px",
        textAlign: "center",
        maxWidth: "400px"
      }}>
        {message || "Si è verificato un errore durante il caricamento della pagina."}
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#008CBA",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Ricarica la pagina
      </button>
    </div>
  );
};

export default ErrorFallback;
