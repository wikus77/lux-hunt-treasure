
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BackgroundParticles from "@/components/ui/background-particles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Mail, Phone, MapPin } from "lucide-react";
import FaqSection from "@/components/contacts/FaqSection";
import SimpleContactForm from "@/components/contacts/SimpleContactForm";

const Contacts = () => {
  const navigate = useNavigate();
  const isBeforeLaunch = new Date() < new Date("2025-07-19T00:00:00");

  // Log component mounting to help debug routing issues
  useEffect(() => {
    console.log("Contacts page mounted");
    return () => {
      console.log("Contacts page unmounted");
    };
  }, []);

  // If we're before launch and the user tries to navigate to a restricted page, redirect them
  useEffect(() => {
    if (isBeforeLaunch) {
      // Listen for history changes to prevent navigation
      const handlePopState = () => {
        // If they try to navigate away using browser history, push them back to contacts
        if (window.location.pathname !== "/contact") {
          navigate("/contact");
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isBeforeLaunch, navigate]);

  console.log("Contacts page rendering");

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Background effects */}
      <BackgroundParticles count={15} />
      
      {/* Main content */}
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          
          {/* Hero section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Contattaci</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Hai bisogno di aiuto o vuoi contattare il team M1SSION? Usa i seguenti canali:
            </p>
          </motion.div>

          {/* Contact info sections */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <div className="flex items-center gap-3 text-white">
              <Mail className="text-cyan-400" />
              <span><strong>Email</strong>: support@m1ssion.com</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-1" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <span><strong>Social</strong>: @m1ssion.official su Instagram e TikTok</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <Check className="text-cyan-400" />
              <span><strong>Modulo di contatto</strong>: disponibile nell'app alla voce "Supporto"</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>FAQ</strong>: consulta la sezione "Aiuto" nell'app</span>
            </div>
          </motion.div>
          
          {/* Status Alert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Alert className="border border-cyan-500/30 bg-black/70 backdrop-blur-sm">
              <Check className="h-4 w-4 text-cyan-400" />
              <AlertTitle className="text-cyan-300">Orari di assistenza</AlertTitle>
              <AlertDescription className="text-white/80">
                Siamo disponibili dal lunedì al venerdì, dalle 9:00 alle 18:00.
              </AlertDescription>
            </Alert>
          </motion.div>
          
          {/* Contact info and form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <motion.div 
              className="lg:col-span-1 glass-card p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Info di Contatto</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <Mail className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Email</h3>
                    <a href="mailto:support@m1ssion.com" className="text-white/70 hover:text-cyan-400 transition-colors">
                      support@m1ssion.com
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <Phone className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Telefono</h3>
                    <a href="tel:+36706312023" className="text-white/70 hover:text-cyan-400 transition-colors">
                      +36 706312023
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <MapPin className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Indirizzo</h3>
                    <p className="text-white/70">
                      1077 Budapest,<br />
                      Izabella utca 2. Alagsor 1
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  Orari di assistenza:<br />
                  Lun-Ven: 9:00 - 18:00
                </p>
              </div>
            </motion.div>
            
            {/* Contact form */}
            <motion.div 
              className="lg:col-span-2 glass-card p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
              <SimpleContactForm />
            </motion.div>
          </div>
          
          {/* FAQ Section - Only shown if not in pre-launch mode or after launch */}
          {!isBeforeLaunch && <FaqSection />}
        </div>
      </main>
      
      {/* Footer - Simple version for pre-launch */}
      <div className="py-8 px-4 border-t border-white/10 bg-black/80 backdrop-blur">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          <p className="text-sm text-white/50 mt-4">
            © {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
