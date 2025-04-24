
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import { ArrowRight, Car, Diamond, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Nuovi componenti
import IntroAnimation from "@/components/intro/IntroAnimation";
import PresentationSection from "@/components/landing/PresentationSection";
import NextEventCountdown from "@/components/landing/NextEventCountdown";
import HowItWorks from "@/components/landing/HowItWorks";

const Index = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const navigate = useNavigate();

  // Impostazione della data per il countdown (un mese da oggi)
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  // Check if intro was shown before
  useEffect(() => {
    const introShown = localStorage.getItem('introShown');
    if (introShown) {
      setShowIntro(false);
      setIntroCompleted(true);
    } else {
      // Set after first viewing
      localStorage.setItem('introShown', 'true');
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setShowIntro(false);
  };

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
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {introCompleted && (
          <>
            <UnifiedHeader />

            {/* Spacer per header */}
            <div className="h-[72px] w-full" />

            {/* Bottone ACCEDI in alto a destra */}
            <motion.div 
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={handleLoginClick}
                className="flex items-center rounded-lg font-semibold text-xs shadow-lg transition-all duration-150 px-3 py-1.5 scale-70 transform origin-right"
                style={{
                  background: "linear-gradient(90deg, #00E5FF 0%, #007BFF 100%)",
                  color: "#000",
                  boxShadow: "0 1px 6px 0 rgba(0,229,255,0.4), 0 0.5px 2px #00E5FF",
                  transform: "scale(0.7)",
                  transformOrigin: "right"
                }}
              >
                <ArrowRight className="mr-1" size={14} />
                Accedi
              </Button>
            </motion.div>

            {/* Sezione Presentazione */}
            <PresentationSection visible={introCompleted} />

            {/* Countdown al prossimo evento */}
            <NextEventCountdown targetDate={nextEventDate} />

            {/* Come Funziona */}
            <HowItWorks onRegisterClick={handleRegisterClick} />

            {/* Auto in Palio */}
            <motion.section 
              className="py-20 px-4 bg-black w-full max-w-screen-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Auto di Lusso in Palio
              </motion.h2>

              <motion.p 
                className="text-center max-w-2xl mx-auto mb-12 text-white/70"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Ogni mese, M1SSION mette in palio un'auto di lusso. Lamborghini, Ferrari, Porsche e altre auto da sogno sono pronte per essere vinte.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[
                  { brand: 'Ferrari', color: '#FF0000', icon: <Car /> },
                  { brand: 'Lamborghini', color: '#FFC107', icon: <Car /> },
                  { brand: 'Porsche', color: '#00E5FF', icon: <Car /> },
                  { brand: 'Tesla', color: '#FFFFFF', icon: <Car /> }
                ].map((car, index) => (
                  <motion.div 
                    key={index}
                    className="glass-card hover:bg-white/10 transition-all relative overflow-hidden group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity" style={{ color: car.color }}>
                      {car.icon}
                      <Car size={80} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: car.color }}>{car.brand}</h3>
                    <p className="text-sm text-white/70 relative z-10">
                      Una delle auto più prestigiose al mondo potrebbe essere tua.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section 
              className="py-20 px-4 bg-gradient-to-b from-black to-[#050a14] w-full relative overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Particelle di sfondo animate */}
              <div className="absolute inset-0 z-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() * 6 + 2 + 'px',
                      height: Math.random() * 6 + 2 + 'px',
                      backgroundColor: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC107' : '#FF00FF',
                      boxShadow: i % 3 === 0 ? '0 0 10px #00E5FF' : i % 3 === 1 ? '0 0 10px #FFC107' : '0 0 10px #FF00FF',
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float-particle ${Math.random() * 10 + 10}s infinite linear`
                    }}
                  />
                ))}
              </div>

              <div className="max-w-screen-xl mx-auto relative z-10">
                <motion.h2 
                  className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] bg-clip-text text-transparent"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  Trasforma il Tuo Sogno in Realtà
                </motion.h2>

                <motion.p 
                  className="text-xl max-w-2xl mx-auto mb-10 text-center text-white/80"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  Non perdere l'opportunità di trasformare il tuo sogno in realtà. Unisciti a M1SSION oggi stesso e inizia il tuo viaggio verso l'auto dei tuoi sogni.
                </motion.p>

                <motion.div 
                  className="flex justify-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Button
                    className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black font-bold px-8 py-6 rounded-full transform transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                    size="lg"
                    onClick={handleRegisterClick}
                  >
                    Registrati Ora
                  </Button>
                </motion.div>

                {/* Icone decorative */}
                <div className="absolute left-10 top-10 text-[#00E5FF]/20 hidden lg:block">
                  <Shield size={60} />
                </div>
                <div className="absolute right-10 bottom-10 text-[#FF00FF]/20 hidden lg:block">
                  <Diamond size={60} />
                </div>
              </div>
            </motion.section>

            {/* Footer */}
            <footer className="py-12 px-4 bg-black w-full border-t border-white/10">
              <div className="max-w-screen-xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
                  <div className="mb-6 md:mb-0">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent">M1SSION</h2>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
