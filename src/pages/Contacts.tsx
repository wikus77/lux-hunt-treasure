
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import BackgroundParticles from "@/components/ui/background-particles";
import ContactInfo from "@/components/contacts/ContactInfo";
import ContactForm from "@/components/contacts/ContactForm";
import FaqSection from "@/components/contacts/FaqSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Check } from "lucide-react";

const Contacts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <UnifiedHeader />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]"></div>
      
      {/* Background effects */}
      <BackgroundParticles count={15} />
      
      {/* Main content */}
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Contatta </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">M1SSION</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Hai domande, suggerimenti o hai bisogno di assistenza? Siamo qui per te.
            </p>
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
              <AlertTitle className="text-cyan-300">Form di contatto attivo</AlertTitle>
              <AlertDescription className="text-white/80">
                Il nostro form di contatto è ora completamente funzionante. I messaggi vengono inviati direttamente al nostro team di supporto.
              </AlertDescription>
            </Alert>
          </motion.div>
          
          {/* Contact info and form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ContactInfo />
            </motion.div>
            
            {/* Contact form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ContactForm />
            </motion.div>
          </div>
          
          {/* FAQ Section */}
          <FaqSection />
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Contacts;
