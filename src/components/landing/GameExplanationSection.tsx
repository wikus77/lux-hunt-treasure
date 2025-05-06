
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle2 } from 'lucide-react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

const GameExplanationSection = () => {
  const { elementRef, isVisible } = useLazyLoad();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section ref={elementRef} className="py-16 px-4 bg-gradient-to-b from-blue-950/20 to-black/95 relative overflow-hidden">
      {/* Background parallax elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"
          data-parallax="background"
          data-parallax-speed="-0.05"
        ></div>
        
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: `radial-gradient(circle, rgba(0,229,255,0.${Math.floor(Math.random() * 2) + 1}) 0%, rgba(0,0,0,0) 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
              transform: `scale(${Math.random() * 1 + 0.5})`,
            }}
            data-parallax="background"
            data-parallax-speed={`-${0.1 + (i % 5) * 0.05}`}
          />
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
          data-parallax="scroll"
          data-parallax-speed="0.1"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Come Funziona M1SSION</h2>
          <p className="text-lg max-w-2xl mx-auto text-white/70 mb-8">
            Un gioco di abilità e intuizione che mette alla prova la tua capacità di pensare fuori dagli schemi
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rules.map((rule, index) => (
            <motion.div
              key={index}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              data-parallax="card"
              data-parallax-speed="0.05"
            >
              <div className="flex items-center mb-4">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold">{rule.title}</h3>
              </div>
              <p className="text-white/70">{rule.description}</p>
              <ul className="mt-4 space-y-2">
                {rule.points.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          data-parallax="scroll"
          data-parallax-speed="0.15"
        >
          <Button
            onClick={() => setShowDetails(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-[0_0_15px_rgba(123,46,255,0.5)] rounded-full"
          >
            <Info className="mr-2 h-4 w-4" />
            Regole Complete
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const rules = [
  {
    title: "Trova gli Indizi",
    description: "Cerca indizi nascosti nel gioco e nel mondo reale.",
    points: [
      "Segui le comunicazioni ufficiali per scoprire indizi sui social media.",
      "Risolvi enigmi e puzzle per avanzare nel gioco.",
      "Collabora con altri giocatori per trovare soluzioni."
    ]
  },
  {
    title: "Risolvi la Missione",
    description: "Ogni settimana una nuova missione con puzzle intriganti.",
    points: [
      "Completa le missioni entro la scadenza per guadagnare punti.",
      "Usa la tua intelligenza e creatività per risolvere enigmi complessi.",
      "Sblocca indizi bonus completando sfide extra."
    ]
  },
  {
    title: "Vinci Premi Incredibili",
    description: "I migliori giocatori possono vincere premi esclusivi.",
    points: [
      "Premio principale: Auto di lusso per il vincitore assoluto.",
      "Premi secondari: Orologi, tech all'avanguardia e viaggi esclusivi per i finalisti.",
      "Premi di partecipazione: Sconti e crediti di gioco per tutti."
    ]
  }
];

export default GameExplanationSection;
