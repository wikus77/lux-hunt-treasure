
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { useRef } from "react";

// Import the new components
import { CarouselHeading } from "./carousel/CarouselHeading";
import { MissionCard } from "./carousel/MissionCard";
import { CarouselNavigation } from "./carousel/CarouselNavigation";
import { CarouselIndicators } from "./carousel/CarouselIndicators";
import { futurePrizes } from "./carousel/mission-data";

export default function FutureMissionsCarousel() {
  // Ref for parallax effect
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevClick = () => {
    document.querySelector('.carousel-prev')?.dispatchEvent(new Event('click'));
  };

  const handleNextClick = () => {
    document.querySelector('.carousel-next')?.dispatchEvent(new Event('click'));
  };

  return (
    <motion.section 
      className="w-full py-8 mt-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      ref={containerRef}
    >
      <CarouselHeading title="Prossime Missioni" />
      
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
              <MissionCard prize={prize} index={idx} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom navigation buttons */}
        <CarouselNavigation 
          onPrevClick={handlePrevClick} 
          onNextClick={handleNextClick} 
        />
        
        <div className="hidden">
          <CarouselPrevious className="carousel-prev" />
          <CarouselNext className="carousel-next" />
        </div>
      </Carousel>
      
      {/* Carousel indicators */}
      <CarouselIndicators count={futurePrizes.length} />
    </motion.section>
  );
}
