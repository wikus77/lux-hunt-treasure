
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useRef } from "react";
import { MagneticButton } from "../ui/magnetic-button";

const futurePrizes = [
  {
    name: "Rolex Daytona Oro",
    image: "/lovable-uploads/a6250e9c-4a94-4357-b39c-e91ce9426e9e.png",
    description: "L'eleganza è la tua prossima conquista",
    date: "01/05/2025"
  },
  {
    name: "Rolex Daydate Oro Rosa (donna)",
    image: "/lovable-uploads/441b250e-b843-489a-9664-0b1f971fbc59.png",
    description: "Classe e rarità per chi merita di più",
    date: "01/06/2025"
  },
  {
    name: "Borsa Hermès Kelly",
    image: "/lovable-uploads/ddb0368c-4853-49a4-b8e2-70abf7594e0d.png",
    description: "Eleganza iconica al prossimo livello",
    date: "01/07/2025"
  },
  {
    name: "Borsa Hermès Birkin",
    image: "/lovable-uploads/a987ba21-940e-48cd-b999-c266de3f133c.png",
    description: "Lo stile che fa storia",
    date: "01/08/2025"
  },
  {
    name: "Ferrari Purosangue",
    image: "/lovable-uploads/b83c1e65-cd66-46ad-937b-60d7fd0c6a63.png",
    description: "Supercar da sogno, supera ogni limite",
    date: "01/09/2025"
  },
  {
    name: "Lamborghini Revuelto",
    image: "/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png",
    description: "Avanguardia e potenza in una nuova era",
    date: "01/10/2025"
  },
  {
    name: "Porsche Cayenne Coupe",
    image: "/lovable-uploads/507c2f6d-4ed0-46dc-b53c-79e1d5b7515e.png",
    description: "Una leggenda, ora è la tua occasione",
    date: "01/11/2025"
  },
  {
    name: "Aston Martin Vantage",
    image: "/lovable-uploads/b79099f5-31ab-44a3-b271-9cde8b7932e1.png",
    description: "Sportività ed eleganza dal Regno Unito",
    date: "01/12/2025"
  }
];

export default function FutureMissionsCarousel() {
  // Ref per parallax effect
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section 
      className="w-full py-8 mt-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      ref={containerRef}
    >
      <motion.div 
        className="mb-6 flex items-center gap-2 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="overflow-hidden">
          <motion.h2 
            className="gradient-text-cyan text-3xl font-bold font-orbitron"
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          >
            Prossime Missioni
          </motion.h2>
        </div>
        <motion.div 
          className="h-px flex-1 bg-gradient-to-r from-cyan-400/10 via-cyan-400/50 to-cyan-400/10"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true
        }}
      >
        <CarouselContent className="-ml-4">
          {futurePrizes.map((prize, idx) => (
            <CarouselItem 
              key={idx} 
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <motion.div
                className="group relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple-400/80 bg-gradient-to-br from-black/80 to-purple-900/20 cursor-pointer h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 * idx, ease: [0.19, 1, 0.22, 1] }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
                }}
              >
                {/* 3D rotation effect container */}
                <div 
                  className="hover:rotate-3d-animation h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Image with parallax effect */}
                  <div className="overflow-hidden">
                    <motion.img
                      src={prize.image}
                      alt={prize.name}
                      className="w-full h-44 sm:h-48 object-cover transition-transform duration-700"
                      style={{
                        filter: "drop-shadow(0 0 32px #9b87f5f7)"
                      }}
                      whileHover={{
                        scale: 1.08,
                        transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] }
                      }}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2 }}
                    />
                  </div>
                  
                  {/* Content overlay with staggered animations */}
                  <motion.div 
                    className="absolute bottom-0 w-full px-4 py-3 bg-gradient-to-t from-purple-900/90 to-transparent"
                  >
                    <div className="overflow-hidden mb-1">
                      <motion.span 
                        className="block text-lg text-purple-300 font-bold"
                        initial={{ y: "100%" }}
                        whileInView={{ y: "0%" }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.2 + 0.05 * idx,
                          ease: [0.19, 1, 0.22, 1]
                        }}
                      >
                        {prize.name}
                      </motion.span>
                    </div>
                    
                    <div className="overflow-hidden mb-2">
                      <motion.span 
                        className="block text-sm text-white italic"
                        initial={{ y: "100%" }}
                        whileInView={{ y: "0%" }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.5,
                          delay: 0.3 + 0.05 * idx,
                          ease: [0.19, 1, 0.22, 1] 
                        }}
                      >
                        {prize.description}
                      </motion.span>
                    </div>
                    
                    <motion.span 
                      className="inline-flex items-center gap-1 text-xs text-cyan-300 font-mono bg-white/10 px-2 py-0.5 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 + 0.05 * idx }}
                      whileHover={{ 
                        backgroundColor: "rgba(255,255,255,0.2)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Calendar className="w-3 h-3" /> {prize.date}
                    </motion.span>
                  </motion.div>
                </div>
                
                {/* Animated border glow effect */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="absolute inset-0 rounded-2xl border-4 border-purple-400 neon-border animate-neon-pulse" />
                </motion.div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom navigation buttons */}
        <div className="hidden md:block">
          <MagneticButton
            className="absolute -left-12 top-1/2 -translate-y-1/2 bg-black/30 border border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
            onClick={() => document.querySelector('.carousel-prev')?.dispatchEvent(new Event('click'))}
            strength={15}
          >
            <span className="sr-only">Previous</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </MagneticButton>
          
          <MagneticButton
            className="absolute -right-12 top-1/2 -translate-y-1/2 bg-black/30 border border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
            onClick={() => document.querySelector('.carousel-next')?.dispatchEvent(new Event('click'))}
            strength={15}
          >
            <span className="sr-only">Next</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M6.1584 3.13508C5.95694 3.32395 5.94673 3.64036 6.1356 3.84182L9.56499 7.49991L6.1356 11.158C5.94673 11.3594 5.95694 11.6759 6.1584 11.8647C6.35986 12.0536 6.67627 12.0434 6.86514 11.8419L10.6151 7.84182C10.7954 7.64949 10.7954 7.35042 10.6151 7.15808L6.86514 3.15808C6.67627 2.95663 6.35986 2.94642 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </MagneticButton>
          
          <div className="hidden">
            <CarouselPrevious className="carousel-prev" />
            <CarouselNext className="carousel-next" />
          </div>
        </div>
      </Carousel>
      
      {/* Carousel indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: Math.min(6, futurePrizes.length) }).map((_, i) => (
          <motion.div 
            key={i}
            className="w-2 h-2 rounded-full bg-white/30"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
            whileHover={{ 
              backgroundColor: "rgba(155, 135, 245, 0.7)",
              scale: 1.3, 
              transition: { duration: 0.2 }
            }}
          />
        ))}
      </div>
    </motion.section>
  );
}
