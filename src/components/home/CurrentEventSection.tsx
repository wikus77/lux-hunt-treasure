
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { currentEvent } from "@/data/eventData";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";
import FuturisticSectionTitle from "@/components/events/FuturisticSectionTitle";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";

export const CurrentEventSection = () => {
  const navigate = useNavigate();

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
      className="w-full px-0 py-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div 
        className="mb-4 px-4 w-full"
        variants={fadeInUpVariants}
        custom={0}
      >
        <FuturisticSectionTitle>Evento Corrente</FuturisticSectionTitle>
      </motion.div>
      
      <motion.div 
        className="mb-6"
        variants={fadeInUpVariants}
        custom={1}
      >
        {/* Carousel immagini supercar migliorato */}
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {currentEvent.images.map((img, idx) => (
              <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                <motion.div 
                  className="w-full flex justify-center"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.4 }
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.description}
                    className="rounded-xl w-full max-w-md h-56 sm:h-64 object-cover border-4 border-[#00a3ff]/60 shadow-[0_0_32px_2px_#00a3ff99] 
                    dark:bg-[#181641]/80 bg-white/10 animate-fade-in"
                    style={{
                      filter: "drop-shadow(0 0 18px #1155ff44)",
                      transition: "all 0.5s ease-out"
                    }}
                  />
                </motion.div>
                <motion.p 
                  className="mt-4 text-base text-center text-[#c0caff] italic drop-shadow-[0_0_8px_#181641]"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{
                    textShadow: "0 0 8px #1eaedb80"
                  }}
                >
                  {img.description}
                </motion.p>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="hidden md:flex -left-12 bg-black/30 border-cyan-400/40 hover:bg-black/60 hover:border-cyan-400/70 text-white transition-all duration-300" />
          <CarouselNext className="hidden md:flex -right-12 bg-black/30 border-cyan-400/40 hover:bg-black/60 hover:border-cyan-400/70 text-white transition-all duration-300" />
        </Carousel>
      </motion.div>
      
      <motion.div
        className="glass-card border-[2.5px] neon-border p-0 rounded-2xl shadow-2xl animate-fade-in bg-gradient-to-br from-[#111124d8] via-[#1eaedb10] to-[#181641d8]"
        variants={fadeInUpVariants}
        custom={2}
        whileHover={{
          boxShadow: "0 0 28px 5px rgba(0, 163, 255, 0.65), 0 0 50px 8px rgba(155, 135, 245, 0.65), 0 1px 3px 0 rgba(18, 0, 69, 0.25)",
          transition: { duration: 0.4 }
        }}
        style={{
          boxShadow:
            "0 0 22px 3px #00a3ff99, 0 0 44px 6px #9b87f599, 0 1px 3px 0 #12004525",
          borderColor: "#00a3ff"
        }}
      >
        <div className="px-4 py-2">
          <motion.p 
            className="text-lg text-center font-bold text-white mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {currentEvent.title}
          </motion.p>
          
          <motion.p 
            className="text-base text-center text-[#c0caff] italic mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {currentEvent.description}
          </motion.p>
          
          {/* Premi misteriosi migliorati */}
          <div className="mb-3">
            <motion.span 
              className="block text-base font-semibold text-[#7E69AB] mb-1"
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Premi Misteriosi in Palio
            </motion.span>
            
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true
              }}
            >
              <CarouselContent>
                {upcomingMysteryPrizes.map((prize, idx) => (
                  <CarouselItem key={idx} className="flex flex-col items-center justify-center md:basis-1/3">
                    <motion.div
                      whileHover={{ 
                        scale: 1.08,
                        y: -5,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <img
                        src={prize.imageUrl}
                        alt={prize.description}
                        className="rounded-lg w-32 h-20 object-cover border-2 border-[#00a3ff77] shadow-md mb-2 transition-all duration-300"
                      />
                      <span className="text-xs text-[#c0caff] text-center block">{prize.description}</span>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CurrentEventSection;
