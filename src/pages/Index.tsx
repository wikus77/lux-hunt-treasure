
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";

const Index = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black">
      {/* Sticky, glassy header */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text">M1SSION</h1>
        {/* Spazio azioni/destra, opzionale */}
        <div />
      </header>
      {/* Spacer per header */}
      <div className="h-[72px] w-full" />

      {/* Hero Section */}
      <section className="w-full flex flex-col justify-center items-center text-center bg-black bg-cover bg-center px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          M1SSION
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-8">
          Unisciti a M1SSION: Il Tuo Sogno è a Portata di Mano
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white font-bold px-8 py-6 rounded-md"
            size="lg"
            onClick={handleRegisterClick}
          >
            Registrati Oggi
          </Button>
          <Button 
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white font-bold px-8 py-6 rounded-md"
            onClick={() => setIsVideoPlaying(true)}
            size="lg"
          >
            Scopri di più
          </Button>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="py-16 px-4 bg-black w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="glass-card text-center w-full">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
              <img src="/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png" alt="Registrati" className="w-10 h-10 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-2">Registrati</h3>
            <p className="text-muted-foreground">
              Crea un account gratuito per iniziare il tuo viaggio verso l'auto dei tuoi sogni.
            </p>
          </div>
          <div className="glass-card text-center w-full">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
              <img src="/lovable-uploads/a987ba21-940e-48cd-b999-c266de3f133c.png" alt="Indizi" className="w-10 h-10 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-2">Scopri gli Indizi</h3>
            <p className="text-muted-foreground">
              Ogni settimana ricevi indizi che ti avvicinano al premio finale.
            </p>
          </div>
          <div className="glass-card text-center w-full">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-projectx-deep-blue border border-projectx-neon-blue">
              <img src="/lovable-uploads/48b9a28f-59eb-4010-9bb2-37de88a4d7b1.png" alt="Premio" className="w-10 h-10 object-contain" />
            </div>
            <h3 className="text-xl font-bold mb-2">Vinci il Premio</h3>
            <p className="text-muted-foreground">
              Segui gli indizi, risolvi il mistero e vinci un'auto di lusso ogni mese.
            </p>
          </div>
        </div>
      </section>

      {/* Auto in Palio */}
      <section className="py-16 px-4 bg-black w-full">
        <h2 className="text-3xl font-bold mb-6 text-center neon-pink-text">
          Auto di Lusso in Palio
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
          Ogni mese, M1SSION mette in palio un'auto di lusso. Lamborghini, Ferrari, Porsche e altre auto da sogno sono pronte per essere vinte.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {['Ferrari', 'Lamborghini', 'Porsche', 'Tesla'].map((brand, index) => (
            <div key={index} className="glass-card text-center hover:neon-border transition-all duration-300 w-full">
              <h3 className="text-xl font-bold mb-2">{brand}</h3>
              <p className="text-sm text-muted-foreground">
                Una delle auto più prestigiose al mondo potrebbe essere tua.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-black w-full">
        <h2 className="text-3xl font-bold mb-4 animate-glow text-center">
          Trasforma il Tuo Sogno in Realtà
        </h2>
        <p className="text-xl max-w-2xl mx-auto mb-8 text-center">
          Non perdere l'opportunità di trasformare il tuo sogno in realtà. Unisciti a M1SSION oggi stesso e inizia il tuo viaggio verso l'auto dei tuoi sogni.
        </p>
        <div className="flex justify-center">
          <Button 
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white font-bold px-8 py-6 rounded-md"
            size="lg"
            onClick={handleRegisterClick}
          >
            Registrati Ora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black w-full">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold neon-text">M1SSION</h2>
          </div>
          <div className="flex space-x-4">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-white">Termini e Condizioni</Link>
            <Link to="/contacts" className="text-sm text-muted-foreground hover:text-white">Contatti</Link>
          </div>
        </div>
        <div className="mt-6 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2025 M1SSION. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
      
      {/* Age Verification Modal */}
      <AgeVerificationModal 
        open={showAgeVerification} 
        onClose={() => setShowAgeVerification(false)} 
        onVerified={handleAgeVerified} 
      />
    </div>
  );
};

export default Index;
