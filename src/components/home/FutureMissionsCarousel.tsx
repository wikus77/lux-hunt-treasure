
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useRef } from "react";

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
  
  // Varianti di animazione per elementi in fade-in
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2 + i * 0.15 
      } 
    })
  };

  return (
    <motion.section 
      className="w-full py-4 mt-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      ref={containerRef}
    >
      <motion.div 
        className="mb-4 flex items-center gap-2 px-4"
        variants={fadeInUpVariants}
        custom={0}
      >
        <h2 className="gradient-text-cyan text-2xl font-bold font-orbitron">Prossime Missioni</h2>
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
                className="group relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple-400/80 bg-gradient-to-br from-black/80 to-purple-900/20 cursor-pointer"
                variants={fadeInUpVariants}
                custom={idx % 3 + 1}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 2,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                style={{perspective: "800px"}}
              >
                <motion.div
                  className="h-full w-full overflow-hidden"
                  whileHover={{
                    scale: 1.08,
                    transition: { duration: 0.6, ease: "easeOut" }
                  }}
                >
                  <img
                    src={prize.image}
                    alt={prize.name}
                    className="w-full h-44 sm:h-48 object-cover rounded-xl transition-transform duration-500"
                    style={{
                      filter: "drop-shadow(0 0 32px #9b87f5f7)",
                      transform: "perspective(600px) rotateY(4deg)"
                    }}
                  />
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-0 w-full px-4 py-2 bg-gradient-to-t from-purple-900/90 to-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                >
                  <motion.span 
                    className="block text-lg text-purple-300 font-bold animate-fade-in"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                  >
                    {prize.name}
                  </motion.span>
                  
                  <motion.span 
                    className="block text-sm text-white italic mb-1 animate-fade-in"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
                  >
                    {prize.description}
                  </motion.span>
                  
                  <motion.span 
                    className="inline-flex items-center gap-1 text-xs text-cyan-300 font-mono bg-white/10 px-2 py-0.5 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ 
                      backgroundColor: "rgba(255,255,255,0.2)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Calendar className="w-3 h-3" /> {prize.date}
                  </motion.span>
                </motion.div>
                
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl border-4 border-purple-400 neon-border animate-neon-pulse" />
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="hidden md:block">
          <CarouselPrevious className="-left-12 bg-black/30 border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300" />
          <CarouselNext className="-right-12 bg-black/30 border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300" />
        </div>
      </Carousel>
      
      {/* Indicatori di navigazione */}
      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: Math.min(6, futurePrizes.length) }).map((_, i) => (
          <motion.div 
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/30"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
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
