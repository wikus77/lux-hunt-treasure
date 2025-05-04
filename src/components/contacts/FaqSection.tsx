
import React from "react";
import { motion } from "framer-motion";

const FaqSection = () => {
  return (
    <motion.div 
      className="mt-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-orbitron font-bold mb-8 text-center text-white">Domande Frequenti</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-cyan-400 mb-3">Come posso cambiare il mio abbonamento?</h3>
          <p className="text-white/70">
            Puoi modificare il tuo piano di abbonamento in qualsiasi momento dalla sezione "Abbonamenti" nel tuo profilo. Il nuovo piano entrerà in vigore immediatamente.
          </p>
        </div>
        
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-cyan-400 mb-3">Posso annullare il mio abbonamento?</h3>
          <p className="text-white/70">
            Sì, puoi annullare il tuo abbonamento in qualsiasi momento dalla sezione "Abbonamenti". L'accesso rimarrà attivo fino alla fine del periodo di fatturazione corrente.
          </p>
        </div>
        
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-cyan-400 mb-3">Come funziona il sistema di vincita?</h3>
          <p className="text-white/70">
            Il vincitore è la prima persona che trova la posizione esatta dell'auto utilizzando la funzione Buzz. Il sistema verifica automaticamente la posizione e, se corretta, il vincitore viene notificato immediatamente.
          </p>
        </div>
        
        <div className="glass-card">
          <h3 className="text-xl font-semibold text-cyan-400 mb-3">Non ricevo gli indizi via email</h3>
          <p className="text-white/70">
            Controlla la cartella spam/promozioni della tua email. Se il problema persiste, contattaci tramite questo modulo e risolveremo il problema il prima possibile.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FaqSection;
