
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import BackgroundParticles from "@/components/ui/background-particles";
import { Car, Trophy, MapPin, Calendar, Users, Shield, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      <UnifiedHeader />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]"></div>
      
      {/* Background effects */}
      <BackgroundParticles count={20} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06071b]/80 via-transparent to-[#06071b]/80 z-[-1]"></div>
      
      {/* Hero section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-orbitron font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">HOW </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">M1SSION </span>
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">WORKS</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/70 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Scopri le regole del gioco, come partecipare e vincere un'auto di lusso ogni mese
          </motion.p>
        </div>
      </section>
      
      {/* Main content */}
      <motion.section 
        className="py-12 px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          {/* Game concept */}
          <motion.div className="glass-card mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Concept del Gioco</h2>
            <p className="text-white/80 mb-6">
              M1SSION è una caccia al tesoro globale che combina tecnologia, intuizione e strategia. Ogni mese, una nuova auto di lusso viene nascosta virtualmente da qualche parte nel mondo. I partecipanti devono scoprire la sua posizione interpretando gli indizi che vengono rilasciati progressivamente.
            </p>
            <div className="bg-white/5 p-6 rounded-lg">
              <p className="text-yellow-400 text-xl font-light tracking-wide text-center">
                "Non è solo un gioco, è una missione"
              </p>
            </div>
          </motion.div>
          
          {/* How to play */}
          <motion.div className="glass-card mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Come Partecipare</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                  <span className="text-black font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Registrazione</h3>
                  <p className="text-white/70">
                    Crea un account su M1SSION per iniziare la tua avventura. La registrazione è gratuita, ma per partecipare attivamente è necessario scegliere un piano di abbonamento.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                  <span className="text-black font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Abbonamento</h3>
                  <p className="text-white/70">
                    Scegli il tuo piano di abbonamento tra Silver, Gold o Black. Ogni livello offre vantaggi diversi come priorità di accesso agli indizi, accesso a zone di ricerca esclusive e supporto dedicato.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                  <span className="text-black font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Caccia agli Indizi</h3>
                  <p className="text-white/70">
                    Gli indizi vengono rilasciati periodicamente durante il mese. Puoi riceverli tramite l'app, notifiche push o email. Alcuni indizi sono accessibili solo a determinate fasce di abbonamento.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                  <span className="text-black font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Trovare l'Auto</h3>
                  <p className="text-white/70">
                    Utilizza la mappa interattiva per cercare l'auto nascosta. Quando pensi di aver trovato la posizione corretta, utilizza la funzione "Buzz" per confermare la tua risposta.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Rules */}
          <motion.div className="glass-card mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Regole del Gioco</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-3 items-start">
                <Shield className="text-yellow-400 shrink-0 mt-1" size={20} />
                <p className="text-white/80">
                  Un solo tentativo "Buzz" al giorno per profilo utente gratuito. Usa il tuo Buzz con saggezza dopo aver analizzato attentamente gli indizi.
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <Shield className="text-yellow-400 shrink-0 mt-1" size={20} />
                <p className="text-white/80">
                  Gli utenti devono avere un abbonamento attivo per poter utilizzare la funzione Buzz e partecipare alla competizione.
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <Shield className="text-yellow-400 shrink-0 mt-1" size={20} />
                <p className="text-white/80">
                  La prima persona a trovare la posizione esatta dell'auto con la funzione Buzz vince il premio mensile.
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <Shield className="text-yellow-400 shrink-0 mt-1" size={20} />
                <p className="text-white/80">
                  Condividere o vendere indizi ad altri partecipanti è severamente vietato e può comportare la squalifica.
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <Shield className="text-yellow-400 shrink-0 mt-1" size={20} />
                <p className="text-white/80">
                  M1SSION si riserva il diritto di modificare le regole o i premi in qualsiasi momento. Eventuali modifiche verranno comunicate a tutti gli utenti.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Prizes */}
          <motion.div className="glass-card mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Premi in Palio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 p-6 rounded-xl">
                <Car className="text-yellow-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Premio Principale</h3>
                <p className="text-white/70">
                  L'auto di lusso del mese. Ogni mese viene messa in palio un'auto diversa, dal valore di centinaia di migliaia di euro.
                </p>
                <p className="text-cyan-400 mt-2 text-sm">
                  Ferrari, Lamborghini, Porsche e altre supercar di lusso.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 p-6 rounded-xl">
                <Trophy className="text-yellow-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Premi Secondari</h3>
                <p className="text-white/70">
                  Esperienze di guida su pista, viaggi di lusso, upgrade dell'abbonamento e altri premi esclusivi per i classificati dopo il vincitore.
                </p>
              </div>
            </div>
            
            <div className="luxury-cars-showcase bg-black/30 border-2 border-purple-500/50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2 text-center">Auto in Palio Quest'Anno</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                <div className="text-center">
                  <div className="car-logo-container ferrari-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/85332ca5-c65b-45b2-a615-f082fa033670.png" 
                      alt="Ferrari Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#FF0000] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">SF90 Stradale</p>
                </div>
                <div className="text-center">
                  <div className="car-logo-container lambo-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/1ae73dae-49f8-4541-8b68-4526a0d1d4cf.png" 
                      alt="Lamborghini Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#FFC107] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">Huracán STO</p>
                </div>
                <div className="text-center">
                  <div className="car-logo-container porsche-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/adbaf0b2-3ae6-4134-a0e5-2cd8c932326a.png" 
                      alt="Porsche Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#CCCCCC] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">911 GT3 RS</p>
                </div>
                <div className="text-center">
                  <div className="car-logo-container mclaren-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/b78bdba7-b7f1-446a-918b-44479c0a572f.png" 
                      alt="McLaren Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#0284c7] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">765LT Spider</p>
                </div>
                <div className="text-center">
                  <div className="car-logo-container aston-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/28fac653-b8fe-4d2e-9c9f-2d9f321f21fb.png" 
                      alt="Aston Martin Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#10b981] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">Valkyrie</p>
                </div>
                <div className="text-center lg:hidden">
                  <div className="car-logo-container mercedes-logo-container w-[18.4px] h-[18.4px] mx-auto rounded-full flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/a290aca5-7e14-4ff3-bd4e-4d4fa6b22c1e.png" 
                      alt="Mercedes Logo" 
                      className="car-logo w-[13.8px] h-[13.8px] object-contain"
                    />
                    <div className="absolute inset-0 rounded-full bg-transparent border-2 border-[#808080] opacity-50 animate-ping"></div>
                  </div>
                  <p className="text-white/60 text-sm">AMG GT Black</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* FAQ */}
          <motion.div className="glass-card" variants={itemVariants}>
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Domande Frequenti</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Quanto costa partecipare?</h3>
                <p className="text-white/70">
                  La registrazione è gratuita, ma per partecipare attivamente è necessario sottoscrivere un abbonamento. I piani partono da €3,99 al mese per il piano Silver e arrivano fino a €9,99 al mese per il piano Black.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Posso vincere se vivo all'estero?</h3>
                <p className="text-white/70">
                  Sì, M1SSION è un gioco globale. Non importa dove ti trovi nel mondo, se trovi l'auto, vinci il premio. Le spese di spedizione o di trasferimento dell'auto saranno a tuo carico.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Come vengono verificati i vincitori?</h3>
                <p className="text-white/70">
                  Quando un partecipante trova la posizione esatta dell'auto, il sistema verifica automaticamente la correttezza. Il vincitore dovrà poi completare un processo di verifica dell'identità per confermare la vittoria.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Posso giocare in team?</h3>
                <p className="text-white/70">
                  Sì, M1SSION permette la formazione di team fino a 5 persone. Ogni membro del team deve avere un abbonamento attivo. In caso di vittoria, il premio verrà assegnato al capitano del team.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Call to Action */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-orbitron font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Pronto a </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Iniziare?</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/70 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Entra in M1SSION e inizia la tua caccia all'auto dei tuoi sogni
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-6 rounded-full text-lg font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
            >
              Unisciti alla Missione <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <LandingFooter />
    </div>
  );
};

export default HowItWorks;
