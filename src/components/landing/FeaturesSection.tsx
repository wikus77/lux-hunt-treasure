
import { motion } from "framer-motion";
import { Trophy, Map, Calendar, Bell } from "lucide-react";

interface FeaturesSectionProps {
  countdownCompleted?: boolean;
}

const FeaturesSection = ({ countdownCompleted = false }: FeaturesSectionProps) => {
  const features = [
    {
      icon: <Trophy className="w-10 h-10 text-yellow-400" />,
      title: "Premi di valore reale",
      description: "Auto di lusso, orologi esclusivi e altri oggetti di valore per i vincitori"
    },
    {
      icon: <Map className="w-10 h-10 text-cyan-400" />,
      title: "Caccia al tesoro moderna",
      description: "Una combinazione innovativa di enigmi digitali e ricerca nel mondo reale"
    },
    {
      icon: <Calendar className="w-10 h-10 text-violet-400" />,
      title: "Eventi settimanali",
      description: "Nuove missioni e sfide ogni settimana per mantenere alto l'entusiasmo"
    },
    {
      icon: <Bell className="w-10 h-10 text-red-400" />,
      title: "Notifiche in tempo reale",
      description: "Ricevi aggiornamenti immediati su nuovi indizi e sviluppi del gioco"
    }
  ];

  return (
    <section id="game-explanation" className="py-24 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Caratteristiche di M1SSION
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Scopri cosa rende M1SSION un'esperienza di gioco rivoluzionaria, combinando il mondo digitale con quello reale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-card p-6 flex items-start"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mr-4 p-3 rounded-full bg-black/30 border border-white/10 flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
