
import React from "react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ParallaxImage } from "@/components/ui/parallax-image";

const features = [
  {
    id: 1,
    title: "Indizi in tempo reale",
    description: "Ricevi notifiche e aggiornamenti immediati sugli indizi disponibili e sullo stato della missione.",
    icon: "🔍"
  },
  {
    id: 2,
    title: "Mappa interattiva",
    description: "Naviga attraverso una mappa dettagliata che ti guida verso il premio finale con indicazioni precise.",
    icon: "🗺️"
  },
  {
    id: 3,
    title: "Community esclusiva",
    description: "Unisciti a una rete di appassionati che condividono la tua stessa passione per le auto di lusso e le sfide.",
    icon: "👥"
  },
  {
    id: 4,
    title: "Premi garantiti",
    description: "Ogni missione ha un vincitore sicuro. La tua determinazione può trasformarsi in un'auto da sogno.",
    icon: "🏆"
  }
];

const FeatureSection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-scroll-section>
      <div className="absolute inset-0 z-0">
        <ParallaxImage 
          src="/lovable-uploads/79b6f8b7-66b3-4dee-a705-0d3f0b1f16b9.png" 
          alt="Night city" 
          className="w-full h-full"
          imageClassName="w-full h-full object-cover opacity-30"
          speed={0.1}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4" data-scroll data-scroll-speed="0.05">
        <AnimatedSection className="text-center mb-16" delay={0.1} once>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="inline-block mb-4 py-2 px-4 bg-cyan-400/10 rounded-full text-cyan-400 text-sm uppercase tracking-wider"
          >
            Caratteristiche uniche
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-orbitron font-light mb-6">
            Un'esperienza <span className="text-cyan-400">immersiva</span>
          </h2>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            M1SSION combina tecnologia all'avanguardia, design futuristico e gameplay coinvolgente per offrirti un'esperienza unica nel suo genere.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection 
              key={feature.id}
              className="glass-card overflow-hidden group hover:bg-white/5 transition-all duration-500"
              delay={0.2 + index * 0.1}
              once
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <div className="p-8 relative">
                <div className="text-3xl mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl md:text-2xl font-orbitron mb-4 text-white">
                  {feature.title}
                </h3>
                
                <p className="text-white/70">{feature.description}</p>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 border border-cyan-400/20 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 right-8 w-24 h-24 border border-cyan-400/10 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <AnimatedSection delay={0.5} once>
            <blockquote className="italic text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              "La vera sfida non è solo arrivare per primo, ma interpretare correttamente gli indizi e risolvere gli enigmi che ti porteranno al premio finale."
            </blockquote>
            
            <div className="mt-6 text-cyan-400 font-medium">— Team M1SSION</div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
