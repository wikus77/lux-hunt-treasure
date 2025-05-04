
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import M1ssionText from "@/components/logo/M1ssionText";

/**
 * Pagina Index completamente riscritta e semplificata al massimo
 * Nessuna animazione, nessuna dipendenza esterna, HTML puro con stili inline
 */
const Index = () => {
  const navigate = useNavigate();
  
  // Funzioni di navigazione
  const handleRegisterClick = () => navigate("/register");
  const handleLoginClick = () => navigate("/login");
  
  // Applica stili direttamente al body
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.backgroundColor = "#000000";
  document.body.style.color = "#ffffff";
  document.body.style.fontFamily = "'Inter', sans-serif";
  document.body.style.overflowX = "hidden";
  document.body.style.display = "block";
  document.body.style.visibility = "visible";
  document.body.style.opacity = "1";
  
  return (
    <div style={{
      display: "block",
      visibility: "visible",
      opacity: 1,
      backgroundColor: "#000000",
      color: "#ffffff",
      minHeight: "100vh",
      width: "100%"
    }}>
      {/* Header semplificato */}
      <header style={{
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <M1ssionText />
        
        <Button
          onClick={handleLoginClick}
          variant="ghost"
          className="text-white hover:text-cyan-400"
        >
          Accedi
        </Button>
      </header>

      {/* Hero section ultra-semplificata */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "100vh",
        padding: "0 16px",
        paddingTop: "80px"
      }}>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
          fontWeight: "bold",
          marginBottom: "24px",
          background: "linear-gradient(to right, #00E5FF, #0088FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          M1SSION
        </h1>
        
        <p style={{
          fontSize: "clamp(1rem, 4vw, 1.5rem)",
          marginBottom: "32px",
          maxWidth: "800px",
          opacity: 0.8
        }}>
          La caccia al tesoro più esclusiva d'Italia. 
          Ogni mese, una nuova missione, una nuova auto di lusso da vincere.
        </p>
        
        <Button 
          onClick={handleRegisterClick}
          size="lg"
          className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:scale-[1.03] min-w-[200px]"
        >
          Inizia ora <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </section>

      {/* Features section semplificata */}
      <section style={{
        padding: "64px 16px",
        backgroundColor: "#000000"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: "bold",
            marginBottom: "48px",
            textAlign: "center",
            background: "linear-gradient(to right, #00E5FF, #0088FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Come funziona
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "32px"
          }}>
            <div style={{
              padding: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>01</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>Registrati</h3>
              <p style={{
                opacity: 0.7
              }}>Crea il tuo account M1SSION e preparati all'avventura.</p>
            </div>
            
            <div style={{
              padding: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>02</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>Trova Indizi</h3>
              <p style={{
                opacity: 0.7
              }}>Scopri gli indizi nascosti nelle città italiane e decifrali.</p>
            </div>
            
            <div style={{
              padding: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px"
            }}>
              <div style={{
                color: "#00E5FF",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "16px"
              }}>03</div>
              <h3 style={{
                fontSize: "1.25rem",
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
      
      {/* CTA section semplificata */}
      <section style={{
        padding: "64px 16px",
        background: "linear-gradient(to bottom, #000000, #111111)"
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center"
        }}>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: "bold",
            marginBottom: "24px"
          }}>
            Preparati a vivere l'avventura
          </h2>
          <p style={{
            fontSize: "1.25rem",
            marginBottom: "32px",
            opacity: 0.8
          }}>
            Ogni mese un nuovo premio, una nuova sfida. Sei pronto?
          </p>
          <Button 
            onClick={handleRegisterClick}
            size="lg"
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:scale-[1.03]"
          >
            Registrati ora <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer semplificato */}
      <footer style={{
        padding: "40px 16px",
        backgroundColor: "#000000",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          <M1ssionText />
          <p style={{
            fontSize: "0.875rem",
            opacity: 0.4
          }}>
            © {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
