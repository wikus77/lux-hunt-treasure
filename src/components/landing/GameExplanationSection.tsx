
import { motion } from "framer-motion";
import { Award, MapPin, Target, Trophy, Clock, Star } from "lucide-react";

const GameExplanationSection = () => {
  const rules = [
    {
      icon: <MapPin className="w-6 h-6 text-[#00E5FF]" />,
      title: "Caccia al tesoro interattiva",
      description: "M1SSION è una caccia al tesoro moderna che combina enigmi digitali e ricerca nel mondo reale"
    },
    {
      icon: <Target className="w-6 h-6 text-[#FFC107]" />,
      title: "Indizi settimanali",
      description: "Ogni settimana riceverai nuovi indizi che ti guideranno verso il premio finale"
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#FF00FF]" />,
      title: "Premi di lusso",
      description: "Auto di lusso come Ferrari, Lamborghini e Porsche sono tra i premi principali del gioco"
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      title: "Tempo limitato",
      description: "Ogni missione ha un tempo limitato, quindi la strategia è fondamentale"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: "Classifiche e competizione",
      description: "Competi contro altri giocatori e guadagna punti per salire in classifica"
    },
    {
      icon: <Award className="w-6 h-6 text-green-400" />,
      title: "Premi garantiti",
      description: "Tutti i partecipanti hanno la possibilità di vincere premi, indipendentemente dalla posizione in classifica"
    }
  ];

  return (
    <motion.section 
      className="py-16 px-4 bg-gradient-to-b from-[#090909] to-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Come Funziona?
        </motion.h2>

        <motion.p 
          className="text-center max-w-2xl mx-auto mb-12 text-white/70"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          M1SSION è un'esperienza di gioco rivoluzionaria che combina enigmi, abilità e competizione per vincere premi di lusso reali
        </motion.p>

        {/* Game rules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule, index) => (
            <motion.div
              key={index}
              className="glass-card p-6 h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 rounded-full bg-black/50 border border-white/10 w-12 h-12 flex items-center justify-center">
                  {rule.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{rule.title}</h3>
                <p className="text-white/70 text-sm flex-grow">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prize information */}
        <motion.div 
          className="mt-16 glass-card p-6 md:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4 text-center text-white">Cosa puoi vincere</h3>
          
          <div className="space-y-4">
            <div className="bg-black/30 border border-white/5 rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2 text-[#FF0000]">Premio principale</h4>
              <p className="text-white/80">Auto di lusso come Ferrari, Lamborghini e altre supercar. Il premio principale è riservato al vincitore assoluto della competizione.</p>
            </div>
            
            <div className="bg-black/30 border border-white/5 rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2 text-[#FFC107]">Premi secondari</h4>
              <p className="text-white/80">Orologi di lusso, dispositivi tech all'avanguardia, viaggi esclusivi e altri premi di alta qualità per i finalisti.</p>
            </div>
            
            <div className="bg-black/30 border border-white/5 rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2 text-[#00E5FF]">Premi di partecipazione</h4>
              <p className="text-white/80">Tutti i partecipanti hanno accesso a sconti esclusivi, crediti di gioco e possibilità di vincere premi settimanali anche se non raggiungono la finale.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default GameExplanationSection;
