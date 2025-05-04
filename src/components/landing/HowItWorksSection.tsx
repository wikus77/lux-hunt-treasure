
import { motion } from "framer-motion";
import { Search, Map, Trophy } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Trova gli Indizi",
    description: "Ogni mese vengono nascosti indizi nella città. Scova gli indizi e risolvi gli enigmi per avvicinarti al tesoro."
  },
  {
    icon: Map,
    title: "Caccia al Tesoro",
    description: "Usa le coordinate e i suggerimenti per trovare la posizione esatta. Usa l'app per seguire la mappa e visualizzare la tua posizione in tempo reale."
  },
  {
    icon: Trophy,
    title: "Vinci il Premio",
    description: "Trova per primo l'auto nascosta e diventa il vincitore. Ogni mese una nuova caccia, ogni mese una nuova possibilità di cambiare la tua vita."
  }
];

const HowItWorksSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),rgba(0,0,0,0)_70%)]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-purple-400 mb-2 text-lg font-light tracking-wider uppercase">Il processo</h2>
          <h3 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-multi mb-6">Come Funziona</h3>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            M1SSION reinventa la caccia al tesoro con tecnologia avanzata e premi esclusivi.
            Ecco come partecipare e avere la possibilità di vincere.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="glass-card hover:bg-white/5 transition-all duration-300 relative overflow-hidden group"
              variants={itemVariants}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500"></div>
              
              <div className="relative z-10 p-8">
                <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-black">
                  <step.icon className="w-8 h-8" />
                </div>
                
                <h4 className="text-2xl font-orbitron font-bold mb-4 text-white">
                  {step.title}
                </h4>
                
                <p className="text-white/70">
                  {step.description}
                </p>
              </div>
              
              {/* Step number in background */}
              <div className="absolute -bottom-10 -right-5 text-[120px] font-bold text-white/5">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
