
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center text-center bg-hero-pattern bg-cover bg-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-glow">
          M1SSION <span className="text-projectx-neon-blue">X</span>
        </h1>
        
        <p className="text-xl md:text-2xl max-w-2xl mb-8">
          Unisciti a Project X: Il Tuo Sogno è a Portata di Mano
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register">
            <Button 
              className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white font-bold px-8 py-6 rounded-md"
              size="lg"
            >
              Registrati Oggi
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="border-projectx-neon-blue text-projectx-neon-blue px-8 py-6"
            onClick={() => setIsVideoPlaying(true)}
            size="lg"
          >
            Scopri di più
          </Button>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center neon-text">
            Come Funziona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
                <span className="text-2xl font-bold text-projectx-neon-blue">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Registrati</h3>
              <p className="text-muted-foreground">
                Crea un account gratuito per iniziare il tuo viaggio verso l'auto dei tuoi sogni.
              </p>
            </div>
            
            <div className="glass-card text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
                <span className="text-2xl font-bold text-projectx-neon-blue">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Scopri gli Indizi</h3>
              <p className="text-muted-foreground">
                Ogni settimana ricevi indizi che ti avvicinano al premio finale.
              </p>
            </div>
            
            <div className="glass-card text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
                <span className="text-2xl font-bold text-projectx-neon-blue">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Vinci il Premio</h3>
              <p className="text-muted-foreground">
                Segui gli indizi, risolvi il mistero e vinci un'auto di lusso ogni mese.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto in Palio */}
      <section className="py-16 px-6 bg-gradient-to-b from-black to-projectx-deep-blue">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center neon-pink-text">
            Auto di Lusso in Palio
          </h2>
          
          <p className="text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
            Ogni mese, M1SSION mette in palio un'auto di lusso. Lamborghini, Ferrari, Porsche e altre auto da sogno sono pronte per essere vinte.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Ferrari', 'Lamborghini', 'Porsche', 'Tesla'].map((brand, index) => (
              <div key={index} className="glass-card text-center hover:neon-border transition-all duration-300">
                <h3 className="text-xl font-bold mb-2">{brand}</h3>
                <p className="text-sm text-muted-foreground">
                  Una delle auto più prestigiose al mondo potrebbe essere tua.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 animate-glow">
            Trasforma il Tuo Sogno in Realtà
          </h2>
          
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Non perdere l'opportunità di trasformare il tuo sogno in realtà. Unisciti a M1SSION oggi stesso e inizia il tuo viaggio verso l'auto dei tuoi sogni.
          </p>
          
          <Link to="/register">
            <Button 
              className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white font-bold px-8 py-6 rounded-md"
              size="lg"
            >
              Registrati Ora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-projectx-deep-blue">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold neon-text">M1SSION</h2>
            </div>
            
            <div className="flex space-x-4">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Termini e Condizioni</span>
              <span className="text-sm text-muted-foreground">Contatti</span>
            </div>
          </div>
          
          <div className="mt-6 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 M1SSION. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

