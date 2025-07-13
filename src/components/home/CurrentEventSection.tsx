
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { currentEvent } from "@/data/eventData";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";
import FuturisticSectionTitle from "@/components/events/FuturisticSectionTitle";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const CurrentEventSection = () => {
  const navigate = useNavigate();

  // Animated title sequence variants
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Staggered element animations for each child
  const titleChildVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] }
    }
  };

  // Animation for the carousel images
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({ 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.8, 
        delay: 0.2 + i * 0.15,
        ease: [0.19, 1, 0.22, 1]
      } 
    })
  };

  return (
    <motion.section 
      className="w-full px-0 py-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={titleContainerVariants}
    >
      {/* Section Title with line animation */}
      <motion.div 
        className="mb-6 px-4 w-full flex items-center gap-2"
        variants={titleChildVariants}
      >
        <h2 className="gradient-text-cyan text-3xl font-bold font-orbitron">Missione Corrente</h2>
        <motion.div 
          className="h-px flex-1 bg-gradient-to-r from-cyan-400/10 via-cyan-400/50 to-cyan-400/10"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
      
      {/* Premium Carousel for car images */}
      <motion.div variants={titleChildVariants}>
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
                  variants={imageVariants}
                  custom={idx}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
                  }}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={img.url}
                      alt={img.description}
                      className="rounded-xl w-full max-w-md h-56 sm:h-64 object-cover"
                      style={{
                        filter: "drop-shadow(0 0 18px #1155ff44)",
                        transition: "all 0.5s ease-out"
                      }}
                    />
                    
                    {/* Animated overlay effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                    
                    {/* Animated border */}
                    <motion.div
                      className="absolute inset-0 rounded-xl border-4 border-[#00a3ff]/60"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      style={{
                        boxShadow: "0 0 32px 2px rgba(0, 163, 255, 0.6)",
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.p 
                  className="mt-4 text-base text-center text-[#c0caff] italic"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  style={{
                    textShadow: "0 0 8px rgba(30, 174, 219, 0.5)"
                  }}
                >
                  {img.description}
                </motion.p>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom navigation buttons with magnetic effect */}
          <div className="hidden md:block">
            <MagneticButton
              className="absolute -left-12 top-1/2 -translate-y-1/2 bg-black/30 border border-cyan-400/40 hover:bg-black/60 hover:border-cyan-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
              onClick={() => document.querySelector('.carousel-prev-event')?.dispatchEvent(new Event('click'))}
              strength={15}
            >
              <span className="sr-only">Previous</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </MagneticButton>
            
            <MagneticButton
              className="absolute -right-12 top-1/2 -translate-y-1/2 bg-black/30 border border-cyan-400/40 hover:bg-black/60 hover:border-cyan-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
              onClick={() => document.querySelector('.carousel-next-event')?.dispatchEvent(new Event('click'))}
              strength={15}
            >
              <span className="sr-only">Next</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M6.1584 3.13508C5.95694 3.32395 5.94673 3.64036 6.1356 3.84182L9.56499 7.49991L6.1356 11.158C5.94673 11.3594 5.95694 11.6759 6.1584 11.8647C6.35986 12.0536 6.67627 12.0434 6.86514 11.8419L10.6151 7.84182C10.7954 7.64949 10.7954 7.35042 10.6151 7.15808L6.86514 3.15808C6.67627 2.95663 6.35986 2.94642 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </MagneticButton>
            
            <div className="hidden">
              <CarouselPrevious className="carousel-prev-event" />
              <CarouselNext className="carousel-next-event" />
            </div>
          </div>
        </Carousel>
      </motion.div>
      
      {/* Event Information Card */}
      <motion.div
        className="mt-6 border-[2.5px] neon-border p-0 rounded-2xl shadow-2xl bg-gradient-to-br from-[#111124d8] via-[#1eaedb10] to-[#181641d8] overflow-hidden"
        variants={titleChildVariants}
        whileHover={{
          boxShadow: "0 0 28px 5px rgba(0, 163, 255, 0.4), 0 0 50px 8px rgba(155, 135, 245, 0.4)",
          transition: { duration: 0.4 }
        }}
        style={{
          boxShadow: "0 0 22px 3px rgba(0, 163, 255, 0.6), 0 0 44px 6px rgba(155, 135, 245, 0.6)",
          borderColor: "#00a3ff"
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111124d8] via-[#1eaedb10] to-[#181641d8]" />
        
        <div className="px-4 py-4 relative z-10">
          {/* Title with reveal animation */}
          <div className="overflow-hidden mb-2">
            <motion.p 
              className="text-lg text-center font-bold text-white"
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
            >
              {currentEvent.title}
            </motion.p>
          </div>
          
          {/* Description with reveal animation */}
          <div className="overflow-hidden mb-3">
            <motion.p 
              className="text-base text-center text-[#c0caff] italic"
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
            >
              {currentEvent.description}
            </motion.p>
          </div>
          
          {/* Prizes section */}
          <motion.div 
            className="mb-4"
            variants={titleChildVariants}
          >
            <motion.span 
              className="block text-base font-semibold text-[#9e8ade] mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Premi Misteriosi in Palio
            </motion.span>
            
            {/* Mystery prizes carousel */}
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true
              }}
            >
              <CarouselContent>
                {upcomingMysteryPrizes.map((prize, idx) => (
                  <CarouselItem key={idx} className="flex flex-col items-center justify-center md:basis-1/3 pl-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      whileHover={{ 
                        scale: 1.08,
                        y: -5,
                        transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
                      }}
                    >
                      <div className="overflow-hidden rounded-lg">
                        <motion.img
                          src={prize.imageUrl}
                          alt={prize.description}
                          className="rounded-lg w-32 h-20 object-cover border-2 border-[#00a3ff77] shadow-md mb-2 transition-all duration-300"
                          whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#c0caff] text-center block">{prize.description}</span>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ transformOrigin: "right" }}
        />
      </motion.div>
    </motion.section>
  );
};

export default CurrentEventSection;
