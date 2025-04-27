
import React from "react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Play } from "lucide-react";

const awardImages = [
  {
    id: 1,
    src: "/lovable-uploads/a89d300d-3adc-40dd-b57b-fcd6524154b6.png",
    alt: "Vincitore premiazione M1SSION"
  },
  {
    id: 2,
    src: "/lovable-uploads/591e28be-16ab-4b53-a236-356e5eece235.png",
    alt: "Consegna premio M1SSION"
  },
  {
    id: 3,
    src: "/lovable-uploads/1ec50208-3c88-47df-9ce8-2c4f306dad60.png",
    alt: "Vincitrice premiazione M1SSION"
  },
  {
    id: 4,
    src: "/lovable-uploads/0ea747d5-db90-45e1-b1bb-d1bd8a4bb869.png",
    alt: "Premiazione M1SSION con Lamborghini"
  }
];

const AwardsCeremony = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleNextImage = () => {
    setActiveIndex(prev => (prev + 1) % awardImages.length);
  };

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        handleNextImage();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 relative overflow-hidden" data-scroll-section>
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16" delay={0.1} once>
          <span className="inline-block py-2 px-4 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-medium mb-4">
            PREMIAZIONI MENSILI
          </span>
          <h2 className="text-4xl md:text-5xl font-orbitron font-light mb-6">
            Il <span className="text-yellow-400">sogno</span> diventa realtà
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Un'esperienza indimenticabile ti attende. Ogni mese premiamo i vincitori delle nostre sfide con auto da sogno.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="relative h-[60vh] rounded-2xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {awardImages.map((image, index) => (
              <motion.div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
                variants={itemVariants}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </motion.div>
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
              <div>
                <span className="text-xs text-white/60">{activeIndex + 1}/{awardImages.length}</span>
              </div>
              <MagneticButton
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlaying ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}
                onClick={() => setIsPlaying(!isPlaying)}
                strength={15}
              >
                <Play className="w-5 h-5" />
              </MagneticButton>
            </div>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <AnimatedSection direction="right" delay={0.2} once>
              <motion.div variants={itemVariants} className="glass-card">
                <h3 className="font-orbitron text-xl mb-4">Cerimonie di premiazione esclusive</h3>
                <p className="text-white/70">
                  Location prestigiose, hostess, fotografi e ogni dettaglio curato per rendere indimenticabile il momento della consegna.
                </p>
              </motion.div>
            </AnimatedSection>
            
            <AnimatedSection direction="right" delay={0.3} once>
              <motion.div variants={itemVariants} className="glass-card">
                <h3 className="font-orbitron text-xl mb-4">I vincitori delle precedenti edizioni</h3>
                <p className="text-white/70">
                  Persone normali che come te hanno partecipato e vinto auto di lusso grazie alla loro determinazione e intuito.
                </p>
              </motion.div>
            </AnimatedSection>
            
            <AnimatedSection direction="right" delay={0.4} once>
              <motion.div variants={itemVariants} className="flex justify-start">
                <MagneticButton
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  strength={20}
                >
                  Scopri le storie dei vincitori
                </MagneticButton>
              </motion.div>
            </AnimatedSection>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AwardsCeremony;
