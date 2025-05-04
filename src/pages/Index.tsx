
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Nuova pagina Index ultra-semplificata
 * Solo HTML puro e stili inline minimali 
 */
const Index = () => {
  const navigate = useNavigate();
  
  // Applicare stili direttamente al body per garantire visibilità
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
    document.body.style.fontFamily = "system-ui, sans-serif";
    document.body.style.display = "block";
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
  }, []);
  
  // Funzioni di navigazione
  const handleRegisterClick = () => navigate("/register");
  const handleLoginClick = () => navigate("/login");
  
  return (
    <div style={{
      display: "block",
      visibility: "visible",
      opacity: 1,
      backgroundColor: "#000000",
      color: "#ffffff",
      minHeight: "100vh",
      width: "100%",
      position: "relative"
    }}>
      {/* Header minimale */}
      <header style={{
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{
          fontWeight: "bold",
          fontSize: "24px"
        }}>
          <span style={{ color: "#00E5FF" }}>M1</span>
          <span style={{ color: "#FFFFFF" }}>SSION</span>
        </div>
        
        <button
          onClick={handleLoginClick}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Accedi
        </button>
      </header>

      {/* Hero section ultra-semplificata */}
      <main style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 20px",
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "#00E5FF"
        }}>
          M1SSION
        </h1>
        
        <p style={{
          fontSize: "18px",
          marginBottom: "32px",
          maxWidth: "600px",
        }}>
          La caccia al tesoro più esclusiva d'Italia. 
          Ogni mese, una nuova missione, una nuova auto di lusso da vincere.
        </p>
        
        <button 
          onClick={handleRegisterClick}
          style={{
            padding: "12px 24px",
            backgroundColor: "#00E5FF",
            color: "black",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Inizia ora
        </button>
      </main>

      {/* Features section semplificata */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "#000000"
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "40px",
            textAlign: "center",
            color: "#00E5FF"
          }}>
            Come funziona
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px"
          }}>
            <div style={{
              padding: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>01</div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>Registrati</h3>
              <p style={{
                opacity: 0.7
              }}>Crea il tuo account M1SSION e preparati all'avventura.</p>
            </div>
            
            <div style={{
              padding: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>02</div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>Trova Indizi</h3>
              <p style={{
                opacity: 0.7
              }}>Scopri gli indizi nelle città italiane e decifrali.</p>
            </div>
            
            <div style={{
              padding: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>03</div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>Vinci Premi</h3>
              <p style={{
                opacity: 0.7
              }}>Arriva per primo e vinci auto di lusso e premi esclusivi.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer semplificato */}
      <footer style={{
        padding: "40px 20px",
        backgroundColor: "#000000",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center"
      }}>
        <div style={{
          fontWeight: "bold",
          fontSize: "24px",
          marginBottom: "16px"
        }}>
          <span style={{ color: "#00E5FF" }}>M1</span>
          <span style={{ color: "#FFFFFF" }}>SSION</span>
        </div>
        <p style={{
          fontSize: "14px",
          opacity: 0.4
        }}>
          © {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.
        </p>
      </footer>
    </div>
  );
};

export default Index;
