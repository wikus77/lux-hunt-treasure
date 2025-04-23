import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import { ArrowRight } from "lucide-react";

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

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black">
      <UnifiedHeader />

      {/* Spacer per header */}
      <div className="h-[72px] w-full" />

      {/* Hero Section */}
      <section className="w-full flex flex-col justify-center items-center text-center px-6 py-24 md:py-32 relative">
        {/* Bottone ACCEDI in alto a destra, più piccolo e colorato come da screenshot */}
        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-20">
          <Button
            onClick={handleLoginClick}
            className="flex items-center rounded-lg font-semibold text-base shadow-lg transition-all duration-150 px-4 py-2"
            style={{
              background: "linear-gradient(90deg, #FFB142 0%, #FF7846 100%)",
              color: "#232323",
              boxShadow: "0 1px 6px 0 rgba(0,0,0,0.18), 0 0.5px 2px #ffcba4"
            }}
          >
            <ArrowRight className="mr-1" size={18} />
            Accedi
          </Button>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
          M1SSION
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-10 text-white/80 leading-relaxed">
          Unisciti a M1SSION: Il Tuo Sogno è a Portata di Mano
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white font-bold px-8 py-6 rounded-full transform transition-transform hover:scale-105"
            size="lg"
            onClick={handleRegisterClick}
          >
            Registrati Oggi
          </Button>
          <Button
            className="backdrop-blur-md bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold px-8 py-6 rounded-full transition-all"
            onClick={() => setIsVideoPlaying(true)}
            size="lg"
          >
            Scopri di più
          </Button>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="py-20 px-4 bg-black w-full max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
          Come Funziona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="glass-card hover-lift text-center w-full relative">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-gradient-to-r from-[#4361ee]/20 to-[#7209b7]/20 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center text-white font-bold text-xl">1</div>
            </div>
            <h3 className="text-xl font-bold mb-3">Registrati</h3>
            <p className="text-white/70">
              Crea un account gratuito per iniziare il tuo viaggio verso l'auto dei tuoi sogni.
            </p>
          </div>

          <div className="glass-card hover-lift text-center w-full relative">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-gradient-to-r from-[#4361ee]/20 to-[#7209b7]/20 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center text-white font-bold text-xl">2</div>
            </div>
            <h3 className="text-xl font-bold mb-3">Scopri gli Indizi</h3>
            <p className="text-white/70">
              Ogni settimana ricevi indizi che ti avvicinano al premio finale.
            </p>
          </div>

          <div className="glass-card hover-lift text-center w-full relative">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-gradient-to-r from-[#4361ee]/20 to-[#7209b7]/20 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center text-white font-bold text-xl">3</div>
            </div>
            <h3 className="text-xl font-bold mb-3">Vinci il Premio</h3>
            <p className="text-white/70">
              Segui gli indizi, risolvi il mistero e vinci un'auto di lusso ogni mese.
            </p>
          </div>
        </div>
      </section>

      {/* Auto in Palio */}
      <section className="py-20 px-4 bg-black w-full max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
          Auto di Lusso in Palio
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-12 text-white/70">
          Ogni mese, M1SSION mette in palio un'auto di lusso. Lamborghini, Ferrari, Porsche e altre auto da sogno sono pronte per essere vinte.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {['Ferrari', 'Lamborghini', 'Porsche', 'Tesla'].map((brand, index) => (
            <div key={index} className="glass-card hover-lift text-center">
              <h3 className="text-xl font-bold mb-2">{brand}</h3>
              <p className="text-sm text-white/70">
                Una delle auto più prestigiose al mondo potrebbe essere tua.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#120d1d] w-full">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
            Trasforma il Tuo Sogno in Realtà
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10 text-center text-white/80">
            Non perdere l'opportunità di trasformare il tuo sogno in realtà. Unisciti a M1SSION oggi stesso e inizia il tuo viaggio verso l'auto dei tuoi sogni.
          </p>
          <div className="flex justify-center">
            <Button
              className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white font-bold px-8 py-6 rounded-full transform transition-transform hover:scale-105"
              size="lg"
              onClick={handleRegisterClick}
            >
              Registrati Ora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black w-full border-t border-white/10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">M1SSION</h2>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Termini e Condizioni</Link>
              <Link to="/contacts" className="text-sm text-white/60 hover:text-white transition-colors">Contatti</Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center md:text-left">
            <p className="text-sm text-white/50">
              © 2025 M1SSION. Tutti i diritti riservati.
            </p>
          </div>
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
