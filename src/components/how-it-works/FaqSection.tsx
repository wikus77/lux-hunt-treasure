
import React from "react";
import { motion } from "framer-motion";

interface SectionProps {
  variants: any;
}

const FaqSection: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="glass-card" variants={variants}>
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
  );
};

export default FaqSection;
