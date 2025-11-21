
import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface SectionProps {
  variants: any;
}

const GameRules: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="glass-card mb-12" variants={variants}>
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
  );
};

export default GameRules;
