
import { motion } from "framer-motion";
import { Shield, Clock, Users, Map } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sicurezza Garantita",
    description: "Tutti gli eventi sono supervisionati dal nostro team di sicurezza. Ogni partecipante è verificato e tracciato."
  },
  {
    icon: Clock,
    title: "Eventi Mensili",
    description: "Ogni mese una nuova auto, una nuova caccia, una nuova possibilità. Non perdere l'occasione di partecipare."
  },
  {
    icon: Users,
    title: "Community Esclusiva",
    description: "Entra a far parte di una community selezionata di cacciatori di tesori e appassionati di auto di lusso."
  },
  {
    icon: Map,
    title: "Mappa In Tempo Reale",
    description: "Segui la caccia in tempo reale sulla nostra app. Vedi gli altri partecipanti e i loro progressi."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-[#0c0c20] to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-cyan-400 mb-2 text-lg font-light tracking-wider uppercase">Le nostre garanzie</h2>
          <h3 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-cyan mb-6">Perché Sceglierci</h3>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            M1SSION offre un'esperienza unica nel suo genere. Ecco perché siamo diversi da qualsiasi altra caccia al tesoro.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex gap-6 items-start p-6 glass-card hover:bg-white/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold mb-2 text-white">
                  {feature.title}
                </h4>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
