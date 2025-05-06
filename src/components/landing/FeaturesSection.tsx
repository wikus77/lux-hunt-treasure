
import React from "react";
import { motion } from "framer-motion";
import { Award, Clock, Gift, Star } from "lucide-react";

const featuresList = [
  {
    icon: Star,
    title: "Esperienza Unica",
    description: "Un'avventura immersiva che combina indagini in tempo reale e caccia al tesoro digitale."
  },
  {
    icon: Award,
    title: "Premi Esclusivi",
    description: "Vinci premi reali e esperienze uniche completando le missioni e risolvendo gli enigmi."
  },
  {
    icon: Clock,
    title: "Tempo Limitato",
    description: "Ogni missione ha un tempo limitato. La strategia e la velocità sono fondamentali."
  },
  {
    icon: Gift,
    title: "Bonus Iniziali",
    description: "Iscriviti prima del lancio e ricevi crediti gratuiti e vantaggi esclusivi."
  }
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="w-full py-16 px-4 bg-black/40">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
            Scopri <span className="text-cyan-400">M1SSION</span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Un'esperienza di gioco rivoluzionaria che unisce caccia al tesoro, enigmi e premi esclusivi
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuresList.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="feature-card"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
