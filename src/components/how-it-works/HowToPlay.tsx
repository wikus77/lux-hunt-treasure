
import React from "react";
import { motion } from "framer-motion";

interface SectionProps {
  variants: any;
}

const HowToPlay: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="glass-card mb-12" variants={variants}>
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
  );
};

export default HowToPlay;
