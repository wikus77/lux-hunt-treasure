
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import M1ssionText from "@/components/logo/M1ssionText";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  // Stili visibilità forzata
  React.useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "auto";

    console.log("Index page mounted and visible");
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <M1ssionText />
        </div>
        <Button
          onClick={handleLoginClick}
          variant="ghost"
          className="text-white hover:text-cyan-400 transition-colors"
        >
          Accedi
        </Button>
      </header>

      {/* Hero Section */}
      <section className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.h1 
          className="text-5xl sm:text-7xl font-orbitron font-bold mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            M1SSION
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          La caccia al tesoro più esclusiva d'Italia. 
          Ogni mese, una nuova missione, una nuova auto di lusso da vincere.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            onClick={handleRegisterClick}
            size="lg"
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:scale-[1.03] min-w-[200px]"
          >
            Inizia ora <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Come funziona
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-gray-900/50 rounded-lg">
              <div className="text-cyan-400 text-4xl font-bold mb-4">01</div>
              <h3 className="text-xl font-bold mb-2">Registrati</h3>
              <p className="text-white/70">Crea il tuo account M1SSION e preparati all'avventura.</p>
            </div>
            
            <div className="p-6 bg-gray-900/50 rounded-lg">
              <div className="text-cyan-400 text-4xl font-bold mb-4">02</div>
              <h3 className="text-xl font-bold mb-2">Trova Indizi</h3>
              <p className="text-white/70">Scopri gli indizi nascosti nelle città italiane e decifrali.</p>
            </div>
            
            <div className="p-6 bg-gray-900/50 rounded-lg">
              <div className="text-cyan-400 text-4xl font-bold mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">Vinci Premi</h3>
              <p className="text-white/70">Arriva per primo e vinci auto di lusso e premi esclusivi.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Preparati a vivere l'avventura
          </h2>
          <p className="text-xl mb-8 text-white/80">
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
      
      {/* Footer */}
      <footer className="py-10 px-4 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <M1ssionText />
            <p className="mt-4 md:mt-0 text-white/40 text-sm">
              © {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
